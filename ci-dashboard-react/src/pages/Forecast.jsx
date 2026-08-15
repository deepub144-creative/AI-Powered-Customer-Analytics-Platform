import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CurrencyContext } from '../App';

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const C = {
  cardBg: '#151823',
  cardBorder: '#2a2e3a',
  textPrimary: '#f0f1f3',
  textMuted: '#8a8f98',
  accent: '#5b5fef',
  danger: '#e5484d',
  dangerBg: 'rgba(229,72,77,0.10)',
  dangerBorder: 'rgba(229,72,77,0.3)',
};

export default function Forecast() {
  const { currency, rates } = useContext(CurrencyContext);
  const { symbol, rate } = rates[currency];   // <-- look up symbol/rate from the rates object

  const [days, setDays] = useState(30);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    axios.get(`${API_URL}/forecast`, { params: { days } })
      .then(res => {
        const formatted = res.data.predictions.map(p => ({
          date: p.date.slice(5),
          revenue: p.predicted_revenue // raw GBP value, unconverted
        }));
        setData(formatted);
        setLoading(false);
      })
      .catch(err => {
        let message = 'Could not fetch forecast.';
        if (err.response) {
          message = `Server error ${err.response.status}: ${err.response.data?.detail || err.response.statusText}`;
        } else if (err.request) {
          message = 'No response from API — check that the backend is running on ' + API_URL;
        } else {
          message = `Request setup error: ${err.message}`;
        }
        console.error('Forecast fetch failed:', err);
        setError(message);
        setLoading(false);
      });
  }, [days]);

  const fmt = (v) => `${symbol}${Math.round(v * rate).toLocaleString()}`;

  const avg = data.length ? data.reduce((s, d) => s + d.revenue, 0) / data.length : 0;
  const peak = data.length ? Math.max(...data.map(d => d.revenue)) : 0;
  const total = data.length ? data.reduce((s, d) => s + d.revenue, 0) : 0;

  return (
    <div style={{ width: '100%' }}>
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .fade-card { animation: fadeInUp 0.35s ease both; }
        .fc-slider { accent-color: ${C.accent}; }
      `}</style>

      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '4px', color: C.textPrimary }}>
        Sales Forecast
      </h1>
      <p style={{ color: C.textMuted, fontSize: '14px', marginBottom: '24px' }}>
        Prophet time-series model — trend + weekly/yearly seasonality
      </p>

      <div className="fade-card" style={{ background: C.cardBg, borderRadius: '12px', border: `1px solid ${C.cardBorder}`, padding: '24px', marginBottom: '20px' }}>
        <label style={{ fontSize: '14px', fontWeight: 500, color: C.textPrimary }}>
          Forecast horizon: <strong>{days} days</strong>
        </label>
        <input
          className="fc-slider"
          type="range" min="7" max="90" step="7" value={days}
          onChange={e => setDays(Number(e.target.value))}
          style={{ width: '100%', marginTop: '10px' }}
        />
      </div>

      {loading && <p style={{ color: C.textMuted, fontSize: '14px' }}>Loading forecast…</p>}
      {error && (
        <p style={{ color: C.danger, fontSize: '14px', background: C.dangerBg, border: `1px solid ${C.dangerBorder}`, padding: '12px', borderRadius: '8px' }}>
          {error}
        </p>
      )}

      {!loading && !error && (
        <>
          <div className="fade-card" style={{ background: C.cardBg, borderRadius: '12px', border: `1px solid ${C.cardBorder}`, padding: '20px', marginBottom: '20px' }}>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2e3a" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: C.textMuted }} />
                <YAxis tick={{ fontSize: 11, fill: C.textMuted }} />
                <Tooltip
                  formatter={v => fmt(v)}
                  contentStyle={{ background: '#1f2230', border: `1px solid ${C.cardBorder}`, borderRadius: '8px', color: C.textPrimary }}
                />
                <Line type="monotone" dataKey="revenue" stroke="#5b5fef" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="fade-card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
            <MetricCard label="Avg Daily Revenue" value={fmt(avg)} />
            <MetricCard label="Peak Day Revenue" value={fmt(peak)} />
            <MetricCard label="Total Forecasted Revenue" value={fmt(total)} />
          </div>
        </>
      )}
    </div>
  );
}

function MetricCard({ label, value }) {
  return (
    <div style={{ background: C.cardBg, borderRadius: '12px', border: `1px solid ${C.cardBorder}`, padding: '20px' }}>
      <div style={{ fontSize: '13px', color: C.textMuted, fontWeight: 500, marginBottom: '8px' }}>{label}</div>
      <div style={{ fontSize: '22px', fontWeight: 700, color: C.textPrimary }}>{value}</div>
    </div>
  );
}