import { StrictMode, Component } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/index.css';
import App from './App.jsx';

// ── Error Boundary: shows what crashed instead of blank screen ──
class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(err) {
    return { error: err };
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{
          position: 'fixed', inset: 0, background: '#000010',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', gap: '16px', fontFamily: 'Space Mono, monospace',
          color: '#ff4444', padding: '40px',
        }}>
          <div style={{ fontSize: '28px' }}>⚠️</div>
          <div style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '.1em' }}>RENDER ERROR</div>
          <pre style={{
            fontSize: '11px', color: '#ff8844', background: 'rgba(255,50,0,0.1)',
            border: '1px solid rgba(255,80,0,0.3)', borderRadius: '8px',
            padding: '16px', maxWidth: '700px', overflowX: 'auto',
            whiteSpace: 'pre-wrap', textAlign: 'left',
          }}>
            {this.state.error.message}
            {'\n\n'}
            {this.state.error.stack?.slice(0, 600)}
          </pre>
          <button
            onClick={() => this.setState({ error: null })}
            style={{
              background: 'transparent', border: '1px solid #ff4444',
              color: '#ff4444', borderRadius: '8px', padding: '8px 22px',
              fontFamily: 'inherit', fontSize: '11px', cursor: 'pointer',
              letterSpacing: '.1em',
            }}
          >
            ↺ Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </StrictMode>,
);
