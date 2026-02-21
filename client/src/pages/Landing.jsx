import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const FEATURES = [
    { icon: '🧠', title: 'AI-Powered Quiz Engine', desc: 'MCQ quizzes across 5 subjects with 4 difficulty levels, auto-scoring, and XP rewards.', color: '#6366f1' },
    { icon: '🤖', title: 'AI Study Assistant', desc: 'Get instant doubt resolution in Math, Physics, Chemistry, Programming with voice support.', color: '#3b82f6' },
    { icon: '📅', title: 'Smart Timetable', desc: 'Create and manage your personalized weekly study schedule with color-coded subjects.', color: '#10b981' },
    { icon: '🧭', title: 'Learning Roadmaps', desc: '5 subjects × 4 levels with topic checklists and progress tracking to unlock content.', color: '#f59e0b' },
    { icon: '🎯', title: 'Goals & Achievements', desc: 'Set daily and weekly study goals, earn XP, unlock badges and level up your profile.', color: '#ec4899' },
    { icon: '🏆', title: 'Live Leaderboard', desc: 'Compete with other students globally. See your rank and climb to the top!', color: '#8b5cf6' },
    { icon: '⏰', title: 'Pomodoro Productivity', desc: 'Built-in focus timer and session tracker to maximize study efficiency.', color: '#06b6d4' },
    { icon: '📊', title: 'Analytics Dashboard', desc: 'Visualize your progress, streak, quiz history and study hours with rich charts.', color: '#ef4444' },
    { icon: '🎤', title: 'Voice AI', desc: 'Speak your questions to the AI chatbot using Web Speech API. Get text-to-speech responses.', color: '#10b981' },
];

const STATS = [
    { value: '10K+', label: 'Active Students' },
    { value: '500+', label: 'Quiz Questions' },
    { value: '5', label: 'Subjects' },
    { value: '4', label: 'Skill Levels' },
];

export default function Landing() {
    const { user } = useAuth();

    return (
        <div style={{ position: 'relative', zIndex: 1 }}>
            {/* HERO */}
            <section className="hero-section">
                <div style={{ maxWidth: 800, margin: '0 auto' }}>
                    <div className="badge badge-purple animate-fade-up" style={{ marginBottom: 20, fontSize: '0.85rem', padding: '6px 16px' }}>
                        🚀 AI-Powered Learning Platform
                    </div>
                    <h1 className="hero-title animate-fade-up" style={{ animationDelay: '0.1s' }}>
                        Learn Smarter with{' '}
                        <span className="grad-text">EduGEN AI</span>
                    </h1>
                    <p className="hero-subtitle animate-fade-up" style={{ animationDelay: '0.2s' }}>
                        Your personal AI teacher, planner, examiner and motivator — all in one platform.
                        Experience the future of education with gamified learning, smart roadmaps, and real-time AI assistance.
                    </p>
                    <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', animationDelay: '0.3s' }} className="animate-fade-up">
                        {user ? (
                            <Link to="/dashboard" className="btn btn-primary btn-lg">
                                🏠 Go to Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link to="/register" className="btn btn-primary btn-lg">
                                    🚀 Start Learning Free
                                </Link>
                                <Link to="/login" className="btn btn-secondary btn-lg">
                                    Sign In
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Stats Row */}
                    <div style={{ display: 'flex', gap: 32, justifyContent: 'center', marginTop: 60, flexWrap: 'wrap' }} className="animate-fade-up">
                        {STATS.map(s => (
                            <div key={s.label} style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '2rem', fontWeight: 900, background: 'var(--grad-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{s.value}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FEATURES */}
            <section style={{ padding: '80px 24px', maxWidth: 1200, margin: '0 auto' }}>
                <h2 className="section-title">
                    Everything You Need to <span className="grad-text">Excel</span>
                </h2>
                <p className="section-subtitle">An all-in-one AI-powered platform built for serious learners</p>
                <div className="features-grid stagger">
                    {FEATURES.map(f => (
                        <div key={f.title} className="feature-card">
                            <div style={{ width: 56, height: 56, borderRadius: 14, background: `${f.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', marginBottom: 16 }}>
                                {f.icon}
                            </div>
                            <h3 style={{ fontWeight: 700, marginBottom: 8, fontSize: '1rem' }}>{f.title}</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.7 }}>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section style={{ padding: '80px 24px', textAlign: 'center' }}>
                <div style={{ maxWidth: 600, margin: '0 auto' }}>
                    <h2 className="section-title">Ready to <span className="grad-text">Elevate</span> Your Learning?</h2>
                    <p style={{ color: 'var(--text-secondary)', margin: '16px 0 36px', fontSize: '1.05rem' }}>
                        Join thousands of students using EduGEN to ace their exams and build real skills.
                    </p>
                    <Link to="/register" className="btn btn-primary btn-lg animate-pulse-glow">
                        🎓 Create Free Account
                    </Link>
                </div>
            </section>

            {/* FOOTER */}
            <footer style={{ textAlign: 'center', padding: '40px 24px', borderTop: '1px solid var(--border)' }}>
                <div className="navbar-logo" style={{ display: 'inline-block', marginBottom: 12 }}>⭐ EduGEN</div>
                <div className="footer-links" style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 20 }}>
                    <a href="#features" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Features</a>
                    <a href="#how-it-works" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Process</a>
                    <a href="/login" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Login</a>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    © 2025 EduGEN AI Edutech Platform. Built with ❤️ for learners worldwide.
                </p>
            </footer>
        </div>
    );
}
