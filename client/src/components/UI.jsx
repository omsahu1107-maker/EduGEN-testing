import { useState } from 'react';
import { useEffect } from 'react';

// XP BAR
export function XPBar({ xp = 0, level = 'Beginner' }) {
    const xpThresholds = { Beginner: 500, Intermediate: 2000, Advanced: 5000, Expert: 10000 };
    const prevThresholds = { Beginner: 0, Intermediate: 500, Advanced: 2000, Expert: 5000 };
    const max = xpThresholds[level] || 500;
    const prev = prevThresholds[level] || 0;
    const percent = Math.min(100, ((xp - prev) / (max - prev)) * 100);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.8rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Level: <strong style={{ color: 'var(--neon-purple)' }}>{level}</strong></span>
                <span style={{ color: 'var(--text-muted)' }}>{xp} / {max} XP</span>
            </div>
            <div className="xp-bar-container">
                <div className="xp-bar-fill" style={{ width: `${percent}%` }} />
            </div>
        </div>
    );
}

// STREAK BADGE
export function StreakBadge({ streak = 0 }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '1.3rem' }}>🔥</span>
            <div>
                <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--neon-orange)' }}>{streak}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1 }}>day streak</div>
            </div>
        </div>
    );
}

// STAT CARD
export function StatCard({ icon, label, value, color = 'var(--neon-purple)', suffix = '' }) {
    return (
        <div className="stat-card glass-hover">
            <div style={{ width: 48, height: 48, borderRadius: 12, background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>
                {icon}
            </div>
            <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color }}>{value}{suffix}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
            </div>
        </div>
    );
}

// SPINNER
export function Spinner({ inline = false }) {
    if (inline) return <div className="spinner-ring" style={{ width: 24, height: 24, borderWidth: 3 }}></div>;
    return (
        <div className="spinner-overlay">
            <div style={{ textAlign: 'center' }}>
                <div className="spinner-ring"></div>
                <p style={{ marginTop: 16, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading...</p>
            </div>
        </div>
    );
}

// TOAST
const toasts = [];
let setToastsRef = null;

export function ToastContainer() {
    const [items, setItems] = useState([]);
    useEffect(() => { setToastsRef = setItems; return () => { setToastsRef = null; }; }, []);

    const remove = (id) => setItems(prev => prev.filter(t => t.id !== id));

    return (
        <div className="toast-container">
            {items.map(t => (
                <div key={t.id} className="toast animate-slide-right" style={{ borderLeft: `3px solid ${t.type === 'success' ? 'var(--neon-green)' : t.type === 'error' ? 'var(--neon-red)' : 'var(--neon-purple)'}` }}>
                    <span style={{ fontSize: '1.2rem' }}>{t.type === 'success' ? '✅' : t.type === 'error' ? '❌' : 'ℹ️'}</span>
                    <span style={{ flex: 1, fontSize: '0.88rem', color: 'var(--text-primary)' }}>{t.message}</span>
                    <button onClick={() => remove(t.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem', padding: 0 }}>×</button>
                </div>
            ))}
        </div>
    );
}

export const toast = {
    show: (message, type = 'info') => {
        if (!setToastsRef) return;
        const id = Date.now();
        setToastsRef(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToastsRef(prev => prev.filter(t => t.id !== id)), 4000);
    },
    success: (msg) => toast.show(msg, 'success'),
    error: (msg) => toast.show(msg, 'error'),
    info: (msg) => toast.show(msg, 'info'),
};

// MODAL
export function Modal({ isOpen, onClose, title, children }) {
    if (!isOpen) return null;
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                    <h3 style={{ fontWeight: 700, fontSize: '1.1rem' }}>{title}</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.4rem', padding: 0, lineHeight: 1 }}>×</button>
                </div>
                {children}
            </div>
        </div>
    );
}

// PROGRESS BAR
export function ProgressBar({ percent = 0, color = 'var(--neon-purple)', height = 6 }) {
    return (
        <div className="progress-bar" style={{ height }}>
            <div className="progress-fill" style={{ width: `${percent}%`, background: color }} />
        </div>
    );
}
