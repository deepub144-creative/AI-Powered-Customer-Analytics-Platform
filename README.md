# AI-Powered-Customer-Intelligence-Platform

# 📊 AI Powered Customer Intelligence Platform



An end-to-end AI and Machine Learning project that helps businesses analyze customer behavior, predict churn, segment customers, and forecast future sales through an interactive React dashboard and FastAPI backend.



🔗 Live Dashboard: https://ai-powered-customer-analytics-platf.vercel.app/






📌 Project Overview


This project was built as an advanced customer analytics platform for business intelligence and decision support. It covers the complete data science lifecycle — from data ingestion and preprocessing to machine learning modeling, forecasting, reporting, and deployment.



- Dataset: Retail Customer Transaction Dataset
- Segmentation Algorithm: K-Means Clustering
- Churn Model: Classification Model (Scikit-learn)
- Forecasting Model:Prophet Time-Series Forecasting
- Backend:FastAPI REST API
- Frontend: React + Vite Dashboard
- Deployment: Vercel (Frontend) & Render/Railway/AWS (Backend)



✨ Features



- 👥 Customer Segmentation using RFM analysis
- ⚠️ Churn Risk Prediction with probability scoring
- 📈 Sales Forecasting for future revenue trends
- 📂 CSV Upload Analytics  with automatic column detection
- 📄 PDF Business Report Generation
- 🌍 Responsive Dashboard  optimized for desktop and mobile
- 💱 Multi-Currency Revenue Display
- 🤖 AI-driven customer intelligence insights



🛠️ Tech Stack

![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Scikit-Learn](https://img.shields.io/badge/scikit--learn-F7931E?style=for-the-badge&logo=scikitlearn&logoColor=white)
![Pandas](https://img.shields.io/badge/Pandas-150458?style=for-the-badge&logo=pandas&logoColor=white)
![NumPy](https://img.shields.io/badge/NumPy-013243?style=for-the-badge&logo=numpy&logoColor=white)
![Prophet](https://img.shields.io/badge/Prophet-0052CC?style=for-the-badge&logo=meta&logoColor=white)
![Plotly](https://img.shields.io/badge/Plotly-3F4F75?style=for-the-badge&logo=plotly&logoColor=white)
![ReportLab](https://img.shields.io/badge/ReportLab-PDF-red?style=for-the-badge)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=black)
![VS Code](https://img.shields.io/badge/VS_Code-007ACC?style=for-the-badge&logo=visualstudiocode&logoColor=white)
![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)


Repository Structure

```text
customer-intelligence-platform/
│
├── api/                         # FastAPI backend
│   └── main.py
│
├── ci-dashboard-react/          # React frontend dashboard
│   ├── src/
│   └── vite.config.js
│
├── data/                        # Customer datasets
│   └── master_customers.csv
│
├── models/                      # Trained ML models
│   ├── churn_model.joblib
│   ├── kmeans_model.joblib
│   ├── rfm_scaler.joblib
│   ├── churn_features.joblib
│   └── forecast_model.joblib
│
├── notebooks/                   # EDA & model development
├── requirements.txt
└── README.md
