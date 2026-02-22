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
            <header style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: 8 }}>
                    Dashboard <span style={{ color: 'var(--neon-purple)', fontSize: '1rem', fontWeight: 500, opacity: 0.7 }}>/ Overview</span>
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>Welcome back to your personalized learning space.</p>
            </header>

            {/* Top Section: Welcome & Focus */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 24 }}>
                {/* Welcome Card */}
                <div className="card glass-premium animate-fade-up" style={{
                    position: 'relative',
                    overflow: 'hidden',
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))',
                    border: '1px solid rgba(99,102,241,0.3)'
                }}>
                    <div style={{ position: 'absolute', top: -20, right: -20, fontSize: '8rem', opacity: 0.1, pointerEvents: 'none' }}>🎓</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                        <div style={{
                            width: 80, height: 80, borderRadius: '50%',
                            background: 'var(--bg-secondary)', border: '2px solid var(--neon-purple)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem',
                            boxShadow: 'var(--shadow-neon-purple)'
                        }}>
                            {user?.avatar || '🎓'}
                        </div>
                        <div style={{ flex: 1 }}>
                            <h2 style={{ fontWeight: 800, fontSize: '1.6rem', marginBottom: 4 }}>
                                Hi, <span className="grad-text">{user?.name}!</span>
                            </h2>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                <span className="badge badge-purple" style={{ textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.65rem' }}>Level {user?.level}</span>
                                <span className="badge badge-orange" style={{ textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.65rem' }}>🔥 {user?.streak} Day Streak</span>
                            </div>
                        </div>
                    </div>
                    <div style={{ marginTop: 24 }}>
                        <XPBar xp={user?.xp || 0} level={user?.level || 'Beginner'} />
                    </div>
                </div>

                {/* AI Focus Monitor Banner */}
                <div className="card glass-premium animate-fade-up" style={{
                    animationDelay: '0.1s',
                    background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(6,182,212,0.05))',
                    border: '1px solid rgba(16,185,129,0.2)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 15 }}>
                        <div className="badge badge-green">LIVE MONITOR</div>
                        <div style={{ fontSize: '1.5rem' }}>👁️</div>
                    </div>
                    <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 8 }}>AI Focus & Sleep Detector</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: 15 }}>
                        Webcam monitoring is active. We'll alert you if you fall asleep during study sessions.
                    </p>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: 6 }}>🟢 Eyes Detection</span>
                        <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: 6 }}>🔴 Sleep Alert</span>
                    </div>
                </div>
            </div>

            {/* Middle Section: Stats & Quote */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 24 }}>
                <div className="stat-card glass-hover animate-fade-up" style={{ animationDelay: '0.15s' }}>
                    <div className="stat-icon" style={{ background: 'rgba(99,102,241,0.15)', color: 'var(--neon-purple)' }}>⭐</div>
                    <div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{user?.xp || 0}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total XP</div>
                    </div>
                </div>
                <div className="stat-card glass-hover animate-fade-up" style={{ animationDelay: '0.2s' }}>
                    <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.15)', color: 'var(--neon-orange)' }}>🔥</div>
                    <div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{user?.streak || 0}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Streak</div>
                    </div>
                </div>
                <div className="stat-card glass-hover animate-fade-up" style={{ animationDelay: '0.25s' }}>
                    <div className="stat-icon" style={{ background: 'rgba(6,182,212,0.15)', color: 'var(--neon-cyan)' }}>⏱️</div>
                    <div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{(user?.totalStudyHours || 0).toFixed(1)}h</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Study Time</div>
                    </div>
                </div>
                <div className="stat-card glass-hover animate-fade-up" style={{ animationDelay: '0.3s' }}>
                    <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--neon-green)' }}>🎯</div>
                    <div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{quizResults.length}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Quizzes</div>
                    </div>
                </div>
            </div>

            {/* Quote Card - Premium Styling */}
            <div className="card glass-premium animate-fade-up" style={{
                animationDelay: '0.35s',
                marginBottom: 32,
                textAlign: 'center',
                background: 'linear-gradient(rgba(10,10,31,0.8), rgba(10,10,31,0.8)), url("https://www.transparenttextures.com/patterns/dark-matter.png")',
                border: '1px dashed var(--border)'
            }}>
                <div style={{ color: 'var(--neon-purple)', fontSize: '1.5rem', marginBottom: 12 }}>“</div>
                <p style={{ fontSize: '1.1rem', fontStyle: 'italic', fontWeight: 500, color: 'var(--text-primary)', marginBottom: 12 }}>
                    {quote.text}
                </p>
                <div style={{ fontSize: '0.85rem', color: 'var(--neon-purple)', fontWeight: 700 }}>— {quote.author}</div>
            </div>

            {/* Main Content: Charts & Quick Actions (Bento Grid Style) */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: 24 }}>
                {/* Left: Progress Charts */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <div className="card glass-premium">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <h3 style={{ fontWeight: 800, fontSize: '1.1rem' }}>📈 Learning Activity</h3>
                            <div className="badge badge-purple" style={{ fontSize: '0.7rem' }}>LAST 7 DAYS</div>
                        </div>
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={STUDY_DATA}>
                                <defs>
                                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="var(--neon-purple)" stopOpacity={1} />
                                        <stop offset="100%" stopColor="var(--neon-blue)" stopOpacity={0.6} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.03)' }} contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 12, color: '#fff' }} />
                                <Bar dataKey="hours" fill="url(#barGrad)" radius={[6, 6, 0, 0]} barSize={32} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="card glass-premium">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h3 style={{ fontWeight: 800, fontSize: '1.1rem' }}>🧠 Quiz Performance</h3>
                            <Link to="/quiz" style={{ fontSize: '0.8rem', color: 'var(--neon-purple)', textDecoration: 'none' }}>Expand Details →</Link>
                        </div>
                        {quizChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={180}>
                                <LineChart data={quizChartData}>
                                    <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 12 }} />
                                    <Line type="monotone" dataKey="accuracy" stroke="var(--neon-green)" strokeWidth={3} dot={{ r: 4, fill: 'var(--neon-green)' }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                                <div style={{ fontSize: '2rem', marginBottom: 10 }}>🎯</div>
                                <p>Take your first quiz to track progress!</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Quick Actions & Daily Spin */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {/* Lucky Spin Widget */}
                    {(() => {
                        const lastSpin = user?.lastSpinDate ? new Date(user.lastSpinDate) : null;
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const canSpin = !lastSpin || lastSpin < today;

                        return (
                            <Link to="/spin" className="card glass-premium animate-pulse-glow" style={{
                                textDecoration: 'none', color: 'inherit',
                                background: canSpin ? 'linear-gradient(135deg, rgba(251,191,36,0.15), rgba(245,158,11,0.05))' : 'rgba(255,255,255,0.02)',
                                border: `1px solid ${canSpin ? '#fbbf2455' : 'var(--border)'}`
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                    <div style={{ fontSize: '2.5rem', animation: canSpin ? 'fm-shake 2s infinite' : 'none' }}>🎰</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 800, color: canSpin ? '#fbbf24' : 'var(--text-muted)' }}>
                                            {canSpin ? 'DAILY SPIN READY' : 'SPIN COLLECTED'}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                                            {canSpin ? 'Try your luck for bonus XP today!' : 'Resetting in a few hours...'}
                                        </div>
                                    </div>
                                    {canSpin && <div style={{ fontSize: '1.2rem', color: '#fbbf24' }}>▶</div>}
                                </div>
                            </Link>
                        );
                    })()}

                    {/* Quick Access Bento */}
                    <div className="card glass-premium">
                        <h3 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: 20 }}>⚡ Quick Actions</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            {[
                                { to: '/quiz', icon: '🧠', label: 'Quiz', color: 'var(--neon-purple)' },
                                { to: '/chatbot', icon: '🤖', label: 'AI Tutor', color: 'var(--neon-blue)' },
                                { to: '/roadmap', icon: '🧭', label: 'Roadmap', color: 'var(--neon-orange)' },
                                { to: '/leaderboard', icon: '🏆', label: 'Rank', color: 'var(--neon-cyan)' },
                                { to: '/timetable', icon: '📅', label: 'Schedule', color: 'var(--neon-green)' },
                                { to: '/reminders', icon: '⏰', label: 'Alarms', color: 'var(--neon-pink)' },
                            ].map(item => (
                                <Link key={item.label} to={item.to} className="glass-hover" style={{
                                    padding: '16px 12px', borderRadius: 12, textDecoration: 'none',
                                    textAlign: 'center', background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid var(--border)'
                                }}>
                                    <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>{item.icon}</div>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>{item.label}</div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Motivational Goals */}
                    <div className="card glass-premium" style={{ background: 'rgba(0,0,0,0.2)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 15 }}>
                            <span style={{ fontSize: '1.2rem' }}>🎯</span>
                            <h4 style={{ fontWeight: 700, fontSize: '0.9rem' }}>Current Goals</h4>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div style={{ padding: '10px 12px', background: 'rgba(99,102,241,0.05)', borderRadius: 8, borderLeft: '3px solid var(--neon-purple)' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>Solve 10 Math MCQs</div>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 4 }}>Progress: 40%</div>
                            </div>
                            <div style={{ padding: '10px 12px', background: 'rgba(16,185,129,0.05)', borderRadius: 8, borderLeft: '3px solid var(--neon-green)' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>2h Deep Study Session</div>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 4 }}>Complete to earn 50 XP</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Responsive Adjustments (Inline Media Query Replacement) */}
            <style>{`
                @media (max-width: 1024px) {
                    .dashboard-grid, div[style*="grid-template-columns: 2fr 1.2fr"] {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </div>
    );
}
