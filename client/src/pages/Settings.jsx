import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { toast } from '../components/UI';
import api from '../api';

export default function Settings() {
    const { user, updateUser } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirm: '' });
    const [lang, setLang] = useState(user?.language || 'en');
    const [saving, setSaving] = useState(false);

    const changePassword = async (e) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirm) { toast.error('New passwords do not match'); return; }
        if (passwords.newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
        setSaving(true);
        try {
            await api.put('/users/change-password', { currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
            toast.success('Password changed successfully! 🔐');
            setPasswords({ currentPassword: '', newPassword: '', confirm: '' });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to change password');
        } finally { setSaving(false); }
    };

    const saveLang = async () => {
        try {
            await api.put('/users/update', { language: lang });
            updateUser({ language: lang });
            toast.success('Language updated!');
        } catch { toast.error('Failed to update language'); }
    };

    return (
        <div className="page-container" style={{ maxWidth: 700 }}>
            <h1 style={{ fontWeight: 800, fontSize: '1.8rem', marginBottom: 24 }}>⚙️ Settings</h1>

            {/* Theme */}
            <div className="card" style={{ marginBottom: 20 }}>
                <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: '1rem' }}>🎨 Appearance</h3>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ fontWeight: 600 }}>Theme</div>
                        <div style={{ fontSize: '0.83rem', color: 'var(--text-muted)', marginTop: 2 }}>
                            Currently using <strong>{theme}</strong> mode
                        </div>
                    </div>
                    <button onClick={toggleTheme} className="btn btn-secondary">
                        {theme === 'dark' ? '☀️ Switch to Light' : '🌙 Switch to Dark'}
                    </button>
                </div>
            </div>

            {/* Language */}
            <div className="card" style={{ marginBottom: 20 }}>
                <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: '1rem' }}>🌍 Language</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {[{ code: 'en', label: '🇬🇧 English' }, { code: 'hi', label: '🇮🇳 Hindi' }].map(l => (
                        <button key={l.code} onClick={() => setLang(l.code)} className="btn" style={{ background: lang === l.code ? 'rgba(99,102,241,0.15)' : 'var(--bg-card)', border: `1px solid ${lang === l.code ? 'var(--neon-purple)' : 'var(--border)'}`, color: lang === l.code ? 'var(--neon-purple)' : 'var(--text-secondary)', flex: 1, justifyContent: 'center', padding: '12px' }}>
                            {l.label}
                        </button>
                    ))}
                    <button onClick={saveLang} className="btn btn-primary" style={{ flexShrink: 0 }}>Save</button>
                </div>
            </div>

            {/* Change Password */}
            <div className="card">
                <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: '1rem' }}>🔐 Change Password</h3>
                <form onSubmit={changePassword}>
                    <div className="input-group">
                        <label className="input-label">Current Password</label>
                        <input type="password" className="input-field" placeholder="Current password" value={passwords.currentPassword}
                            onChange={e => setPasswords(p => ({ ...p, currentPassword: e.target.value }))} required />
                    </div>
                    <div className="input-group">
                        <label className="input-label">New Password</label>
                        <input type="password" className="input-field" placeholder="New password (min 6 chars)" value={passwords.newPassword}
                            onChange={e => setPasswords(p => ({ ...p, newPassword: e.target.value }))} required />
                    </div>
                    <div className="input-group">
                        <label className="input-label">Confirm New Password</label>
                        <input type="password" className="input-field" placeholder="Confirm new password" value={passwords.confirm}
                            onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))} required />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                        {saving ? '⏳ Changing...' : '🔐 Change Password'}
                    </button>
                </form>
            </div>

            {/* Account Info */}
            <div className="card" style={{ marginTop: 20 }}>
                <h3 style={{ fontWeight: 700, marginBottom: 12, fontSize: '1rem' }}>ℹ️ Account Info</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.88rem' }}>
                    {[
                        { label: '📧 Email', value: user?.email },
                        { label: '🎭 Role', value: user?.role },
                        { label: '🏅 Level', value: user?.level },
                        { label: '⭐ Total XP', value: `${user?.xp || 0} XP` },
                    ].map(item => (
                        <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                            <span style={{ color: 'var(--text-muted)' }}>{item.label}</span>
                            <strong>{item.value}</strong>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
