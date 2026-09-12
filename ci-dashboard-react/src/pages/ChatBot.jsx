import { useState, useContext, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { ThemeContext } from '../App';

const FAQ = [
  { keys: ['segment', 'segmentation', 'rfm'], answer: "Customer segmentation uses RFM analysis (Recency, Frequency, Monetary) combined with KMeans clustering (k=4) to group customers into: Champions, Loyal Customers, Potential Loyalists, and At Risk." },
  { keys: ['churn', 'risk'], answer: "Churn prediction uses a Random Forest classifier trained on behavioral features (Frequency, Monetary, tenure, order patterns), achieving 0.82 ROC-AUC and 84% recall on identifying at-risk customers." },
  { keys: ['forecast', 'prophet', 'sales', 'revenue'], answer: "Sales forecasting uses Facebook Prophet, modeling trend plus weekly and yearly seasonality, trained on daily aggregated revenue." },
  { keys: ['champion'], answer: "Champions are your top customers: recent purchases, high frequency, and the highest average spend — typically the top 3-4% of customers by value." },
  { keys: ['at risk', 'atrisk'], answer: "At Risk customers haven't purchased in 180+ days on average. They're flagged early using behavioral signals (not just recency) so you can act before they fully churn." },
  { keys: ['pdf', 'report', 'download'], answer: "You can upload any client CSV on the 'Upload & Reports' page, and download a branded PDF report with segment summaries — auto-detecting your file's columns." },
  { keys: ['who', 'built', 'creator', 'deepu', 'pavan', 'darshan', 'varun', 'ramya'], answer: "This platform was built by Pavan, Darshan, Varun, and Ramya — III BCA students, combining segmentation, churn prediction, and sales forecasting into one deployed system using FastAPI, React, Docker, and AWS." },
  { keys: ['tech', 'stack', 'built with'], answer: "Tech stack: Python (pandas, scikit-learn, Prophet) for ML, FastAPI for the backend, React for this dashboard, Docker for containerization, and Nginx + AWS EC2 for deployment." },
  { keys: ['accuracy', 'auc', 'performance'], answer: "The churn model scores 0.82 ROC-AUC with 84% recall — prioritizing catching real churners over raw accuracy, since missing an at-risk customer is costlier than a false alarm." },
];

const DEFAULT_REPLY = "I can answer questions about segmentation, churn prediction, forecasting, or this project's tech stack. Try asking about one of those!";

export default function ChatBot() {
  const { cardBg, border, textColor, isDark } = useContext(ThemeContext);
  const [messages, setMessages] = useState([
    { from: 'bot', text: "Hi! I'm the platform assistant. Ask me about the segmentation, churn model, forecasting, or how this project was built." }
  ]);
  const [input, setInput] = useState('');
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const getReply = (text) => {
    const lower = text.toLowerCase();
    const match = FAQ.find(item => item.keys.some(k => lower.includes(k)));
    return match ? match.answer : DEFAULT_REPLY;
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = { from: 'user', text: input };
    const botMsg = { from: 'bot', text: getReply(input) };
    setMessages(prev => [...prev, userMsg, botMsg]);
    setInput('');
  };

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '4px' }}>Project Assistant</h1>
      <p style={{ color: '#8a8f98', fontSize: '14px', marginBottom: '20px' }}>
        Ask about segmentation, churn, forecasting, or the tech behind this platform
      </p>

      <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: '12px', display: 'flex', flexDirection: 'column', height: '500px' }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexDirection: m.from === 'user' ? 'row-reverse' : 'row' }}>
              <div style={{
                width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0,
                background: m.from === 'user' ? '#5b5fef' : (isDark ? '#2a2d34' : '#eef0ff'),
                color: m.from === 'user' ? '#fff' : '#5b5fef',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {m.from === 'user' ? <User size={15} /> : <Bot size={15} />}
              </div>
              <div style={{
                maxWidth: '70%', padding: '10px 14px', borderRadius: '12px', fontSize: '14px', lineHeight: 1.5,
                background: m.from === 'user' ? '#5b5fef' : (isDark ? '#242730' : '#f5f6f8'),
                color: m.from === 'user' ? '#fff' : textColor
              }}>
                {m.text}
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>
        <div style={{ display: 'flex', gap: '10px', padding: '16px', borderTop: `1px solid ${border}` }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Ask about churn, segmentation, forecasting..."
            style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: `1px solid ${border}`, background: cardBg, color: textColor, fontSize: '14px', outline: 'none' }}
          />
          <button onClick={handleSend} style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', background: '#5b5fef', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}