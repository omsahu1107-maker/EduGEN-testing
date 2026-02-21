import { useState, useEffect } from 'react';
import api from '../api';
import { toast, Spinner, Modal } from '../components/UI';

const REMINDER_TYPES = [
    { value: 'study', label: '📖 Study Session', color: '#6366f1' },
    { value: 'exam', label: '📝 Exam/Test', color: '#ef4444' },
    { value: 'homework', label: '🏠 Homework', color: '#10b981' },
    { value: 'motivational', label: '🔥 Motivation', color: '#f59e0b' },
];

export default function Reminders() {
    const [reminders, setReminders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form, setForm] = useState({ title: '', type: 'study', datetime: '', recurring: 'none' });

    useEffect(() => {
        fetchReminders();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            checkAlarms();
        }, 30000);
        return () => clearInterval(interval);
    }, [reminders]);

    const fetchReminders = async () => {
        try {
            const res = await api.get('/reminders');
            setReminders(res.data.reminders);
        } catch (err) {
            toast.error('Failed to load reminders');
        } finally {
            setLoading(false);
        }
    };

    const checkAlarms = () => {
        const now = new Date();
        reminders.forEach(r => {
            const rTime = new Date(r.datetime);
            // If reminder is within 1 minute of now and active
            if (r.active && Math.abs(now - rTime) < 60000) {
                triggerAlarm(r);
            }
        });
    };

    const triggerAlarm = (r) => {
        toast.info(`⏰ ALARM: ${r.title}! Time to focus.`);
        // Play subtle sound if browser allows
        try {
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
            audio.play();
        } catch (e) {
            console.log('Audio blocked by browser');
        }

        // Deactivate to prevent multiple triggers
        api.patch(`/reminders/${r._id}`, { active: false }).then(() => {
            setReminders(prev => prev.map(rem => rem._id === r._id ? { ...rem, active: false } : rem));
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/reminders', form);
            toast.success('Reminder set successfully! ⏰');
            setIsModalOpen(false);
            setForm({ title: '', type: 'study', datetime: '', recurring: 'none' });
            fetchReminders();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error setting reminder');
        }
    };

    const deleteReminder = async (id) => {
        try {
            await api.delete(`/reminders/${id}`);
            setReminders(prev => prev.filter(r => r._id !== id));
            toast.success('Reminder removed');
        } catch (err) {
            toast.error('Could not delete reminder');
        }
    };

    if (loading) return <Spinner />;

    return (
        <div className="page-container" style={{ maxWidth: 800 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <div>
                    <h1 style={{ fontWeight: 800, fontSize: '1.8rem' }}>⏰ Study Alarms</h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>Manage your focus sessions and reminders</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
                    ➕ Set Reminder
                </button>
            </div>

            <div style={{ display: 'grid', gap: 16 }}>
                {reminders.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                        <div style={{ fontSize: '3rem', marginBottom: 16 }}>📭</div>
                        <p>No active reminders. Start by setting one!</p>
                    </div>
                ) : (
                    reminders.map(r => (
                        <div key={r._id} className="card glass-hover" style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '20px' }}>
                            <div style={{ fontSize: '2rem' }}>{r.type === 'study' ? '📖' : r.type === 'exam' ? '📝' : r.type === 'homework' ? '🏠' : '🔥'}</div>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontWeight: 700, fontSize: '1.05rem' }}>{r.title}</h3>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4 }}>
                                    📅 {new Date(r.datetime).toLocaleString()}
                                    {r.recurring !== 'none' && <span style={{ marginLeft: 12, color: 'var(--neon-purple)' }}>🔄 {r.recurring}</span>}
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <span className={`badge ${r.active ? 'badge-orange' : 'badge-purple'}`} style={{ marginBottom: 10 }}>
                                    {r.active ? 'Active' : 'Triggered'}
                                </span>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button onClick={() => deleteReminder(r._id)} className="btn btn-secondary btn-sm" style={{ color: 'var(--neon-red)' }}>Delete</button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Reminder">
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label className="input-label">Task Name</label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="e.g. Physics Revision"
                            value={form.title}
                            onChange={e => setForm({ ...form, title: e.target.value })}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">Category</label>
                        <select
                            className="input-field"
                            value={form.type}
                            onChange={e => setForm({ ...form, type: e.target.value })}
                        >
                            {REMINDER_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Date & Time</label>
                        <input
                            type="datetime-local"
                            className="input-field"
                            value={form.datetime}
                            onChange={e => setForm({ ...form, datetime: e.target.value })}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">Repeat</label>
                        <select
                            className="input-field"
                            value={form.recurring}
                            onChange={e => setForm({ ...form, recurring: e.target.value })}
                        >
                            <option value="none">Once</option>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                        </select>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}>
                        🚀 Set Alarm
                    </button>
                </form>
            </Modal>
        </div>
    );
}
