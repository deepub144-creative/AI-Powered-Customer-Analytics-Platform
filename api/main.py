from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import joblib
import os
import io
import json

app = FastAPI(title="Customer Intelligence Platform API")

# CORS: allow local dev origins, plus the deployed frontend via FRONTEND_URL env var.
# Set FRONTEND_URL in Render's environment variables once you have your Vercel URL,
# e.g. FRONTEND_URL=https://ci-dashboard.vercel.app
frontend_url = os.environ.get("FRONTEND_URL")

allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
if frontend_url:
    allowed_origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

churn_model = joblib.load(os.path.join(BASE_DIR, '..', 'models', 'churn_model.joblib'))
kmeans_model = joblib.load(os.path.join(BASE_DIR, '..', 'models', 'kmeans_model.joblib'))
rfm_scaler = joblib.load(os.path.join(BASE_DIR, '..', 'models', 'rfm_scaler.joblib'))
churn_features = joblib.load(os.path.join(BASE_DIR, '..', 'models', 'churn_features.joblib'))
forecast_model = joblib.load(os.path.join(BASE_DIR, '..', 'models', 'forecast_model.joblib'))
customers = pd.read_csv(os.path.join(BASE_DIR, '..', 'data', 'master_customers.csv'))


@app.get("/")
def root():
    return {"status": "Customer Intelligence Platform API is running"}


@app.get("/customer/{customer_id}")
def get_customer(customer_id: int):
    row = customers[customers['CustomerID'] == customer_id]
    if row.empty:
        raise HTTPException(status_code=404, detail="Customer not found")

    record = row.iloc[0]
    return {
        "customer_id": int(record['CustomerID']),
        "segment": record['Segment'],
        "recency_days": int(record['Recency']),
        "frequency": int(record['Frequency']),
        "monetary": float(record['Monetary']),
        "churned": bool(record['Churned'])
    }


@app.get("/churn-predict/{customer_id}")
def predict_churn(customer_id: int):
    row = customers[customers['CustomerID'] == customer_id]
    if row.empty:
        raise HTTPException(status_code=404, detail="Customer not found")

    X = row[churn_features]
    churn_probability = churn_model.predict_proba(X)[0][1]

    return {
        "customer_id": customer_id,
        "churn_probability": round(float(churn_probability), 3),
        "risk_level": "High" if churn_probability > 0.6 else "Medium" if churn_probability > 0.3 else "Low"
    }


@app.get("/forecast")
def get_forecast(days: int = 30):
    future = forecast_model.make_future_dataframe(periods=days)
    forecast = forecast_model.predict(future)
    forecast['yhat'] = forecast['yhat'].clip(lower=0)

    result = forecast[['ds', 'yhat']].tail(days)
    return {
        "forecast_days": days,
        "predictions": [
            {"date": str(row['ds'].date()), "predicted_revenue": round(row['yhat'], 2)}
            for _, row in result.iterrows()
        ]
    }


# ---------- Dynamic column detection ----------

COLUMN_ALIASES = {
    "invoice": ["invoice", "invoiceno", "invoice number", "order id", "orderid", "transaction id"],
    "stockcode": ["stockcode", "sku", "productcode", "product id", "item code"],
    "quantity": ["quantity", "qty", "units"],
    "invoicedate": ["invoicedate", "date", "orderdate", "order date", "transaction date"],
    "price": ["price", "unitprice", "unit price", "amount", "cost"],
    "customerid": ["customer id", "customerid", "customer_id", "cust id", "client id"],
}


def auto_detect_columns(columns):
    normalized = {c: c.strip().lower().replace('_', ' ') for c in columns}
    mapping = {}
    for field, aliases in COLUMN_ALIASES.items():
        match = None
        for orig, norm in normalized.items():
            if norm in aliases:
                match = orig
                break
        mapping[field] = match
    return mapping


@app.post("/detect-columns")
async def detect_columns(file: UploadFile = File(...)):
    contents = await file.read()
    df = pd.read_csv(io.BytesIO(contents), nrows=5)
    mapping = auto_detect_columns(df.columns.tolist())
    return {
        "columns_found": df.columns.tolist(),
        "suggested_mapping": mapping,
        "all_required_detected": all(mapping.values())
    }


