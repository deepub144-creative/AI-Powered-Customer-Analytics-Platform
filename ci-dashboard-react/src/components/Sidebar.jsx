import { useContext } from 'react';
import { LayoutDashboard, Users, AlertTriangle, TrendingUp, Upload, MessageCircle, LogOut } from 'lucide-react';
import { ThemeContext } from '../App';
import assistantVideo from '../assets/assistant-bg.mp4';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'segmentation', label: 'Segmentation', icon: Users },
  { id: 'churn', label: 'Churn Risk', icon: AlertTriangle },
  { id: 'forecast', label: 'Forecast', icon: TrendingUp },
  { id: 'upload', label: 'Upload & Reports', icon: Upload },
  { id: 'chatbot', label: 'AI Assistant', icon: MessageCircle },
];

export default function Sidebar({ activePage, setActivePage }) {
  const { cardBg, border, textColor, isDark } = useContext(ThemeContext);

  return (
    <div style={{
      width: '240px',
      background: cardBg,
      borderRight: `1px solid ${border}`,
      display: 'flex',
      flexDirection: 'column',
      padding: '20px 0'
    }}>
      <div style={{ padding: '0 24px 24px', borderBottom: `1px solid ${border}`, marginBottom: '16px' }}>
        <div style={{ fontWeight: 700, fontSize: '17px', color: textColor }}>📊 Customer Intel</div>
        <div style={{ fontSize: '12px', color: '#8a8f98', marginTop: '2px' }}>Analytics Platform</div>
      </div>

      <nav style={{ flex: 1, padding: '0 12px' }}>
        {navItems.map(item => {
          const Icon = item.icon;
          const active = activePage === item.id;
          return (
            <div key={item.id}>
              <button
                onClick={() => setActivePage(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: '10px 12px',
                  marginBottom: '4px',
                  borderRadius: '8px',
                  border: 'none',
                  background: active ? (isDark ? '#242850' : '#eef0ff') : 'transparent',
                  color: active ? '#5b5fef' : (isDark ? '#c4c8d0' : '#4a4f57'),
                  fontWeight: active ? 600 : 500,
                  fontSize: '14px',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <Icon size={18} />
                {item.label}
              </button>

              {item.id === 'chatbot' && active && (
                <div style={{
                  margin: '0 0 12px', borderRadius: '10px', overflow: 'hidden',
                  border: `1px solid ${border}`
                }}>
                  <video
                    src={assistantVideo}
                    autoPlay
                    muted
                    loop
                    playsInline
                    style={{ width: '100%', height: '100px', objectFit: 'cover', display: 'block' }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div style={{ padding: '12px' }}>
        <button style={{
          display: 'flex', alignItems: 'center', gap: '12px', width: '100%',
          padding: '10px 12px', borderRadius: '8px', border: 'none',
          background: isDark ? '#242730' : '#f5f6f8', color: isDark ? '#c4c8d0' : '#4a4f57', fontSize: '14px',
          fontWeight: 500, cursor: 'pointer'
        }}>
          <LogOut size={18} /> Logout
        </button>
      </div>
    </div>
  );
}