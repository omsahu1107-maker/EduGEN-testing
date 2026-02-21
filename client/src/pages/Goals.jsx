import { useState, useEffect } from 'react';
import api from '../api';
import { toast, Modal, ProgressBar, Spinner } from '../components/UI';

const ICONS = ['🎯', '📚', '💻', '🔭', '📐', '🌍', '🏋️', '🧘', '⏰', '🎵', '🏃', '💪'];

export default function Goals() {
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('daily');
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState({ title: '', type: 'daily', xpReward: 25, icon: '🎯' });

    useEffect(() => {
        api.get('/goals').then(r => setGoals(r.data.goals || [])).catch(() => toast.error('Failed to load goals')).finally(() => setLoading(false));
    }, []);

    const filtered = goals.filter(g => g.type === tab);
    const done = filtered.filter(g => g.completed).length;
    const pct = filtered.length > 0 ? Math.round((done / filtered.length) * 100) : 0;

    const addGoal = async () => {
        if (!form.title) { toast.error('Enter a goal title'); return; }
        try {
            const res = await api.post('/goals', form);
            setGoals(prev => [res.data.goal, ...prev]);
            setModalOpen(false);
            toast.success('Goal added! 🎯');
        } catch { toast.error('Failed to add goal'); }
    };

    const completeGoal = async (id) => {
        try {
            const res = await api.put(`/goals/${id}/complete`);
            setGoals(prev => prev.map(g => g._id === id ? res.data.goal : g));
            toast.success(`🏆 Goal completed! +${res.data.xpEarned} XP`);
        } catch { toast.error('Failed to complete goal'); }
    };

    const deleteGoal = async (id) => {
        try {
            await api.delete(`/goals/${id}`);
            setGoals(prev => prev.filter(g => g._id !== id));
            toast.success('Goal deleted');
        } catch { toast.error('Failed to delete'); }
    };

    if (loading) return <Spinner />;

    return (
        <div className="page-container">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontWeight: 800, fontSize: '1.8rem' }}>🎯 Goals & Achievements</h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>Set daily and weekly study goals to earn XP</p>
                </div>
                <button onClick={() => setModalOpen(true)} className="btn btn-primary">+ Add Goal</button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                {['daily', 'weekly'].map(t => (
                    <button key={t} onClick={() => setTab(t)} className="btn" style={{ background: tab === t ? 'var(--grad-primary)' : 'var(--bg-card)', color: tab === t ? 'white' : 'var(--text-secondary)', border: `1px solid ${tab === t ? 'transparent' : 'var(--border)'}`, textTransform: 'capitalize' }}>
                        {t === 'daily' ? '📅' : '📆'} {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                ))}
            </div>

            {/* Progress */}
            {filtered.length > 0 && (
                <div className="card" style={{ marginBottom: 20, background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.04))' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                        <span style={{ fontWeight: 600 }}>{tab.charAt(0).toUpperCase() + tab.slice(1)} Progress</span>
                        <span style={{ color: 'var(--neon-purple)', fontWeight: 700 }}>{done}/{filtered.length} completed ({pct}%)</span>
                    </div>
                    <ProgressBar percent={pct} color="var(--neon-purple)" height={8} />
                </div>
            )}

            {/* Goal List */}
            {filtered.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
                    <div style={{ fontSize: '3rem', marginBottom: 12 }}>🎯</div>
                    <p style={{ color: 'var(--text-muted)' }}>No {tab} goals yet. Add your first goal!</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {filtered.map(goal => (
                        <div key={goal._id} className="card glass-hover" style={{ borderColor: goal.completed ? 'rgba(16,185,129,0.3)' : 'var(--border)', background: goal.completed ? 'rgba(16,185,129,0.05)' : 'var(--bg-card)', display: 'flex', alignItems: 'center', gap: 14 }}>
                            <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{goal.icon}</span>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, color: goal.completed ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: goal.completed ? 'line-through' : 'none' }}>{goal.title}</div>
                                <div style={{ fontSize: '0.78rem', color: 'var(--neon-orange)', marginTop: 2 }}>+{goal.xpReward} XP reward</div>
                            </div>
                            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                                {!goal.completed && (
                                    <button onClick={() => completeGoal(goal._id)} className="btn btn-sm" style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--neon-green)', border: '1px solid rgba(16,185,129,0.3)' }}>
                                        ✓ Done
                                    </button>
                                )}
                                {goal.completed && <span className="badge badge-green">✅ Completed</span>}
                                <button onClick={() => deleteGoal(goal._id)} className="btn btn-sm btn-danger" style={{ padding: '5px 10px' }}>🗑️</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Modal */}
            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add New Goal">
                <div className="input-group">
                    <label className="input-label">Goal Title</label>
                    <input type="text" className="input-field" placeholder="e.g. Study Math for 2 hours" value={form.title}
                        onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="input-group">
                        <label className="input-label">Type</label>
                        <select className="input-field" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                        </select>
                    </div>
                    <div className="input-group">
                        <label className="input-label">XP Reward</label>
                        <input type="number" className="input-field" min="5" max="500" value={form.xpReward}
                            onChange={e => setForm(f => ({ ...f, xpReward: parseInt(e.target.value) || 25 }))} />
                    </div>
                </div>
                <div className="input-group">
                    <label className="input-label">Icon</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {ICONS.map(ic => (
                            <span key={ic} onClick={() => setForm(f => ({ ...f, icon: ic }))} style={{ fontSize: '1.3rem', cursor: 'pointer', padding: 6, borderRadius: 8, background: form.icon === ic ? 'rgba(99,102,241,0.2)' : 'transparent', border: form.icon === ic ? '1px solid var(--neon-purple)' : '1px solid transparent' }}>
                                {ic}
                            </span>
                        ))}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                    <button onClick={addGoal} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Add Goal</button>
                    <button onClick={() => setModalOpen(false)} className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                </div>
            </Modal>
        </div>
    );
}
