import { useState, useContext } from 'react';
import axios from 'axios';
import { Search, AlertCircle } from 'lucide-react';
import { CurrencyContext } from '../App';

const API_URL = 'http://localhost:8000';

const C = {
  cardBg: '#151823',
  cardBorder: '#2a2e3a',
  inputBg: '#0f1117',
  inputBorder: '#33384a',
  textPrimary: '#f0f1f3',
  textMuted: '#8a8f98',
  accent: '#5b5fef',
  accentHover: '#4a4dd9',
};

const riskColor = {
  High: { bg: 'rgba(229,72,77,0.12)', text: '#e5484d' },
  Medium: { bg: 'rgba(232,148,12,0.12)', text: '#e8940c' },
  Low: { bg: 'rgba(31,169,113,0.12)', text: '#1fa971' },
};

export default function ChurnLookup() {
  const { currency, rates } = useContext(CurrencyContext);
  const { symbol, rate } = rates[currency];

  const [customerId, setCustomerId] = useState('12347');
  const [result, setResult] = useState(null);
  const [customerInfo, setCustomerInfo] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLookup = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setCustomerInfo(null);
    try {
      const [churnRes, infoRes] = await Promise.all([
        axios.get(`${API_URL}/churn-predict/${customerId}`),
        axios.get(`${API_URL}/customer/${customerId}`)
      ]);
      setResult(churnRes.data);
      setCustomerInfo(infoRes.data); // raw GBP monetary value stays as-is here
    } catch (err) {
      setError('Customer not found. Try an ID between 12346 and 18287.');
    }
    setLoading(false);
  };

  return (
    <div style={{ width: '100%' }}>
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .fade-card { animation: fadeInUp 0.35s ease both; }
        .cl-input { transition: border-color 0.15s ease; }
        .cl-input:focus { border-color: ${C.accent} !important; outline: none; }
        .cl-btn { transition: background 0.15s ease, transform 0.1s ease; }
        .cl-btn:hover:not(:disabled) { background: ${C.accentHover} !important; }
        .cl-btn:active:not(:disabled) { transform: scale(0.97); }
        .cl-metric { transition: transform 0.15s ease; }
        .cl-metric:hover { transform: translateY(-2px); }
      `}</style>

      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '4px', color: C.textPrimary }}>
        Churn Risk Lookup
      </h1>
      <p style={{ color: C.textMuted, fontSize: '14px', marginBottom: '24px' }}>
        Live prediction from the Random Forest model (ROC-AUC 0.82)
      </p>

      <div className="fade-card" style={{
        background: C.cardBg, borderRadius: '12px', border: `1px solid ${C.cardBorder}`,
        padding: '24px', marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <input
            className="cl-input"
            type="number"
            value={customerId}
            onChange={e => setCustomerId(e.target.value)}
            placeholder="Enter Customer ID"
            style={{
              flex: 1, padding: '10px 14px', borderRadius: '8px', color: C.textPrimary,
              border: `1px solid ${C.inputBorder}`, background: C.inputBg, fontSize: '14px', outline: 'none'
            }}
          />
          <button
            className="cl-btn"
            onClick={handleLookup}
            disabled={loading}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 20px', borderRadius: '8px', border: 'none',
              background: C.accent, color: '#fff', fontWeight: 600,
              fontSize: '14px', cursor: 'pointer', opacity: loading ? 0.7 : 1
            }}
          >
            <Search size={16} /> {loading ? 'Checking...' : 'Predict'}
          </button>
        </div>

        {error && (
          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#e5484d', fontSize: '14px' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}
      </div>

      {result && customerInfo && (
        <div className="fade-card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
          <MetricCard label="Churn Probability" value={`${(result.churn_probability * 100).toFixed(1)}%`} />
          <MetricCard
            label="Risk Level"
            value={result.risk_level}
            bg={riskColor[result.risk_level].bg}
            color={riskColor[result.risk_level].text}
          />
          <MetricCard label="Segment" value={customerInfo.segment} />
          <MetricCard label="Recency (days)" value={customerInfo.recency_days} />
          <MetricCard label="Frequency" value={customerInfo.frequency} />
          <MetricCard label={`Monetary (${symbol})`} value={`${symbol}${(customerInfo.monetary * rate).toLocaleString(undefined, { maximumFractionDigits: 0 })}`} />
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value, bg, color }) {
  return (
    <div className="cl-metric" style={{
      background: bg || C.cardBg, borderRadius: '12px',
      border: `1px solid ${C.cardBorder}`, padding: '20px'
    }}>
      <div style={{ fontSize: '13px', color: C.textMuted, fontWeight: 500, marginBottom: '8px' }}>{label}</div>
      <div style={{ fontSize: '22px', fontWeight: 700, color: color || C.textPrimary }}>{value}</div>
    </div>
  );
}