import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { toast, XPBar, StreakBadge } from '../components/UI';

const AVATARS = ['🎓', '🚀', '⭐', '🦊', '🐉', '🦁', '🐺', '🦅', '🌟', '💎', '🔥', '⚡', '🌙', '🎯', '🏆', '🛡️', '🧠', '🎮', '🎨', '🌈'];

const BADGES = [
    { id: 'first_quiz', icon: '🎯', label: 'First Quiz', desc: 'Completed your first quiz' },
    { id: 'streak_7', icon: '🔥', label: 'Week Streak', desc: '7 day study streak' },
    { id: 'level_up', icon: '⬆️', label: 'Level Up', desc: 'Reached Intermediate level' },
    { id: 'xp_500', icon: '⭐', label: 'XP Hunter', desc: 'Earned 500 XP' },
    { id: 'early_bird', icon: '🌅', label: 'Early Bird', desc: 'Studied before 8am' },
    { id: 'night_owl', icon: '🌙', label: 'Night Owl', desc: 'Studied after 10pm' },
];

export default function Profile() {
    const { user, updateUser } = useAuth();
    const [name, setName] = useState(user?.name || '');
    const [avatar, setAvatar] = useState(user?.avatar || '🎓');
    const [showPicker, setShowPicker] = useState(false);
    const [saving, setSaving] = useState(false);

    const save = async () => {
        setSaving(true);
        try {
            const res = await api.put('/users/update', { name, avatar });
            updateUser({ name: res.data.user.name, avatar: res.data.user.avatar });
            toast.success('Profile updated! ✨');
        } catch { toast.error('Failed to update profile'); }
        finally { setSaving(false); }
    };

    return (
        <div className="page-container" style={{ maxWidth: 800 }}>
            <h1 style={{ fontWeight: 800, fontSize: '1.8rem', marginBottom: 24 }}>👤 My Profile</h1>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {/* Profile card */}
                <div className="card">
                    <div style={{ textAlign: 'center', marginBottom: 24 }}>
                        <div className="avatar-display" style={{ margin: '0 auto 12px' }} onClick={() => setShowPicker(!showPicker)}>
                            {avatar}
                        </div>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Click avatar to change</p>
                        {showPicker && (
                            <div className="avatar-picker">
                                {AVATARS.map(av => (
                                    <div key={av} className={`avatar-option ${avatar === av ? 'selected' : ''}`} onClick={() => { setAvatar(av); setShowPicker(false); }}>
                                        {av}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="input-group">
                        <label className="input-label">Display Name</label>
                        <input type="text" className="input-field" value={name} onChange={e => setName(e.target.value)} />
                    </div>
                    <div style={{ marginBottom: 16, padding: 12, background: 'rgba(255,255,255,0.04)', borderRadius: 8, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        📧 {user?.email}
                    </div>
                    <button onClick={save} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={saving}>
                        {saving ? '⏳ Saving...' : '💾 Save Changes'}
                    </button>
                </div>

                {/* Stats */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="card">
                        <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: '0.95rem' }}>📊 Stats</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Level</span>
                                <span className="badge badge-purple">{user?.level}</span>
                            </div>
                            <div style={{ marginBottom: 4 }}>
                                <XPBar xp={user?.xp || 0} level={user?.level || 'Beginner'} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Total XP</span>
                                <strong style={{ color: 'var(--neon-purple)' }}>{user?.xp || 0}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Day Streak</span>
                                <StreakBadge streak={user?.streak || 0} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Study Hours</span>
                                <strong style={{ color: 'var(--neon-cyan)' }}>{(user?.totalStudyHours || 0).toFixed(1)}h</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Role</span>
                                <span className={`badge ${user?.role === 'admin' ? 'badge-orange' : 'badge-blue'}`}>{user?.role}</span>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <h3 style={{ fontWeight: 700, marginBottom: 14, fontSize: '0.95rem' }}>🏅 Achievement Badges</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                            {BADGES.map(b => (
                                <div key={b.id} title={b.desc} style={{ textAlign: 'center', padding: '10px 6px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', cursor: 'default' }}>
                                    <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>{b.icon}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{b.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
