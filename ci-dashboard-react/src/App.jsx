import { useState, createContext, useContext } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Segmentation from './pages/Segmentation';
import ChurnLookup from './pages/ChurnLookup';
import Forecast from './pages/Forecast';
import UploadAnalyze from './pages/UploadAnalyze';
import ChatBot from './pages/ChatBot';
import Login from './pages/Login';

export const CurrencyContext = createContext();
export const ThemeContext = createContext();

export const CURRENCY_RATES = {
  'GBP (£)': { symbol: '£', rate: 1.0 },
  'INR (₹)': { symbol: '₹', rate: 127.0 },
  'USD ($)': { symbol: '$', rate: 1.33 },
  'EUR (€)': { symbol: '€', rate: 1.17 },
};

// Theme is permanently dark — no toggle.
const isDark = true;
const bg = '#0f1115';
const cardBg = '#1a1d23';
const textColor = '#e6e8eb';
const border = '#2a2d34';

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [currency, setCurrency] = useState('GBP (£)');
  const [user, setUser] = useState(null);

  const themeValue = { theme: 'dark', isDark, bg, cardBg, textColor, border };

  if (!user) {
    return (
      <ThemeContext.Provider value={themeValue}>
        <Login onLogin={setUser} />
      </ThemeContext.Provider>
    );
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard />;
      case 'segmentation': return <Segmentation />;
      case 'churn': return <ChurnLookup />;
      case 'forecast': return <Forecast />;
      case 'upload': return <UploadAnalyze />;
      case 'chatbot': return <ChatBot />;
      default: return <Dashboard />;
    }
  };

  return (
    <ThemeContext.Provider value={themeValue}>
      <CurrencyContext.Provider value={{ currency, setCurrency, rates: CURRENCY_RATES }}>
        <div style={{ display: 'flex', minHeight: '100vh', background: bg, color: textColor }}>
          <Sidebar activePage={activePage} setActivePage={setActivePage} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <TopBar currency={currency} setCurrency={setCurrency} user={user} onLogout={() => setUser(null)} />
            <main style={{ padding: '32px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ flex: 1 }}>{renderPage()}</div>
              <Footer />
            </main>
          </div>
        </div>
      </CurrencyContext.Provider>
    </ThemeContext.Provider>
  );
}

function TopBar({ currency, setCurrency, user, onLogout }) {
  const { cardBg, border, textColor } = useContext(ThemeContext);
  return (
    <div style={{
      height: '64px', background: cardBg, borderBottom: `1px solid ${border}`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px'
    }}>
      <input
        placeholder="Search customers, segments..."
        style={{
          width: '280px', padding: '8px 14px', borderRadius: '8px',
          border: `1px solid ${border}`, fontSize: '14px', outline: 'none',
          background: cardBg, color: textColor
        }}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <select
          value={currency}
          onChange={e => setCurrency(e.target.value)}
          style={{ padding: '6px 10px', borderRadius: '6px', border: `1px solid ${border}`, background: cardBg, color: textColor, fontSize: '13px' }}
        >
          {Object.keys(CURRENCY_RATES).map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <span style={{ fontSize: '14px', fontWeight: 500, color: textColor }}>{user.name}</span>
        {user.picture ? (
          <img src={user.picture} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
        ) : (
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#5b5fef', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '13px' }}>G</div>
        )}
        <button onClick={onLogout} style={{ fontSize: '12px', color: '#8a8f98', background: 'none', border: 'none', cursor: 'pointer' }}>Logout</button>
      </div>
    </div>
  );
}

function Footer() {
  const { border } = useContext(ThemeContext);
  return (
    <div style={{ borderTop: `1px solid ${border}`, marginTop: '40px', padding: '20px 0', fontSize: '12px', color: '#8a8f98', textAlign: 'center' }}>
      <div>Created by <strong>Pavan, Darshan, Varun, Ramya</strong></div>
      <div>Kalpataru First Grade Science College, Tiptur · BCA (Data Science) 2024–27</div>
    </div>
  );
}