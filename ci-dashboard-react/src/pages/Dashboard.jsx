import { useContext } from 'react';
import { Users, TrendingUp, AlertTriangle, DollarSign } from 'lucide-react';
import { ThemeContext } from '../App';
import bgVideo from '../assets/street-market-bg.mp4';

export default function Dashboard() {
  const { cardBg, border, textColor, isDark } = useContext(ThemeContext);

  return (
    <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden' }}>
      {/* Background video — subtle, sits behind all dashboard content */}
      <video
        autoPlay
        muted
        loop
        playsInline
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover', zIndex: 0
        }}
      >
        <source src={bgVideo} type="video/mp4" />
      </video>

      {/* Dark overlay — keeps stat cards / text readable, video stays a subtle backdrop */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,17,21,0.88)', zIndex: 1 }} />

      {/* Actual dashboard content, sitting above the video */}
      <div style={{ position: 'relative', zIndex: 2, padding: '28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: textColor, marginBottom: '4px' }}>
          Customer Intelligence Overview
        </h1>
        <p style={{ color: '#8a8f98', fontSize: '14px', marginBottom: '28px' }}>
          Real-time segmentation, churn prediction, and sales forecasting
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
          <StatCard icon={<Users size={20} />} label="Total Customers" value="5,878" iconBg={isDark ? '#242850' : '#e8ecff'} iconColor="#5b5fef" cardBg={cardBg} border={border} textColor={textColor} />
          <StatCard icon={<DollarSign size={20} />} label="Champions" value="202" sub="high-value segment" iconBg={isDark ? '#123324' : '#e6f9f0'} iconColor="#1fa971" cardBg={cardBg} border={border} textColor={textColor} />
          <StatCard icon={<AlertTriangle size={20} />} label="At Risk" value="1,868" sub="need attention" iconBg={isDark ? '#332a12' : '#fff4e5'} iconColor="#e8940c" cardBg={cardBg} border={border} textColor={textColor} />
          <StatCard icon={<TrendingUp size={20} />} label="Churn Rate" value="40.8%" sub="model-derived" iconBg={isDark ? '#331616' : '#ffe9e9'} iconColor="#e5484d" cardBg={cardBg} border={border} textColor={textColor} />
        </div>

        <div style={{ marginTop: '28px', background: cardBg, borderRadius: '12px', border: `1px solid ${border}`, padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px', color: textColor }}>Platform Overview</h3>
          <p style={{ fontSize: '14px', color: '#8a8f98', lineHeight: 1.6 }}>
            This platform combines RFM-based customer segmentation, a Random Forest churn prediction model
            (ROC-AUC 0.82), and Prophet time-series forecasting into one unified system. Upload any client's
            transaction data to generate live segmentation, churn insights, and branded PDF reports.
          </p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sub, iconBg, iconColor, cardBg, border, textColor }) {
  return (
    <div style={{ background: cardBg, borderRadius: '12px', border: `1px solid ${border}`, padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: '13px', color: '#8a8f98', fontWeight: 500 }}>{label}</span>
        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: iconBg, color: iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
      </div>
      <div style={{ fontSize: '28px', fontWeight: 700, color: textColor, marginTop: '8px' }}>{value}</div>
      {sub && <div style={{ fontSize: '12px', color: '#8a8f98', marginTop: '2px' }}>{sub}</div>}
    </div>
  );
}