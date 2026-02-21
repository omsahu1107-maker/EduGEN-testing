import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { toast, Spinner, Modal } from '../components/UI';
import { useAuth } from '../context/AuthContext';

const SUBJECTS = ['Mathematics', 'Science', 'English', 'Programming', 'General Knowledge'];
const DIFFICULTIES = ['Easy', 'Moderate', 'Hard', 'Challenge'];
const DIFF_COLORS = { Easy: '#10b981', Moderate: '#f59e0b', Hard: '#ef4444', Challenge: '#8b5cf6' };
const LETTERS = ['A', 'B', 'C', 'D'];

export default function Quiz() {
    const { updateUser } = useAuth();
    const navigate = useNavigate();
    const [phase, setPhase] = useState('setup'); // setup | quiz | result
    const [subject, setSubject] = useState('Mathematics');
    const [difficulty, setDifficulty] = useState('Easy');
    const [questions, setQuestions] = useState([]);
    const [current, setCurrent] = useState(0);
    const [selected, setSelected] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [timeLeft, setTimeLeft] = useState(20);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [showExplain, setShowExplain] = useState(false);
    const timerRef = useRef(null);
    const startTimeRef = useRef(null);

    const startQuiz = async (useAI = false) => {
        setLoading(true);
        try {
            // Use 'static' mode by default to preserve Gemini quota.
            // 'dynamic' AI mode only used when user explicitly clicks "AI Questions"
            const mode = useAI ? 'dynamic' : 'static';
            const res = await api.get(`/quiz/questions?subject=${subject}&difficulty=${difficulty}&limit=10&mode=${mode}`);
            if (!res.data.questions || !res.data.questions.length) {
                toast.error('No questions found. Try a different subject or difficulty.');
                return;
            }
            if (res.data.source === 'AI_Live') toast.success('🤖 Fresh AI questions generated!');
            setQuestions(res.data.questions);
            setAnswers([]);
            setCurrent(0);
            setSelected(null);
            setTimeLeft(20);
            setPhase('quiz');
            startTimeRef.current = Date.now();
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to load questions';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (phase !== 'quiz') return;
        timerRef.current = setInterval(() => {
            setTimeLeft(t => {
                if (t <= 1) { handleNext(null); return 20; }
                return t - 1;
            });
        }, 1000);
        return () => clearInterval(timerRef.current);
    }, [phase, current]);

    const handleAnswer = (idx) => {
        if (selected !== null) return;
        setSelected(idx);
        clearInterval(timerRef.current);
        setShowExplain(true);
    };

    const handleNext = (override = undefined) => {
        const sel = override !== undefined ? override : selected;
        const q = questions[current];
        const newAnswers = [...answers, { questionId: q._id, selectedOption: sel }];
        setAnswers(newAnswers);
        setShowExplain(false);

        if (current + 1 >= questions.length) {
            submitQuiz(newAnswers);
        } else {
            setCurrent(c => c + 1);
            setSelected(null);
            setTimeLeft(20);
        }
    };

    const submitQuiz = async (finalAnswers) => {
        setLoading(true);
        try {
            const timeTaken = Math.round((Date.now() - startTimeRef.current) / 1000);
            const res = await api.post('/quiz/submit', { subject, difficulty, answers: finalAnswers, timeTaken });
            setResult(res.data);
            updateUser({ xp: (res.data.result?.user?.xp) });
            setPhase('result');
        } catch {
            toast.error('Failed to submit quiz');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Spinner />;

    // SETUP PHASE
    if (phase === 'setup') return (
        <div className="page-container" style={{ maxWidth: 700 }}>
            <h1 style={{ fontWeight: 800, fontSize: '1.8rem', marginBottom: 8 }}>🧠 Quiz Engine</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>Choose your subject and difficulty to begin</p>
            <div className="card stagger">
                <div className="input-group">
                    <label className="input-label">📚 Subject</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
                        {SUBJECTS.map(s => (
                            <button key={s} onClick={() => setSubject(s)} className="btn" style={{ background: subject === s ? 'var(--grad-primary)' : 'var(--bg-card)', border: `1px solid ${subject === s ? 'transparent' : 'var(--border)'}`, color: subject === s ? 'white' : 'var(--text-secondary)', justifyContent: 'center', padding: '12px' }}>
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="input-group" style={{ marginTop: 20 }}>
                    <label className="input-label">⚡ Difficulty</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                        {DIFFICULTIES.map(d => (
                            <button key={d} onClick={() => setDifficulty(d)} className="btn" style={{ background: difficulty === d ? `${DIFF_COLORS[d]}22` : 'var(--bg-card)', border: `1px solid ${difficulty === d ? DIFF_COLORS[d] : 'var(--border)'}`, color: difficulty === d ? DIFF_COLORS[d] : 'var(--text-secondary)', justifyContent: 'center', padding: '12px', fontWeight: 700 }}>
                                {d}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
                    <button onClick={() => startQuiz(false)} className="btn btn-primary" style={{ flex: 2, justifyContent: 'center', padding: '14px', fontSize: '1rem' }}>
                        🚀 Start Quiz
                    </button>
                    <button onClick={() => startQuiz(true)} className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center', padding: '14px', fontSize: '0.9rem', border: '1px solid var(--neon-purple)', color: 'var(--neon-purple)' }}
                        title="Generate fresh questions using AI (uses API quota)">
                        🤖 AI Questions
                    </button>
                </div>
            </div>
        </div>
    );

    // QUIZ PHASE
    if (phase === 'quiz') {
        const q = questions[current];
        const pct = ((20 - timeLeft) / 20) * 100;
        return (
            <div className="page-container" style={{ maxWidth: 700 }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                    <div>
                        <span className="badge badge-purple">{subject}</span>
                        <span className="badge badge-orange" style={{ marginLeft: 8 }}>{difficulty}</span>
                    </div>
                    <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                        {current + 1} / {questions.length}
                    </div>
                </div>

                {/* Timer */}
                <div style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.82rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Time remaining</span>
                        <span style={{ color: timeLeft <= 5 ? 'var(--neon-red)' : 'var(--neon-orange)', fontWeight: 700 }}>{timeLeft}s</span>
                    </div>
                    <div className="progress-bar" style={{ height: 8 }}>
                        <div className="progress-fill" style={{ width: `${pct}%`, background: timeLeft <= 5 ? 'var(--neon-red)' : 'var(--grad-orange)', transition: 'none' }} />
                    </div>
                </div>

                {/* Question */}
                <div className="card" style={{ marginBottom: 16 }}>
                    <p style={{ fontWeight: 600, fontSize: '1.05rem', lineHeight: 1.6 }}>{q.question}</p>
                </div>

                {/* Options */}
                {q.options.map((opt, i) => {
                    let cls = 'quiz-option';
                    if (selected !== null) {
                        if (i === selected) cls += selected === questions[current]?.answer ? ' correct' : ' wrong';
                    }
                    return (
                        <div key={i} className={cls} onClick={() => handleAnswer(i)}>
                            <span className="option-letter">{LETTERS[i]}</span>
                            <span style={{ fontSize: '0.92rem' }}>{opt}</span>
                        </div>
                    );
                })}

                {selected !== null && (
                    <button onClick={() => handleNext()} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}>
                        {current + 1 < questions.length ? 'Next Question →' : '🏁 Finish Quiz'}
                    </button>
                )}
            </div>
        );
    }

    // RESULT PHASE
    if (phase === 'result' && result) return (
        <div className="page-container" style={{ maxWidth: 600, textAlign: 'center' }}>
            <div className="card animate-bounce-in" style={{ padding: 40 }}>
                <div style={{ fontSize: '4rem', marginBottom: 16 }}>
                    {result.accuracy >= 80 ? '🏆' : result.accuracy >= 60 ? '🎯' : '📚'}
                </div>
                <h2 style={{ fontWeight: 800, fontSize: '1.8rem', marginBottom: 8 }}>Quiz Complete!</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: 28 }}>{subject} · {difficulty}</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
                    <div style={{ padding: 16, background: 'rgba(16,185,129,0.1)', borderRadius: 12, border: '1px solid rgba(16,185,129,0.2)' }}>
                        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--neon-green)' }}>{result.correct}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>Correct</div>
                    </div>
                    <div style={{ padding: 16, background: 'rgba(99,102,241,0.1)', borderRadius: 12, border: '1px solid rgba(99,102,241,0.2)' }}>
                        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--neon-purple)' }}>{result.accuracy}%</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>Accuracy</div>
                    </div>
                    <div style={{ padding: 16, background: 'rgba(245,158,11,0.1)', borderRadius: 12, border: '1px solid rgba(245,158,11,0.2)' }}>
                        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--neon-orange)' }}>+{result.xpEarned}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>XP Earned</div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button onClick={() => setPhase('setup')} className="btn btn-primary">🔄 Try Again</button>
                    <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">🏠 Dashboard</button>
                    <button onClick={() => navigate('/leaderboard')} className="btn btn-secondary">🏆 Leaderboard</button>
                </div>
            </div>
        </div>
    );

    return null;
}
