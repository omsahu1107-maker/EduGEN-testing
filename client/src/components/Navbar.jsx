import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const LINKS = [
    { to: '/dashboard', icon: '🏠', label: 'Dashboard' },
    { to: '/quiz', icon: '🧠', label: 'Quiz' },
    { to: '/timetable', icon: '📅', label: 'Timetable' },
    { to: '/roadmap', icon: '🧭', label: 'Roadmap' },
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

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="navbar">
            <Link to={user ? "/dashboard" : "/"} className="navbar-logo">
                ⭐ EduGEN
            </Link>

            {user && (
                <div className="navbar-links">
                    {LINKS.map(link => (
                        <NavLink key={link.to} to={link.to} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                            <span>{link.icon}</span>
                            {link.label}
                        </NavLink>
                    ))}
                    {user.role === 'admin' && (
                        <NavLink to="/admin" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                            <span>🛡️</span> Admin
                        </NavLink>
                    )}
                </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto', flexShrink: 0 }}>
                <button onClick={toggleTheme} className="btn btn-secondary btn-sm" title="Toggle theme">
                    {theme === 'dark' ? '☀️' : '🌙'}
                </button>
                {user ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            ⭐ {user.xp} XP
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--neon-orange)' }}>
                            🔥 {user.streak}
                        </span>
                        <span style={{ fontSize: '1.4rem', cursor: 'pointer' }} title={user.name}>
                            {user.avatar || '🎓'}
                        </span>
                        <button onClick={handleLogout} className="btn btn-outline btn-sm">Logout</button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <NavLink to="/login" className="btn btn-secondary btn-sm">Login</NavLink>
                        <NavLink to="/register" className="btn btn-primary btn-sm">Sign Up</NavLink>
                    </div>
                )}
            </div>
        </nav>
    );
}
