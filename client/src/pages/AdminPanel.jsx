import { useState, useEffect } from 'react';
import api from '../api';
import { toast, Spinner, Modal } from '../components/UI';

const SUBJECTS = ['Mathematics', 'Science', 'English', 'Programming', 'General Knowledge'];
const DIFFICULTIES = ['Easy', 'Moderate', 'Hard', 'Challenge'];

const emptyQ = { subject: 'Mathematics', difficulty: 'Easy', question: '', options: ['', '', '', ''], answer: 0, explanation: '', xpReward: 10 };

export default function AdminPanel() {
    const [tab, setTab] = useState('analytics');
    const [users, setUsers] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [qModal, setQModal] = useState(false);
    const [editingQ, setEditingQ] = useState(null);
    const [form, setForm] = useState(emptyQ);

    const load = async () => {
        setLoading(true);
        try {
            const [uRes, qRes, aRes] = await Promise.all([
                api.get('/admin/users'),
                api.get('/admin/questions'),
                api.get('/admin/analytics'),
            ]);
            setUsers(uRes.data.users || []);
            setQuestions(qRes.data.questions || []);
            setAnalytics(aRes.data.analytics);
        } catch { toast.error('Failed to load admin data'); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const openAddQ = () => { setForm(emptyQ); setEditingQ(null); setQModal(true); };
    const openEditQ = (q) => {
        setForm({ subject: q.subject, difficulty: q.difficulty, question: q.question, options: [...q.options], answer: q.answer, explanation: q.explanation || '', xpReward: q.xpReward || 10 });
        setEditingQ(q._id);
        setQModal(true);
    };

    const saveQuestion = async () => {
        if (!form.question || form.options.some(o => !o)) { toast.error('Fill all fields'); return; }
        try {
            if (editingQ) {
                const res = await api.put(`/admin/questions/${editingQ}`, form);
                setQuestions(qs => qs.map(q => q._id === editingQ ? res.data.question : q));
                toast.success('Question updated!');
            } else {
                const res = await api.post('/quiz/questions', form);
                setQuestions(qs => [res.data.question, ...qs]);
                toast.success('Question added!');
            }
            setQModal(false);
        } catch { toast.error('Failed to save question'); }
    };

    const deleteQ = async (id) => {
        if (!confirm('Delete this question?')) return;
        try {
            await api.delete(`/quiz/questions/${id}`);
            setQuestions(qs => qs.filter(q => q._id !== id));
            toast.success('Question deleted');
        } catch { toast.error('Failed to delete'); }
    };

    const deleteUser = async (id) => {
        if (!confirm('Delete this user?')) return;
        try {
            await api.delete(`/admin/users/${id}`);
            setUsers(us => us.filter(u => u._id !== id));
            toast.success('User deleted');
        } catch { toast.error('Failed to delete user'); }
    };

    if (loading) return <Spinner />;

    const TABS = [
        { id: 'analytics', label: '📊 Analytics' },
        { id: 'users', label: '👥 Users' },
        { id: 'questions', label: '🧠 Questions' },
    ];

    return (
        <div className="page-container">
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontWeight: 800, fontSize: '1.8rem' }}>🛡️ Admin Panel</h1>
                <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>Manage the EduGEN platform</p>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
                {TABS.map(t => (
                    <button key={t.id} onClick={() => setTab(t.id)} className="btn" style={{ background: tab === t.id ? 'rgba(99,102,241,0.15)' : 'transparent', border: `1px solid ${tab === t.id ? 'var(--neon-purple)' : 'transparent'}`, color: tab === t.id ? 'var(--neon-purple)' : 'var(--text-secondary)' }}>
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Analytics */}
            {tab === 'analytics' && analytics && (
                <div className="stagger">
                    <div className="stats-grid">
                        <div className="stat-card glass-hover">
                            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>👥</div>
                            <div><div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--neon-purple)' }}>{analytics.totalUsers}</div><div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Total Users</div></div>
                        </div>
                        <div className="stat-card glass-hover">
                            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>🧠</div>
                            <div><div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--neon-green)' }}>{analytics.totalQuizzes}</div><div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Total Quizzes</div></div>
                        </div>
                        <div className="stat-card glass-hover">
                            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>📈</div>
                            <div><div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--neon-orange)' }}>{Math.round(analytics.avgAccuracy || 0)}%</div><div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Avg Accuracy</div></div>
                        </div>
                        <div className="stat-card glass-hover">
                            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>❓</div>
                            <div><div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#8b5cf6' }}>{questions.length}</div><div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Questions Bank</div></div>
                        </div>
                    </div>

                    {analytics.bySubject?.length > 0 && (
                        <div className="card" style={{ marginTop: 20 }}>
                            <h3 style={{ fontWeight: 700, marginBottom: 16 }}>📊 Quizzes by Subject</h3>
                            {analytics.bySubject.map(s => (
                                <div key={s._id} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                                    <span style={{ minWidth: 140, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{s._id}</span>
                                    <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: 999, height: 8, overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${Math.min(100, (s.count / analytics.totalQuizzes) * 100)}%`, background: 'var(--grad-primary)', borderRadius: 999 }} />
                                    </div>
                                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', minWidth: 30, textAlign: 'right' }}>{s.count}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Users */}
            {tab === 'users' && (
                <div className="table-container">
                    <table className="data-table">
                        <thead><tr><th>Avatar</th><th>Name</th><th>Email</th><th>Role</th><th>Level</th><th>XP</th><th>Actions</th></tr></thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u._id}>
                                    <td style={{ fontSize: '1.3rem' }}>{u.avatar || '🎓'}</td>
                                    <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{u.name}</td>
                                    <td>{u.email}</td>
                                    <td><span className={`badge ${u.role === 'admin' ? 'badge-orange' : 'badge-blue'}`}>{u.role}</span></td>
                                    <td><span className="badge badge-purple">{u.level}</span></td>
                                    <td style={{ color: 'var(--neon-purple)', fontWeight: 600 }}>{u.xp.toLocaleString()}</td>
                                    <td>
                                        {u.role !== 'admin' && (
                                            <button onClick={() => deleteUser(u._id)} className="btn btn-sm btn-danger">🗑️</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Questions */}
            {tab === 'questions' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                        <button onClick={openAddQ} className="btn btn-primary">+ Add Question</button>
                    </div>
                    <div className="table-container">
                        <table className="data-table">
                            <thead><tr><th>Subject</th><th>Difficulty</th><th>Question</th><th>XP</th><th>Actions</th></tr></thead>
                            <tbody>
                                {questions.map(q => (
                                    <tr key={q._id}>
                                        <td><span className="badge badge-purple">{q.subject}</span></td>
                                        <td><span className="badge badge-orange">{q.difficulty}</span></td>
                                        <td style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.question}</td>
                                        <td style={{ color: 'var(--neon-orange)' }}>+{q.xpReward || 10}</td>
                                        <td style={{ display: 'flex', gap: 8 }}>
                                            <button onClick={() => openEditQ(q)} className="btn btn-sm btn-secondary">✏️</button>
                                            <button onClick={() => deleteQ(q._id)} className="btn btn-sm btn-danger">🗑️</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Question Modal */}
            <Modal isOpen={qModal} onClose={() => setQModal(false)} title={editingQ ? 'Edit Question' : 'Add Question'}>
                <div style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: 4 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div className="input-group">
                            <label className="input-label">Subject</label>
                            <select className="input-field" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}>
                                {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="input-group">
                            <label className="input-label">Difficulty</label>
                            <select className="input-field" value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}>
                                {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="input-group">
                        <label className="input-label">Question</label>
                        <textarea className="input-field" rows={3} value={form.question} onChange={e => setForm(f => ({ ...f, question: e.target.value }))} />
                    </div>
                    {form.options.map((opt, i) => (
                        <div key={i} className="input-group">
                            <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <input type="radio" name="answer" checked={form.answer === i} onChange={() => setForm(f => ({ ...f, answer: i }))} />
                                Option {String.fromCharCode(65 + i)} {form.answer === i && <span style={{ color: 'var(--neon-green)', fontSize: '0.75rem' }}>(Correct)</span>}
                            </label>
                            <input type="text" className="input-field" value={opt} onChange={e => { const opts = [...form.options]; opts[i] = e.target.value; setForm(f => ({ ...f, options: opts })); }} />
                        </div>
                    ))}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div className="input-group">
                            <label className="input-label">XP Reward</label>
                            <input type="number" className="input-field" value={form.xpReward} onChange={e => setForm(f => ({ ...f, xpReward: parseInt(e.target.value) || 10 }))} />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Explanation</label>
                            <input type="text" className="input-field" value={form.explanation} onChange={e => setForm(f => ({ ...f, explanation: e.target.value }))} />
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                    <button onClick={saveQuestion} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Save</button>
                    <button onClick={() => setQModal(false)} className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                </div>
            </Modal>
        </div>
    );
}
