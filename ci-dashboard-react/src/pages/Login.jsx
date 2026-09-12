import { useContext } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { ThemeContext } from '../App';
import bgVideo from '../assets/street-market-bg.mp4';
import logo from '../assets/logo.png';

export default function Login({ onLogin }) {
  const { bg, cardBg, border, textColor } = useContext(ThemeContext);

  const handleSuccess = (credentialResponse) => {
    const decoded = jwtDecode(credentialResponse.credential);
    onLogin({ name: decoded.name, email: decoded.email, picture: decoded.picture, isGuest: false });
  };

  const handleGuest = () => {
    onLogin({ name: 'Guest', email: null, picture: null, isGuest: true });
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      {/* Background video */}
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

      {/* Dark overlay so the card stays readable */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,17,21,0.72)', zIndex: 1 }} />

      {/* Login card */}
      <div style={{
        position: 'relative', zIndex: 2,
        background: cardBg, border: `1px solid ${border}`, borderRadius: '16px',
        padding: '40px', width: '360px', textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '20px', fontWeight: 700, color: textColor, marginBottom: '4px' }}>
          <img src={logo} alt="Customer Intel" style={{ width: '32px', height: '32px', borderRadius: '8px' }} />
          Customer Intelligence System
        </div>
        <div style={{ fontSize: '13px', color: '#8a8f98', marginBottom: '28px' }}>AI Powered Customer Analytics Platform</div>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <GoogleLogin onSuccess={handleSuccess} onError={() => console.log('Login failed')} />
        </div>

        <div style={{ fontSize: '12px', color: '#8a8f98', margin: '16px 0' }}>or</div>

        <button
          onClick={handleGuest}
          style={{
            width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${border}`,
            background: 'transparent', color: textColor, fontSize: '14px', fontWeight: 500, cursor: 'pointer'
          }}
        >
          Continue as Guest
        </button>

        <div style={{ fontSize: '11px', color: '#8a8f98', marginTop: '24px' }}>
          Created by Pavan, Darshan, Varun, Ramya
        </div>
      </div>
    </div>
  );
}