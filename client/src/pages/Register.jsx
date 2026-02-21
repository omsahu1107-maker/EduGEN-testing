import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from '../components/UI';

const getStrength = (pw) => {
    let s = 0;
    if (pw.length >= 6) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
};

const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const STRENGTH_COLORS = ['', '#ef4444', '#f59e0b', '#06b6d4', '#10b981'];

export default function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const strength = getStrength(form.password);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
        setLoading(true);
        try {
            const user = await register(form.name, form.email, form.password);
            toast.success(`Welcome to EduGEN, ${user.name}! 🎉`);
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card glass-lg" style={{ padding: 36 }}>
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>🚀</div>
                    <h1 style={{ fontWeight: 800, fontSize: '1.6rem' }}>Create your account</h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: 6, fontSize: '0.9rem' }}>Join thousands of students on EduGEN</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label className="input-label">Full Name</label>
                        <input type="text" className="input-field" placeholder="Your full name" value={form.name}
                            onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                    </div>

                    <div className="input-group">
                        <label className="input-label">Email address</label>
                        <input type="email" className="input-field" placeholder="you@example.com" value={form.email}
                            onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                    </div>

                    <div className="input-group">
                        <label className="input-label">Password</label>
                        <input type="password" className="input-field" placeholder="Create a strong password" value={form.password}
                            onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
                        {form.password && (
                            <div>
                                <div className="strength-bar" style={{ background: STRENGTH_COLORS[strength], width: `${(strength / 4) * 100}%` }} />
                                <div style={{ fontSize: '0.75rem', color: STRENGTH_COLORS[strength], marginTop: 4 }}>
                                    {STRENGTH_LABELS[strength]} password
                                </div>
                            </div>
                        )}
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '13px', marginTop: 8 }} disabled={loading}>
                        {loading ? '⏳ Creating account...' : '✨ Create Account'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: 24, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                    Already have an account?{' '}
                    <Link to="/login" style={{ color: 'var(--neon-purple)', fontWeight: 600, textDecoration: 'none' }}>Sign in →</Link>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 20 }}>
                    {['🎓 Learn', '🏆 Compete', '🤖 AI Help', '📅 Plan', '🎯 Goals'].map(b => (
                        <span key={b} className="badge badge-purple" style={{ fontSize: '0.75rem' }}>{b}</span>
                    ))}
                </div>
            </div>
        </div>
    );
}
