import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { XPBar, StreakBadge, StatCard, Spinner } from '../components/UI';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import api from '../api';

const QUOTES = [
    { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
    { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
    { text: "Learning is not attained by chance, it must be sought with ardor.", author: "Abigail Adams" },
    { text: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" },
    { text: "The more that you read, the more things you will know.", author: "Dr. Seuss" },
    { text: "Dreams don't work unless you do.", author: "John C. Maxwell" },
    { text: "Push yourself, because no one else is going to do it for you.", author: "Unknown" },
];

const STUDY_DATA = [
    { day: 'Mon', hours: 2.5 }, { day: 'Tue', hours: 3 },
    { day: 'Wed', hours: 1.5 }, { day: 'Thu', hours: 4 },
    { day: 'Fri', hours: 2 }, { day: 'Sat', hours: 5 },
    { day: 'Sun', hours: 3.5 },
];

export default function Dashboard() {
    const { user } = useAuth();
    const [quizResults, setQuizResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const quote = QUOTES[new Date().getDay()];

    useEffect(() => {
        api.get('/quiz/history').then(r => setQuizResults(r.data.results || [])).catch(() => { }).finally(() => setLoading(false));
    }, []);

    if (loading) return <Spinner />;

    const quizChartData = quizResults.slice(0, 7).reverse().map((r, i) => ({
        name: `Q${i + 1}`, accuracy: r.accuracy, xp: r.xpEarned,
    }));

    return (
        <div className="page-container stagger">
            {/* Welcome */}
            <div className="card glass-hover" style={{ marginBottom: 20, background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '3rem' }}>{user?.avatar || '🎓'}</span>
                    <div style={{ flex: 1 }}>
                        <h1 style={{ fontWeight: 800, fontSize: '1.5rem' }}>
                            Welcome back, <span className="grad-text">{user?.name}!</span>
                        </h1>
                        <p style={{ color: 'var(--text-muted)', marginTop: 4, fontSize: '0.9rem' }}>
                            Keep up the great work. You're on a <strong style={{ color: 'var(--neon-orange)' }}>{user?.streak} day streak</strong>!
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <span className={`badge ${user?.role === 'admin' ? 'badge-orange' : 'badge-purple'}`}>
                            {user?.role === 'admin' ? '🛡️ Admin' : `📚 ${user?.level}`}
                        </span>
                    </div>
                </div>
                <div style={{ marginTop: 20 }}>
                    <XPBar xp={user?.xp || 0} level={user?.level || 'Beginner'} />
                </div>
            </div>

            {/* Motivational Quote */}
            <div className="card" style={{ marginBottom: 20, background: 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(239,68,68,0.06))', borderColor: 'rgba(245,158,11,0.2)' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '1.5rem' }}>💡</span>
                    <div>
                        <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>"{quote.text}"</p>
                        <p style={{ color: 'var(--neon-orange)', fontSize: '0.8rem', marginTop: 6, fontWeight: 600 }}>— {quote.author}</p>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <StatCard icon="⭐" label="Total XP Earned" value={user?.xp || 0} color="var(--neon-purple)" />
                <StatCard icon="🔥" label="Day Streak" value={user?.streak || 0} color="var(--neon-orange)" />
                <StatCard icon="⏱️" label="Study Hours" value={(user?.totalStudyHours || 0).toFixed(1)} suffix="h" color="var(--neon-cyan)" />
                <StatCard icon="🎯" label="Quizzes Done" value={quizResults.length} color="var(--neon-green)" />
            </div>

            {/* Charts */}
            <div className="dashboard-grid" style={{ marginTop: 20 }}>
                {/* Study hours chart */}
                <div className="card">
                    <h3 style={{ fontWeight: 700, marginBottom: 20, fontSize: '1rem' }}>📊 Weekly Study Hours</h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={STUDY_DATA}>
                            <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ background: 'rgba(10,10,31,0.95)', border: '1px solid var(--border)', borderRadius: 8, color: '#fff' }} />
                            <Bar dataKey="hours" fill="#6366f1" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Right panel */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* Quiz performance */}
                    <div className="card" style={{ flex: 1 }}>
                        <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: '1rem' }}>🧠 Quiz Accuracy</h3>
                        {quizChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={120}>
                                <LineChart data={quizChartData}>
                                    <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} />
                                    <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} />
                                    <Tooltip contentStyle={{ background: 'rgba(10,10,31,0.95)', border: '1px solid var(--border)', borderRadius: 8, color: '#fff' }} formatter={(v) => [`${v}%`, 'Accuracy']} />
                                    <Line type="monotone" dataKey="accuracy" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 3 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                Take your first quiz to see stats! 🎯
                            </div>
                        )}
                    </div>

                    {/* Quick Links */}
                    <div className="card">
                        <h3 style={{ fontWeight: 700, marginBottom: 12, fontSize: '1rem' }}>⚡ Quick Start</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {[
                                { to: '/quiz', icon: '🧠', label: 'Take a Quiz', badge: '+XP' },
                                { to: '/chatbot', icon: '🤖', label: 'Ask AI Tutor', badge: 'Live' },
                                { to: '/roadmap', icon: '🧭', label: 'View Roadmap', badge: '5 subjects' },
                                { to: '/goals', icon: '🎯', label: 'Set Goals', badge: 'Daily' },
                                { to: '/reminders', icon: '⏰', label: 'Set Alarms', badge: 'Active' },
                            ].map(link => (
                                <Link key={link.to} to={link.to} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, textDecoration: 'none', color: 'var(--text-secondary)', transition: 'all 0.2s', border: '1px solid transparent' }}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-card-hover)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}>
                                    <span style={{ fontSize: '1.1rem' }}>{link.icon}</span>
                                    <span style={{ flex: 1, fontSize: '0.88rem' }}>{link.label}</span>
                                    <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>{link.badge}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
