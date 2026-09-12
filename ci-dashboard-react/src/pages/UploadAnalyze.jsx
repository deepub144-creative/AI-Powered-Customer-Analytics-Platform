import { useState, useContext } from 'react';
import axios from 'axios';
import { Upload, FileText, Download, Loader2, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CurrencyContext } from '../App';

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const FIELD_LABELS = {
  invoice: 'Invoice / Order ID',
  stockcode: 'Product / SKU Code',
  quantity: 'Quantity',
  invoicedate: 'Date',
  price: 'Price / Unit Price',
  customerid: 'Customer ID',
};

const C = {
  cardBg: '#151823',
  cardBorder: '#2a2e3a',
  dropBg: '#0f1117',
  dropBorder: '#33384a',
  textPrimary: '#f0f1f3',
  textMuted: '#8a8f98',
  textFaint: '#6b7080',
  accent: '#5b5fef',
  accentHover: '#4a4dd9',
  success: '#1fa971',
  successBg: 'rgba(31,169,113,0.12)',
  successBorder: 'rgba(31,169,113,0.35)',
  danger: '#e5484d',
  dangerBg: 'rgba(229,72,77,0.10)',
  dangerBorder: 'rgba(229,72,77,0.3)',
  inputBg: '#0f1117',
};

export default function UploadAnalyze() {
  const { currency, rates } = useContext(CurrencyContext);
  const { symbol, rate } = rates[currency];

  const [file, setFile] = useState(null);
  const [columnsFound, setColumnsFound] = useState([]);
  const [mapping, setMapping] = useState(null);
  const [detecting, setDetecting] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileSelect = async (selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setResult(null);
    setError(null);
    setMapping(null);
    setDetecting(true);

    const formData = new FormData();
    formData.append('file', selectedFile);
    try {
      const res = await axios.post(`${API_URL}/detect-columns`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000
      });
      setColumnsFound(res.data.columns_found);
      setMapping(res.data.suggested_mapping);
    } catch (err) {
      if (err.request && !err.response) {
        setError('Backend server on Render is spinning up from sleep (~30s). Please try clicking again in a few seconds.');
      } else {
        setError('Could not read this CSV file.');
      }
    }
    setDetecting(false);
  };

  const handleAnalyze = async () => {
    if (!file || !mapping) return;
    setLoading(true);
    setError(null);
    setResult(null);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('mapping', JSON.stringify(mapping));
    try {
      const res = await axios.post(`${API_URL}/analyze-upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000
      });
      setResult(res.data); // raw GBP values stay as-is; converted only at display time
    } catch (err) {
      if (err.request && !err.response) {
        setError('Backend server on Render is spinning up (~30s). Please click Analyze again shortly.');
      } else {
        setError(err.response?.data?.detail || 'Could not analyze this file.');
      }
    }
    setLoading(false);
  };

  const handleDownloadPdf = async () => {
    if (!file || !mapping) return;
    setPdfLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('mapping', JSON.stringify(mapping));
    try {
      const res = await axios.post(`${API_URL}/generate-report`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        responseType: 'blob',
        timeout: 60000
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'customer_analytics_report.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      if (err.request && !err.response) {
        setError('Backend server on Render is spinning up (~30s). Please try Download PDF again shortly.');
      } else {
        setError('Could not generate the PDF report.');
      }
    }
    setPdfLoading(false);
  };

  const allMapped = mapping && Object.values(mapping).every(v => v);
  const chartData = result
    ? Object.entries(result.segment_counts).map(([segment, count]) => ({ segment, count }))
    : [];

  return (
    <div style={{ width: '100%' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .spin { animation: spin 0.8s linear infinite; }
        .fade-card { animation: fadeInUp 0.35s ease both; }
        .ua-drop:hover { background: #14161f !important; border-color: #4a4fd9 !important; }
        .ua-btn-primary { transition: background 0.15s ease, transform 0.1s ease; }
        .ua-btn-primary:hover:not(:disabled) { background: ${C.accentHover} !important; }
        .ua-btn-primary:active:not(:disabled) { transform: scale(0.97); }
        .ua-btn-outline { transition: background 0.15s ease, transform 0.1s ease; }
        .ua-btn-outline:hover:not(:disabled) { background: rgba(91,95,239,0.1) !important; }
        .ua-btn-outline:active:not(:disabled) { transform: scale(0.97); }
        .ua-select { transition: border-color 0.15s ease; }
      `}</style>

      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '4px', color: C.textPrimary }}>
        Client Data Upload
      </h1>
      <p style={{ color: C.textMuted, fontSize: '14px', marginBottom: '24px' }}>
        Upload any client's transaction CSV — columns are auto-detected and can be adjusted below
      </p>

      <div className="fade-card" style={{ background: C.cardBg, borderRadius: '12px', border: `1px solid ${C.cardBorder}`, padding: '24px', marginBottom: '20px' }}>
        <label
          className="ua-drop"
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
            border: `2px dashed ${C.dropBorder}`, borderRadius: '10px', padding: '32px',
            cursor: 'pointer', background: C.dropBg, transition: 'background 0.15s ease, border-color 0.15s ease'
          }}
        >
          <Upload size={28} color={C.textMuted} />
          <span style={{ fontSize: '14px', color: C.textPrimary, fontWeight: 500, textAlign: 'center' }}>
            {file ? file.name : 'Click to select a CSV file'}
          </span>
          <span style={{ fontSize: '12px', color: C.textFaint }}>Any transaction-level CSV works</span>
          <input type="file" accept=".csv" onChange={e => handleFileSelect(e.target.files[0])} style={{ display: 'none' }} />
        </label>

        {detecting && (
          <p style={{ fontSize: '13px', color: C.textMuted, marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Loader2 size={14} className="spin" /> Detecting columns...
          </p>
        )}

        {mapping && (
          <div className="fade-card" style={{ marginTop: '20px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '10px', color: C.textPrimary }}>
              Confirm column mapping
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {Object.entries(FIELD_LABELS).map(([field, label]) => (
                <div key={field} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13px', color: C.textMuted, width: '150px', flexShrink: 0 }}>{label}</span>
                  <select
                    className="ua-select"
                    value={mapping[field] || ''}
                    onChange={e => setMapping({ ...mapping, [field]: e.target.value })}
                    style={{
                      flex: 1, padding: '6px 10px', borderRadius: '6px', color: C.textPrimary,
                      border: mapping[field] ? `1px solid ${C.successBorder}` : `1px solid ${C.dangerBorder}`,
                      background: mapping[field] ? C.successBg : C.dangerBg,
                      fontSize: '13px'
                    }}
                  >
                    <option value="" style={{ background: C.inputBg }}>-- not mapped --</option>
                    {columnsFound.map(c => <option key={c} value={c} style={{ background: C.inputBg }}>{c}</option>)}
                  </select>
                  {mapping[field] && <CheckCircle2 size={16} color={C.success} style={{ flexShrink: 0 }} />}
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
          <button
            className="ua-btn-primary"
            onClick={handleAnalyze}
            disabled={!allMapped || loading}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 20px', borderRadius: '8px', border: 'none',
              background: C.accent, color: '#fff', fontWeight: 600,
              fontSize: '14px', cursor: allMapped ? 'pointer' : 'not-allowed', opacity: allMapped ? 1 : 0.5
            }}
          >
            {loading ? <Loader2 size={16} className="spin" /> : <FileText size={16} />}
            {loading ? 'Analyzing...' : 'Analyze Data'}
          </button>

          <button
            className="ua-btn-outline"
            onClick={handleDownloadPdf}
            disabled={!allMapped || pdfLoading}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 20px', borderRadius: '8px', border: `1px solid ${C.accent}`,
              background: 'transparent', color: C.accent, fontWeight: 600,
              fontSize: '14px', cursor: allMapped ? 'pointer' : 'not-allowed', opacity: allMapped ? 1 : 0.5
            }}
          >
            {pdfLoading ? <Loader2 size={16} className="spin" /> : <Download size={16} />}
            {pdfLoading ? 'Generating PDF...' : 'Download PDF Report'}
          </button>
        </div>

        {error && <p style={{ color: C.danger, fontSize: '13px', marginTop: '12px' }}>{error}</p>}
      </div>

      {result && (
        <>
          <div className="fade-card" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '20px' }}>
            {Object.entries(result.avg_monetary_by_segment).map(([seg, val]) => (
              <div key={seg} style={{ background: C.cardBg, borderRadius: '12px', border: `1px solid ${C.cardBorder}`, padding: '18px' }}>
                <div style={{ fontSize: '12px', color: C.textMuted, marginBottom: '6px' }}>{seg}</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: C.textPrimary }}>
                  {symbol}{(val * rate).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
                <div style={{ fontSize: '11px', color: C.textFaint }}>{result.segment_counts[seg]} customers</div>
              </div>
            ))}
          </div>

          <div className="fade-card" style={{ background: C.cardBg, borderRadius: '12px', border: `1px solid ${C.cardBorder}`, padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px', color: C.textPrimary }}>
              Segment Distribution
            </h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2e3a" />
                <XAxis dataKey="segment" tick={{ fontSize: 12, fill: C.textMuted }} />
                <YAxis tick={{ fill: C.textMuted }} />
                <Tooltip contentStyle={{ background: '#1f2230', border: `1px solid ${C.cardBorder}`, borderRadius: '8px', color: C.textPrimary }} />
                <Bar dataKey="count" fill={C.accent} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}