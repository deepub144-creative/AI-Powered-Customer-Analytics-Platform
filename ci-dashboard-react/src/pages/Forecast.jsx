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
  const generateFallbackData = (numDays) => {
    const baseDate = new Date();
    const result = [];
    for (let i = 1; i <= numDays; i++) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() + i);
      const dayOfWeek = d.getDay();
      const seasonFactor = dayOfWeek === 0 || dayOfWeek === 6 ? 0.3 : 1.0;
      const baseRev = 22000 + Math.sin(i / 3) * 8000 + Math.random() * 3000;
      result.push({
        date: d.toISOString().slice(5, 10),
        revenue: Math.round(baseRev * seasonFactor)
      });
    }
    return result;
  };

  const fetchForecast = () => {
    setLoading(true);
    setError(null);
    axios.get(`${API_URL}/forecast`, { params: { days }, timeout: 60000 })
      .then(res => {
        const formatted = res.data.predictions.map(p => ({
          date: p.date.slice(5),
          revenue: p.predicted_revenue
        }));
        setData(formatted);
        setLoading(false);
      })
      .catch(err => {
        console.warn('Forecast API unreachable, loading estimated preview data:', err);
        // Use fallback data so the dashboard UI remains fully functional
        setData(generateFallbackData(days));
        if (err.request && !err.response) {
          setError('Backend server on Render is waking up from sleep mode (~30s). Showing preview forecast data below.');
        } else {
          setError('Could not connect to live API. Showing preview forecast data.');
        }
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchForecast();
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

      {loading && (
        <div style={{ color: C.textMuted, fontSize: '14px', padding: '16px 0' }}>
          ⏳ Fetching Prophet model forecast... <em>(If the Render backend is sleeping, cold-start takes ~30s)</em>
        </div>
      )}

      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          color: '#e8940c', fontSize: '13px', background: 'rgba(232,148,12,0.10)',
          border: '1px solid rgba(232,148,12,0.3)', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px'
        }}>
          <span>⚠️ {error}</span>
          <button onClick={fetchForecast} style={{
            background: C.accent, color: '#fff', border: 'none', borderRadius: '6px',
            padding: '6px 12px', fontSize: '12px', cursor: 'pointer', fontWeight: 600
          }}>
            Retry Connection
          </button>
        </div>
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