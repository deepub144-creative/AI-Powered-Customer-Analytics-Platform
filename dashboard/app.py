import streamlit as st
import requests
import pandas as pd
import os

st.set_page_config(page_title="AI Powered Customer Intelligence Platform", layout="wide")

API_URL = os.environ.get("API_URL", "http://127.0.0.1:8000")
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Approximate exchange rates (GBP is the dataset's native currency)
CURRENCY_RATES = {
    "GBP (£)": {"symbol": "£", "rate": 1.0},
    "INR (₹)": {"symbol": "₹", "rate": 127.0},
    "USD ($)": {"symbol": "$", "rate": 1.33},
    "EUR (€)": {"symbol": "€", "rate": 1.17},
}

st.title("📊 Customer Intelligence Platform")
st.caption("Segmentation, Churn Prediction & Sales Forecasting")

# Currency selector (applies to all money values on the page)
selected_currency = st.selectbox("Display currency", list(CURRENCY_RATES.keys()), index=0)
currency_symbol = CURRENCY_RATES[selected_currency]["symbol"]
currency_rate = CURRENCY_RATES[selected_currency]["rate"]
st.caption(f"Note: values converted from GBP at an approximate fixed rate (1 GBP ≈ {currency_symbol}{currency_rate}). Rates fluctuate daily.")

def fmt_currency(gbp_value):
    return f"{currency_symbol}{gbp_value * currency_rate:,.0f}"

# Quick test: hit the root endpoint to confirm API connectivity
try:
    response = requests.get(f"{API_URL}/")
    st.success(f"API Status: {response.json()['status']}")
except Exception as e:
    st.error(f"Cannot connect to API: {e}")

st.divider()
st.header("👥 Customer Segmentation")

@st.cache_data
def load_customers():
    return pd.read_csv(os.path.join(BASE_DIR, '..', 'data', 'master_customers.csv'))

customers_df = load_customers()

col1, col2 = st.columns(2)

with col1:
    st.subheader("Segment Distribution")
    segment_counts = customers_df['Segment'].value_counts()
    st.bar_chart(segment_counts)

with col2:
    st.subheader(f"Average Revenue by Segment ({selected_currency})")
    avg_revenue = customers_df.groupby('Segment')['Monetary'].mean().sort_values(ascending=False)
    avg_revenue_converted = avg_revenue * currency_rate
    st.bar_chart(avg_revenue_converted)

st.subheader("Segment Summary Table")
segment_summary = customers_df.groupby('Segment').agg(
    CustomerCount=('CustomerID', 'count'),
    AvgRecency=('Recency', 'mean'),
    AvgFrequency=('Frequency', 'mean'),
    AvgMonetary=('Monetary', 'mean')
).sort_values('AvgMonetary', ascending=False)

segment_summary['AvgMonetary'] = (segment_summary['AvgMonetary'] * currency_rate).round(0)
segment_summary = segment_summary.round(1)
segment_summary.rename(columns={'AvgMonetary': f'AvgMonetary ({currency_symbol})'}, inplace=True)

st.dataframe(segment_summary, use_container_width=True)

st.divider()
st.header("⚠️ Churn Risk Lookup")

customer_id_input = st.number_input("Enter Customer ID", min_value=0, value=12347, step=1)

if st.button("Predict Churn Risk"):
    try:
        response = requests.get(f"{API_URL}/churn-predict/{customer_id_input}")
        if response.status_code == 200:
            result = response.json()

            col1, col2 = st.columns(2)
            with col1:
                st.metric("Churn Probability", f"{result['churn_probability']*100:.1f}%")
            with col2:
                risk = result['risk_level']
                color = "🔴" if risk == "High" else "🟡" if risk == "Medium" else "🟢"
                st.metric("Risk Level", f"{color} {risk}")
        else:
            st.error("Customer not found. Try an ID between 12346 and 18287.")
    except Exception as e:
        st.error(f"Error connecting to API: {e}")

st.divider()
st.header("📈 Sales Forecast")

forecast_days = st.slider("Forecast horizon (days)", min_value=7, max_value=90, value=30, step=7)

try:
    response = requests.get(f"{API_URL}/forecast", params={"days": forecast_days})
    if response.status_code == 200:
        forecast_data = response.json()["predictions"]
        forecast_df = pd.DataFrame(forecast_data)
        forecast_df['date'] = pd.to_datetime(forecast_df['date'])
        forecast_df = forecast_df.set_index('date')
        forecast_df['predicted_revenue_converted'] = forecast_df['predicted_revenue'] * currency_rate

        st.line_chart(forecast_df['predicted_revenue_converted'])

        col1, col2, col3 = st.columns(3)
        with col1:
            st.metric("Avg Daily Revenue (forecast)", fmt_currency(forecast_df['predicted_revenue'].mean()))
        with col2:
            st.metric("Peak Day Revenue", fmt_currency(forecast_df['predicted_revenue'].max()))
        with col3:
            st.metric("Total Forecasted Revenue", fmt_currency(forecast_df['predicted_revenue'].sum()))
    else:
        st.error("Could not fetch forecast")
except Exception as e:
    st.error(f"Error connecting to API: {e}")