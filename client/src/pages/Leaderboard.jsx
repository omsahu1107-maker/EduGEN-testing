import { useState, useEffect } from 'react';
import api from '../api';
import { Spinner, XPBar } from '../components/UI';
import { useAuth } from '../context/AuthContext';

const RANK_ICONS = { 1: '🥇', 2: '🥈', 3: '🥉' };
const RANK_COLORS = { 1: '#f59e0b', 2: '#94a3b8', 3: '#cd7c3c' };

export default function Leaderboard() {
    const { user } = useAuth();
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/users/leaderboard').then(r => setLeaderboard(r.data.leaderboard || [])).catch(() => { }).finally(() => setLoading(false));
    }, []);

    if (loading) return <Spinner />;

    const myRank = leaderboard.findIndex(u => u._id === user?._id) + 1;

    return (
        <div className="page-container" style={{ maxWidth: 700 }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
                <h1 style={{ fontWeight: 800, fontSize: '2rem' }}>🏆 Leaderboard</h1>
                <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>Top students ranked by total XP</p>
                {myRank > 0 && (
                    <div style={{ marginTop: 16, display: 'inline-block', padding: '8px 20px', borderRadius: 999, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', fontSize: '0.85rem' }}>
                        Your rank: <strong style={{ color: 'var(--neon-purple)' }}>#{myRank}</strong>
                    </div>
                )}
            </div>

            {/* Top 3 podium */}
            {leaderboard.length >= 3 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 16, marginBottom: 32 }}>
                    {[1, 0, 2].map(idx => {
                        const u = leaderboard[idx];
                        const rank = idx + 1;
                        const heights = [100, 130, 80];
                        const h = heights[idx === 0 ? 1 : idx === 1 ? 0 : 2];
                        return (
                            <div key={u._id} style={{ textAlign: 'center', flex: 1, maxWidth: 160 }}>
                                <div style={{ fontSize: '2rem', marginBottom: 4 }}>{u.avatar || '🎓'}</div>
                                <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 4, color: RANK_COLORS[rank] }}>{u.name}</div>
                                <div style={{ height: h, background: `linear-gradient(180deg, ${RANK_COLORS[rank]}33, ${RANK_COLORS[rank]}11)`, borderRadius: '12px 12px 0 0', border: `1px solid ${RANK_COLORS[rank]}44`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                                    <span style={{ fontSize: '1.8rem' }}>{RANK_ICONS[rank]}</span>
                                    <span style={{ fontWeight: 800, color: RANK_COLORS[rank], fontSize: '0.9rem' }}>#{rank}</span>
                                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{u.xp.toLocaleString()} XP</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Full list */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {leaderboard.map((entry, idx) => {
                    const rank = idx + 1;
                    const isMe = entry._id === user?._id;
                    return (
                        <div key={entry._id} className={`rank-row ${isMe ? 'current-user' : ''}`} style={{ borderBottom: idx < leaderboard.length - 1 ? '1px solid var(--border)' : 'none' }}>
                            <div style={{ width: 36, textAlign: 'center', fontSize: rank <= 3 ? '1.3rem' : '0.95rem', color: RANK_COLORS[rank] || 'var(--text-muted)', fontWeight: 700 }}>
                                {RANK_ICONS[rank] || `#${rank}`}
                            </div>
                            <span style={{ fontSize: '1.5rem' }}>{entry.avatar || '🎓'}</span>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>
                                    {entry.name} {isMe && <span className="badge badge-purple" style={{ fontSize: '0.65rem', marginLeft: 6 }}>You</span>}
                                </div>
                                <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
                                    <span className="badge" style={{ fontSize: '0.7rem', background: 'rgba(99,102,241,0.1)', color: 'var(--neon-purple)', padding: '2px 6px' }}>{entry.level}</span>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>🔥 {entry.streak} streak</span>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontWeight: 800, color: 'var(--neon-orange)', fontSize: '1rem' }}>{entry.xp.toLocaleString()}</div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>XP</div>
                            </div>
                        </div>
                    );
                })}
                {leaderboard.length === 0 && (
                    <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                        No students yet — be the first! 🚀
                    </div>
                )}
            </div>
        </div>
    );
}
