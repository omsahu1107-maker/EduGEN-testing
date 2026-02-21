import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from '../components/UI';

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [shake, setShake] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const user = await login(form.email, form.password);
            toast.success(`Welcome back, ${user.name}! 🎉`);
            navigate('/dashboard');
        } catch (err) {
            const msg = err.response?.data?.message || 'Login failed';
            toast.error(msg);
            setShake(true);
            setTimeout(() => setShake(false), 500);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className={`auth-card glass-lg ${shake ? 'animate-shake' : ''}`} style={{ padding: 36 }}>
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>⭐</div>
                    <h1 style={{ fontWeight: 800, fontSize: '1.6rem' }}>Welcome back</h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: 6, fontSize: '0.9rem' }}>Sign in to continue your learning journey</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label className="input-label">Email address</label>
                        <input
                            type="email"
                            className="input-field"
                            placeholder="you@example.com"
                            value={form.email}
                            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPass ? 'text' : 'password'}
                                className="input-field"
                                placeholder="Enter your password"
                                value={form.password}
                                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                required
                                style={{ paddingRight: 44 }}
                            />
                            <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem' }}>
                                {showPass ? '🙈' : '👁️'}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '13px', marginTop: 8 }} disabled={loading}>
                        {loading ? '⏳ Signing in...' : '🚀 Sign In'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: 24, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                    Don't have an account?{' '}
                    <Link to="/register" style={{ color: 'var(--neon-purple)', fontWeight: 600, textDecoration: 'none' }}>
                        Sign up free →
                    </Link>
                </div>

                <div style={{ marginTop: 16, background: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 8, fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'left' }}>
                    <strong>Demo Accounts:</strong><br />
                    <strong style={{ color: 'var(--neon-blue)' }}>demo@edugen.com</strong> / Demo@123<br />
                    <strong style={{ color: 'var(--neon-orange)' }}>admin@edugen.com</strong> / Admin@123
                </div>
            </div>
        </div>
    );
}
