import { useState, useEffect } from 'react';
import api from '../api';
import { toast, Modal, Spinner } from '../components/UI';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#8b5cf6', '#ef4444'];
const SUBJECTS = ['Mathematics', 'Science', 'English', 'Programming', 'General Knowledge', 'Physics', 'Chemistry', 'History', 'Other'];

const emptySlot = { day: 'Monday', subject: '', startTime: '09:00', endTime: '10:00', color: '#6366f1', label: '' };

export default function Timetable() {
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState(emptySlot);
    const [editing, setEditing] = useState(null);

    useEffect(() => {
        api.get('/timetable').then(r => setSlots(r.data.slots || [])).catch(() => toast.error('Failed to load timetable')).finally(() => setLoading(false));
    }, []);

    const openAdd = () => { setForm(emptySlot); setEditing(null); setModalOpen(true); };
    const openEdit = (slot) => { setForm({ day: slot.day, subject: slot.subject, startTime: slot.startTime, endTime: slot.endTime, color: slot.color, label: slot.label }); setEditing(slot._id); setModalOpen(true); };

    const saveSlot = async () => {
        if (!form.subject) { toast.error('Please enter a subject'); return; }
        try {
            if (editing) {
                const res = await api.put(`/timetable/${editing}`, form);
                setSlots(slots.map(s => s._id === editing ? res.data.slot : s));
                toast.success('Slot updated!');
            } else {
                const res = await api.post('/timetable', form);
                setSlots([...slots, res.data.slot]);
                toast.success('Slot added!');
            }
            setModalOpen(false);
        } catch { toast.error('Failed to save slot'); }
    };

    const deleteSlot = async (id) => {
        try {
            await api.delete(`/timetable/${id}`);
            setSlots(slots.filter(s => s._id !== id));
            toast.success('Slot deleted');
        } catch { toast.error('Failed to delete'); }
    };

    if (loading) return <Spinner />;

    const byDay = DAYS.reduce((acc, d) => { acc[d] = slots.filter(s => s.day === d); return acc; }, {});

    return (
        <div className="page-container">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontWeight: 800, fontSize: '1.8rem' }}>📅 Timetable</h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>Plan your weekly study schedule</p>
                </div>
                <button onClick={openAdd} className="btn btn-primary">+ Add Slot</button>
            </div>

            {/* Grid */}
            <div style={{ overflowX: 'auto' }}>
                <div className="timetable-grid">
                    {DAYS.map(day => (
                        <div key={day} className="timetable-day-col">
                            <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center', padding: '8px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {day.slice(0, 3)}
                            </div>
                            {byDay[day].length === 0 ? (
                                <div onClick={openAdd} style={{ border: '1px dashed var(--border)', borderRadius: 10, padding: 16, textAlign: 'center', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.78rem', minHeight: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--neon-purple)'}
                                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                                    + Add
                                </div>
                            ) : (
                                byDay[day].map(slot => (
                                    <div key={slot._id} className="time-slot-card" style={{ background: `${slot.color}22`, borderColor: `${slot.color}44` }} onClick={() => openEdit(slot)}>
                                        <div style={{ fontSize: '0.72rem', color: slot.color, fontWeight: 700 }}>{slot.startTime} – {slot.endTime}</div>
                                        <div style={{ fontSize: '0.82rem', fontWeight: 600, marginTop: 4, color: 'var(--text-primary)' }}>{slot.subject}</div>
                                        {slot.label && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{slot.label}</div>}
                                        <button onClick={e => { e.stopPropagation(); deleteSlot(slot._id); }} style={{ position: 'absolute', top: 4, right: 6, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.9rem', opacity: 0.6 }}>×</button>
                                    </div>
                                ))
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal */}
            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Slot' : 'Add Time Slot'}>
                <div className="input-group">
                    <label className="input-label">Day</label>
                    <select className="input-field" value={form.day} onChange={e => setForm(f => ({ ...f, day: e.target.value }))}>
                        {DAYS.map(d => <option key={d}>{d}</option>)}
                    </select>
                </div>
                <div className="input-group">
                    <label className="input-label">Subject</label>
                    <select className="input-field" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}>
                        <option value="">Select subject...</option>
                        {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                    </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="input-group">
                        <label className="input-label">Start Time</label>
                        <input type="time" className="input-field" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} />
                    </div>
                    <div className="input-group">
                        <label className="input-label">End Time</label>
                        <input type="time" className="input-field" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} />
                    </div>
                </div>
                <div className="input-group">
                    <label className="input-label">Label (optional)</label>
                    <input type="text" className="input-field" placeholder="e.g. Chapter 5" value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} />
                </div>
                <div className="input-group">
                    <label className="input-label">Color</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                        {COLORS.map(c => (
                            <div key={c} onClick={() => setForm(f => ({ ...f, color: c }))} style={{ width: 28, height: 28, borderRadius: '50%', background: c, cursor: 'pointer', border: form.color === c ? '3px solid white' : '3px solid transparent', transition: 'all 0.2s' }} />
                        ))}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                    <button onClick={saveSlot} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Save</button>
                    <button onClick={() => setModalOpen(false)} className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                </div>
            </Modal>
        </div>
    );
}