def process_uploaded_csv(df, mapping):
    rename_map = {
        mapping['invoice']: 'Invoice',
        mapping['stockcode']: 'StockCode',
        mapping['quantity']: 'Quantity',
        mapping['invoicedate']: 'InvoiceDate',
        mapping['price']: 'Price',
        mapping['customerid']: 'Customer ID',
    }
    df = df.rename(columns=rename_map)

    df['InvoiceDate'] = pd.to_datetime(df['InvoiceDate'])
    df = df.dropna(subset=['Customer ID'])
    df = df[~df['Invoice'].astype(str).str.startswith('C')]
    df = df[(df['Quantity'] > 0) & (df['Price'] > 0)]
    df['TotalPrice'] = df['Quantity'] * df['Price']
    df['Customer ID'] = df['Customer ID'].astype(str)

    snapshot = df['InvoiceDate'].max() + pd.Timedelta(days=1)
    rfm = df.groupby('Customer ID').agg(
        Recency=('InvoiceDate', lambda x: (snapshot - x.max()).days),
        Frequency=('Invoice', 'nunique'),
        Monetary=('TotalPrice', 'sum')
    ).reset_index()

    scaled = rfm_scaler.transform(rfm[['Recency', 'Frequency', 'Monetary']])
    rfm['Cluster'] = kmeans_model.predict(scaled)
    names = {2: 'Champions', 3: 'Loyal Customers', 0: 'Potential Loyalists', 1: 'At Risk'}
    rfm['Segment'] = rfm['Cluster'].map(names)

    daily = df.groupby(df['InvoiceDate'].dt.date)['TotalPrice'].sum().reset_index()
    daily.columns = ['ds', 'y']
    daily['ds'] = pd.to_datetime(daily['ds'])

    return rfm, daily


@app.post("/analyze-upload")
async def analyze_upload(file: UploadFile = File(...), mapping: str = None):
    contents = await file.read()
    df = pd.read_csv(io.BytesIO(contents))

    col_mapping = json.loads(mapping) if mapping else auto_detect_columns(df.columns.tolist())
    if not all(col_mapping.values()):
        raise HTTPException(status_code=422, detail="Could not detect all required columns. Please map them manually.")

    rfm, daily = process_uploaded_csv(df, col_mapping)

    from prophet import Prophet
    m = Prophet(yearly_seasonality=True, weekly_seasonality=True, daily_seasonality=False)
    m.fit(daily)
    future = m.make_future_dataframe(periods=30)
    fc = m.predict(future)
    fc['yhat'] = fc['yhat'].clip(lower=0)

    return {
        "total_customers": len(rfm),
        "segment_counts": rfm['Segment'].value_counts().to_dict(),
        "avg_monetary_by_segment": rfm.groupby('Segment')['Monetary'].mean().round(2).to_dict(),
        "forecast_next_30_days": fc[['ds', 'yhat']].tail(30).assign(
            ds=lambda x: x['ds'].astype(str)
        ).to_dict('records')
    }


@app.post("/generate-report")
async def generate_report(file: UploadFile = File(...), mapping: str = None):
    from reportlab.lib.pagesizes import A4
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    from reportlab.lib.styles import ParagraphStyle
    from reportlab.lib import colors
    from reportlab.lib.units import inch

    contents = await file.read()
    df = pd.read_csv(io.BytesIO(contents))

    col_mapping = json.loads(mapping) if mapping else auto_detect_columns(df.columns.tolist())
    if not all(col_mapping.values()):
        raise HTTPException(status_code=422, detail="Could not detect all required columns. Please map them manually.")

    rfm, daily = process_uploaded_csv(df, col_mapping)

    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4, topMargin=0.7 * inch)
    styles_title = ParagraphStyle('title', fontName='Times-Bold', fontSize=18, spaceAfter=4)
    styles_sub = ParagraphStyle('sub', fontName='Times-Italic', fontSize=11, textColor=colors.grey, spaceAfter=20)
    styles_body = ParagraphStyle('body', fontName='Times-Roman', fontSize=11, leading=16)
    styles_h2 = ParagraphStyle('h2', fontName='Times-Bold', fontSize=13, spaceBefore=16, spaceAfter=8)

    elems = [
        Paragraph("AI Powered Customer Analytics Platform", styles_title),
        Paragraph("By Mr. Deepu B", styles_sub),
        Paragraph(f"Report generated for uploaded dataset ({len(rfm)} customers analyzed)", styles_body),
        Paragraph("Customer Segmentation Summary", styles_h2),
    ]

    seg_counts = rfm['Segment'].value_counts()
    table_data = [["Segment", "Customers", "Avg Monetary (£)"]]
    for seg in seg_counts.index:
        avg_m = rfm[rfm['Segment'] == seg]['Monetary'].mean()
        table_data.append([seg, str(seg_counts[seg]), f"£{avg_m:,.2f}"])

    t = Table(table_data, hAlign='LEFT')
    t.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, 0), 'Times-Bold'),
        ('FONTNAME', (0, 1), (-1, -1), 'Times-Roman'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('BACKGROUND', (0, 0), (-1, 0), colors.whitesmoke),
    ]))
    elems.append(t)
    elems.append(Spacer(1, 20))

    doc.build(elems)
    pdf_bytes = buf.getvalue()
    buf.close()

    return Response(content=pdf_bytes, media_type="application/pdf", headers={
        "Content-Disposition": "attachment; filename=customer_analytics_report.pdf"
    })