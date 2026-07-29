# 📊 AI Powered Customer Intelligence Platform

An end-to-end customer analytics platform that helps businesses understand customer behavior, predict churn, segment customers, and forecast future sales using Machine Learning and interactive dashboards.

🔗 Live React Dashboard :  
🔗 API Documentation :



🚀 Features

👥 Customer Segmentation
- RFM (Recency, Frequency, Monetary) analysis
- K-Means clustering
- Automatic segment labeling:
  - Champions
  - Loyal Customers
  - Potential Loyalists
  - At Risk

⚠️ Churn Prediction
- Predicts probability of customer churn
- Risk classification:
  - High
  - Medium
  - Low

📈 Sales Forecasting
- Time-series forecasting using Prophet
- Future revenue prediction for customizable time horizons

📂 CSV Upload Analytics
- Upload retail transaction datasets
- Automatic column detection
- Dynamic customer analytics generation

📄 PDF Report Generation
- Business-ready downloadable analytics report

🌐 Responsive Dashboard
- Modern React + Vite frontend
- Mobile-friendly interface


🛠️ Tech Stack

🎨 Frontend
<p align="left">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" width="50" title="React"/>
  <img src="https://vitejs.dev/logo.svg" width="50" title="Vite"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg" width="50" title="HTML5"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg" width="50" title="CSS3"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" width="50" title="JavaScript"/>
</p>

⚙️ Backend
<p align="left">
  <img src="https://fastapi.tiangolo.com/img/logo-margin/logo-teal.png" width="120" title="FastAPI"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" width="50" title="Python"/>
</p>

🤖 Machine Learning & Data Science
<p align="left">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/pandas/pandas-original.svg" width="50" title="Pandas"/>
  <img src="https://upload.wikimedia.org/wikipedia/commons/0/05/Scikit_learn_logo_small.svg" width="60" title="Scikit-learn"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/numpy/numpy-original.svg" width="50" title="NumPy"/>
  <img src="https://raw.githubusercontent.com/facebook/prophet/main/docs/static/prophet_logo.png" width="70" title="Prophet"/>
</p>

📊 Visualization & Reporting
<p align="left">
  <img src="https://images.plot.ly/logo/new-branding/plotly-logomark.png" width="50" title="Plotly"/>
  <img src="https://www.reportlab.com/rsrc/images/logo2.gif" width="120" title="ReportLab"/>
</p>

🗄️ Database / Data Storage
<p align="left">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg" width="50" title="MySQL"/>
</p>

☁️ Deployment & Tools
<p align="left">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg" width="50" title="Docker"/>
  <img src="https://www.vectorlogo.zone/logos/vercel/vercel-icon.svg" width="50" title="Vercel"/>
  <img src="https://www.vectorlogo.zone/logos/render/render-icon.svg" width="50" title="Render"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg" width="50" title="Git"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg" width="50" title="GitHub"/>
  <img src="https://code.visualstudio.com/assets/images/code-stable.png" width="50" title="VS Code"/>
</p>



📂 Project Structure


customer-intelligence-platform/
│
├── api/                    # FastAPI backend
│   └── main.py
│
├── ci-dashboard-react/     # React frontend
│   ├── src/
│   └── vite.config.js
│
├── data/
│   └── master_customers.csv
│
├── models/
│   ├── churn_model.joblib
│   ├── kmeans_model.joblib
│   ├── rfm_scaler.joblib
│   ├── churn_features.joblib
│   └── forecast_model.joblib
│
├── notebooks/              # EDA & model development
├── requirements.txt
└── README.md
```
