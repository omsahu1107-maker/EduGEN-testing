import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { sounds } from '../utils/audio';

const LINKS = [
    { to: '/dashboard', icon: '🏠', label: 'Dashboard' },
    { to: '/quiz', icon: '🧠', label: 'Quiz' },
    { to: '/practice', icon: '📝', label: 'Practice' },
    { to: '/spin', icon: '🎰', label: 'Spin & Win' },
    { to: '/timetable', icon: '📅', label: 'Timetable' },
    { to: '/roadmap', icon: '🧭', label: 'Roadmap' },
    { to: '/videos', icon: '🎬', label: 'Videos' },
    { to: '/syllabus', icon: '📘', label: 'Syllabus AI' },
    { to: '/chatbot', icon: '🤖', label: 'AI Chat' },
    { to: '/goals', icon: '🎯', label: 'Goals' },
    { to: '/reminders', icon: '⏰', label: 'Alarms' },
    { to: '/leaderboard', icon: '🏆', label: 'Leaderboard' },
    { to: '/profile', icon: '👤', label: 'Profile' },
    { to: '/settings', icon: '⚙️', label: 'Settings' },
];

export default function Navbar() {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [soundEnabled, setSoundEnabled] = useState(sounds.enabled);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        sounds.click();
        logout();
        setIsMenuOpen(false);
        navigate('/');
    };

    const handleSoundToggle = () => {
        const newState = sounds.toggleMute();
        setSoundEnabled(newState);
        if (newState) sounds.success();
    };

    const closeMenu = () => {
        sounds.click();
        setIsMenuOpen(false);
    };

    return (
        <>
            <nav className="navbar">
                <button
                    className="mobile-nav-toggle"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Toggle menu"
                >
                    {isMenuOpen ? '✕' : '☰'}
                </button>

                <Link to={user ? "/dashboard" : "/"} className="navbar-logo" onClick={closeMenu}>
                    ⭐ EduGEN
                </Link>

                {user && (
                    <div className="navbar-links">
                        {LINKS.map(link => (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                                onClick={() => sounds.click()}
                            >
                                <span>{link.icon}</span>
                                {link.label}
                            </NavLink>
                        ))}
                        {user.role === 'admin' && (
                            <NavLink
                                to="/admin"
                                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                                onClick={() => sounds.click()}
                            >
                                <span>🛡️</span> Admin
                            </NavLink>
                        )}
                    </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto', flexShrink: 0 }}>
                    {/* Sound Mute/Unmute Toggle */}
                    <button
                        onClick={handleSoundToggle}
                        className="btn btn-secondary btn-sm"
                        title={soundEnabled ? "Mute Sounds" : "Unmute Sounds"}
                        style={{
                            background: soundEnabled ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                            color: soundEnabled ? '#10b981' : '#ef4444',
                            border: `1px solid ${soundEnabled ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
                            minWidth: '36px'
                        }}
                    >
                        {soundEnabled ? '🔊' : '🔇'}
                    </button>

                    <button onClick={() => { sounds.click(); toggleTheme(); }} className="btn btn-secondary btn-sm" title="Toggle theme">
                        {theme === 'dark' ? '☀️' : '🌙'}
                    </button>

                    {user ? (
                        <div className="navbar-user-info" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.03)', padding: '4px 8px 4px 12px', borderRadius: '99px', border: '1px solid var(--border)' }}>
                            <div className="hide-mobile" style={{ display: 'flex', gap: '10px', marginRight: '5px' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--neon-purple)' }}>{user.xp} XP</span>
                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--neon-orange)' }}>🔥 {user.streak}</span>
                            </div>
                            <span style={{ fontSize: '1.4rem', cursor: 'pointer', background: 'var(--bg-secondary)', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', border: '1px solid var(--border)' }} title={user.name}>
                                {user.avatar || '🎓'}
                            </span>
                            <button onClick={handleLogout} className="nav-link" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '6px 12px' }}>Logout</button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', gap: '8px' }} className="hide-mobile">
                            <NavLink to="/login" className="nav-link">Login</NavLink>
                            <NavLink to="/register" className="nav-link" style={{ background: 'var(--grad-primary)', color: '#fff' }}>Sign Up</NavLink>
                        </div>
                    )}
                </div>
            </nav>

            {/* Mobile Sidebar */}
            <div className={`sidebar-overlay ${isMenuOpen ? 'open' : ''}`} onClick={() => setIsMenuOpen(false)}></div>
            <div className={`nav-sidebar ${isMenuOpen ? 'open' : ''}`}>
                <div style={{ padding: '10px 0', borderBottom: '1px solid var(--border)', marginBottom: 15, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--neon-purple)' }}>Menu</span>
                    <button onClick={() => setIsMenuOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
                </div>

                {user ? (
                    <>
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: 15, borderRadius: 12, marginBottom: 20 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                                <span style={{ fontSize: '2rem' }}>{user.avatar || '🎓'}</span>
                                <div>
                                    <div style={{ fontWeight: 700 }}>{user.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Level {user.level}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 15, fontSize: '0.85rem' }}>
                                <span>⭐ <strong>{user.xp}</strong> XP</span>
                                <span>🔥 <strong>{user.streak}</strong> Streak</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, overflowY: 'auto' }}>
                            {LINKS.map(link => (
                                <NavLink
                                    key={link.to}
                                    to={link.to}
                                    className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                                    onClick={closeMenu}
                                    style={{ padding: '12px 16px', fontSize: '1rem' }}
                                >
                                    <span style={{ fontSize: '1.2rem' }}>{link.icon}</span>
                                    {link.label}
                                </NavLink>
                            ))}
                            {user.role === 'admin' && (
                                <NavLink
                                    to="/admin"
                                    className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                                    onClick={closeMenu}
                                    style={{ padding: '12px 16px', fontSize: '1rem' }}
                                >
                                    <span>🛡️</span> Admin Panel
                                </NavLink>
                            )}
                        </div>

                        <button
                            onClick={handleLogout}
                            className="btn btn-danger"
                            style={{ width: '100%', marginTop: 'auto', justifyContent: 'center' }}
                        >
                            Logout 🚪
                        </button>
                    </>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 20 }}>
                        <Link to="/login" className="btn btn-secondary btn-lg" onClick={closeMenu} style={{ justifyContent: 'center' }}>Login</Link>
                        <Link to="/register" className="btn btn-primary btn-lg" onClick={closeMenu} style={{ justifyContent: 'center' }}>Sign Up</Link>
                    </div>
                )}
            </div>
        </>
    );
}
