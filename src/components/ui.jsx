import { useEffect } from 'react';
import { useApp } from '../context/AppContext';

export function ToastContainer() {
  const { toasts } = useApp();

  return (
    <div className="toast-wrap">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type}`}>
          <span>{t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ'}</span>
          {t.message}
        </div>
      ))}
    </div>
  );
}

export function Skeleton({ width = '100%', height = 16, style = {} }) {
  return <div className="skeleton" style={{ width, height, ...style }} />;
}

export function Spinner({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ animation: 'spin 0.9s linear infinite' }}>
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.2" />
      <path d="M22 12a10 10 0 0 0-10-10" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function PageLoader({ label = 'Loading…' }) {
  return (
    <div style={{ minHeight: '60vh', display: 'grid', placeItems: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <Spinner size={32} />
        <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>{label}</span>
      </div>
    </div>
  );
}

export function useEscape(handler, active = true) {
  useEffect(() => {
    if (!active) return;
    const onKey = (e) => {
      if (e.key === 'Escape') handler();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handler, active]);
}