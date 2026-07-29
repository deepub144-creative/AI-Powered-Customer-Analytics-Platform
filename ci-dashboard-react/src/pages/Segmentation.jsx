import { useContext } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CurrencyContext } from '../App';

const C = {
  cardBg: '#151823',
  cardBorder: '#2a2e3a',
  rowBorder: '#20232e',
  textPrimary: '#f0f1f3',
  textMuted: '#8a8f98',
};

// Static segment data — kept in raw GBP; converted at render time
const segmentCounts = [
  { segment: 'Potential Loyalists', count: 2996 },
  { segment: 'At Risk', count: 1868 },
  { segment: 'Loyal Customers', count: 812 },
  { segment: 'Champions', count: 202 },
];

const segmentRevenueGBP = [
  { segment: 'Champions', avgRevenue: 20695 },
  { segment: 'Loyal Customers', avgRevenue: 5903 },
  { segment: 'Potential Loyalists', avgRevenue: 1203 },
  { segment: 'At Risk', avgRevenue: 671 },
];

const summaryTableGBP = [
  { segment: 'Champions', count: 202, recency: 37.2, frequency: 34.1, monetary: 20695.4 },
  { segment: 'Loyal Customers', count: 812, recency: 45.0, frequency: 14.8, monetary: 5903.2 },
  { segment: 'Potential Loyalists', count: 2996, recency: 83.9, frequency: 3.8, monetary: 1202.9 },
  { segment: 'At Risk', count: 1868, recency: 475.3, frequency: 2.0, monetary: 670.7 },
];

export default function Segmentation() {
  const { currency, rates } = useContext(CurrencyContext);
  const { symbol, rate } = rates[currency];

  const segmentRevenue = segmentRevenueGBP.map(r => ({ ...r, avgRevenue: Math.round(r.avgRevenue * rate) }));
  const summaryTable = summaryTableGBP.map(r => ({ ...r, monetary: r.monetary * rate }));

  return (
    <div style={{ width: '100%' }}>
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .fade-card { animation: fadeInUp 0.35s ease both; }
        .seg-row { transition: background 0.15s ease; }
        .seg-row:hover { background: #1b1e2a; }
      `}</style>

      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '4px', color: C.textPrimary }}>
        Customer Segmentation
      </h1>
      <p style={{ color: C.textMuted, fontSize: '14px', marginBottom: '24px' }}>
        RFM analysis + KMeans clustering across 5,878 customers
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <ChartCard title="Segment Distribution">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={segmentCounts} layout="vertical" margin={{ left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#2a2e3a" />
              <XAxis type="number" tick={{ fill: C.textMuted }} />
              <YAxis type="category" dataKey="segment" width={130} tick={{ fontSize: 12, fill: C.textMuted }} />
              <Tooltip contentStyle={{ background: '#1f2230', border: `1px solid ${C.cardBorder}`, borderRadius: '8px', color: C.textPrimary }} />
              <Bar dataKey="count" fill="#5b5fef" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title={`Average Revenue by Segment (${symbol})`}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={segmentRevenue} layout="vertical" margin={{ left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#2a2e3a" />
              <XAxis type="number" tick={{ fill: C.textMuted }} />
              <YAxis type="category" dataKey="segment" width={130} tick={{ fontSize: 12, fill: C.textMuted }} />
              <Tooltip
                formatter={v => `${symbol}${v.toLocaleString()}`}
                contentStyle={{ background: '#1f2230', border: `1px solid ${C.cardBorder}`, borderRadius: '8px', color: C.textPrimary }}
              />
              <Bar dataKey="avgRevenue" fill="#1fa971" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Segment Summary">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', color: C.textPrimary }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.cardBorder}`, textAlign: 'left' }}>
              <th style={{ padding: '10px 8px', color: C.textMuted, fontWeight: 500 }}>Segment</th>
              <th style={{ padding: '10px 8px', color: C.textMuted, fontWeight: 500 }}>Customers</th>
              <th style={{ padding: '10px 8px', color: C.textMuted, fontWeight: 500 }}>Avg Recency (days)</th>
              <th style={{ padding: '10px 8px', color: C.textMuted, fontWeight: 500 }}>Avg Frequency</th>
              <th style={{ padding: '10px 8px', color: C.textMuted, fontWeight: 500 }}>Avg Monetary ({symbol})</th>
            </tr>
          </thead>
          <tbody>
            {summaryTable.map(row => (
              <tr key={row.segment} className="seg-row" style={{ borderBottom: `1px solid ${C.rowBorder}` }}>
                <td style={{ padding: '10px 8px', fontWeight: 500 }}>{row.segment}</td>
                <td style={{ padding: '10px 8px' }}>{row.count.toLocaleString()}</td>
                <td style={{ padding: '10px 8px' }}>{row.recency}</td>
                <td style={{ padding: '10px 8px' }}>{row.frequency}</td>
                <td style={{ padding: '10px 8px' }}>{symbol}{row.monetary.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </ChartCard>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="fade-card" style={{ background: C.cardBg, borderRadius: '12px', border: `1px solid ${C.cardBorder}`, padding: '20px' }}>
      <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px', color: C.textPrimary }}>{title}</h3>
      {children}
    </div>
  );
}