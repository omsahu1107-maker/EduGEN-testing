import { useState } from 'react';
import api from '../api';
import { toast, Spinner } from '../components/UI';

const QUICK_TOPICS = [
    { label: 'Python', icon: '🐍' },
    { label: 'Web Development', icon: '🌐' },
    { label: 'Machine Learning', icon: '🤖' },
    { label: 'Data Science', icon: '📊' },
    { label: 'JavaScript', icon: '⚡' },
    { label: 'Cybersecurity', icon: '🔐' },
    { label: 'DSA', icon: '🧩' },
    { label: 'React', icon: '⚛️' },
    { label: 'Mathematics', icon: '📐' },
    { label: 'Physics', icon: '⚗️' },
    { label: 'English Grammar', icon: '📖' },
    { label: 'SQL', icon: '🗄️' },
];

export default function Roadmap() {
    const [topic, setTopic] = useState('');
    const [loading, setLoading] = useState(false);
    const [roadmap, setRoadmap] = useState(null);
    const [completedSteps, setCompletedSteps] = useState({});
    const [expandedStage, setExpandedStage] = useState(0);

    const generateRoadmap = async (topicName) => {
        const finalTopic = topicName || topic.trim();
        if (!finalTopic) { toast.error('Please enter a topic first!'); return; }
        setLoading(true);
        setRoadmap(null);
        setCompletedSteps({});
        setExpandedStage(0);
        try {
            const res = await api.post('/roadmap/generate', { topic: finalTopic });
            setRoadmap(res.data.roadmap);
            setTopic(finalTopic);
            toast.success(`🗺️ Roadmap generated for "${finalTopic}"!`);
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to generate roadmap';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const toggleStep = (stageId, stepId) => {
        const key = `${stageId}_${stepId}`;
        setCompletedSteps(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const getStageProgress = (stage) => {
        const done = stage.steps.filter(s => completedSteps[`${stage.id}_${s.id}`]).length;
        return { done, total: stage.steps.length, pct: Math.round((done / stage.steps.length) * 100) };
    };

    const totalProgress = roadmap ? (() => {
        const total = roadmap.stages.reduce((a, s) => a + s.steps.length, 0);
        const done = roadmap.stages.reduce((a, s) => a + s.steps.filter(st => completedSteps[`${s.id}_${st.id}`]).length, 0);
        return { done, total, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
    })() : null;

    return (
        <div className="page-container" style={{ maxWidth: 900 }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
                <h1 style={{ fontWeight: 800, fontSize: '2rem', marginBottom: 8 }}>
                    🧭 <span className="grad-text">AI Learning Roadmap</span>
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
                    Enter any topic and get a personalized step-by-step learning path
                </p>
            </div>

            {/* Search Box */}
            <div className="card" style={{ marginBottom: 28, padding: '24px 28px' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <span style={{
                            position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
                            fontSize: '1.2rem', pointerEvents: 'none'
                        }}>🔍</span>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="Enter a topic... e.g. Machine Learning, React, DSA"
                            value={topic}
                            onChange={e => setTopic(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && generateRoadmap()}
                            style={{ paddingLeft: 48, fontSize: '1rem', height: 52 }}
                        />
                    </div>
                    <button
                        onClick={() => generateRoadmap()}
                        className="btn btn-primary"
                        disabled={loading}
                        style={{ padding: '14px 28px', fontSize: '1rem', whiteSpace: 'nowrap', height: 52 }}
                    >
                        {loading ? '⏳ Generating...' : '🚀 Generate'}
                    </button>
                </div>

                {/* Quick Topic Pills */}
                <div style={{ marginTop: 18 }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 10 }}>Quick picks:</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {QUICK_TOPICS.map(qt => (
                            <button
                                key={qt.label}
                                onClick={() => { setTopic(qt.label); generateRoadmap(qt.label); }}
                                className="btn"
                                style={{
                                    padding: '6px 14px', fontSize: '0.82rem',
                                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                                    color: 'var(--text-secondary)', gap: 6
                                }}
                            >
                                {qt.icon} {qt.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <div style={{ fontSize: '3rem', marginBottom: 16 }}>🤖</div>
                    <h3 style={{ fontWeight: 700, marginBottom: 8 }}>AI is crafting your roadmap...</h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: 28 }}>Building a personalized learning path for <strong style={{ color: 'var(--neon-purple)' }}>{topic}</strong></p>
                    <div style={{ display: 'flex', justifyContent: 'center' }}><Spinner /></div>
                </div>
            )}

            {/* Roadmap Output */}
            {roadmap && !loading && (
                <div>
                    {/* Roadmap Header */}
                    <div className="card" style={{ marginBottom: 24, background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))', borderColor: 'rgba(99,102,241,0.3)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                            <div>
                                <h2 style={{ fontWeight: 800, fontSize: '1.4rem', marginBottom: 6 }}>{roadmap.title}</h2>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 12 }}>{roadmap.description}</p>
                                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                                    <span className="badge badge-purple">⏱️ ~{roadmap.estimatedDays} days</span>
                                    <span className="badge badge-orange">📚 {roadmap.stages?.length || 0} stages</span>
                                    <span className="badge" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
                                        ✅ {totalProgress.done}/{totalProgress.total} done
                                    </span>
                                </div>
                            </div>
                            <div style={{ textAlign: 'center', minWidth: 80 }}>
                                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--neon-purple)' }}>{totalProgress.pct}%</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Overall</div>
                            </div>
                        </div>
                        {/* Overall progress bar */}
                        <div style={{ marginTop: 16, height: 8, borderRadius: 99, background: 'var(--bg-card)', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${totalProgress.pct}%`, background: 'var(--grad-primary)', borderRadius: 99, transition: 'width 0.5s ease' }} />
                        </div>
                    </div>

                    {/* Stages */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {roadmap.stages.map((stage, si) => {
                            const { done, total, pct } = getStageProgress(stage);
                            const isExpanded = expandedStage === si;
                            const isComplete = done === total && total > 0;

                            return (
                                <div key={stage.id} className="card" style={{
                                    padding: 0, overflow: 'hidden',
                                    borderColor: isComplete ? `${stage.color}55` : 'var(--border)',
                                    transition: 'all 0.3s ease'
                                }}>
                                    {/* Stage Header */}
                                    <div
                                        onClick={() => setExpandedStage(isExpanded ? -1 : si)}
                                        style={{
                                            padding: '18px 24px', cursor: 'pointer', display: 'flex',
                                            alignItems: 'center', gap: 16,
                                            background: isExpanded ? `${stage.color}12` : 'transparent',
                                            transition: 'background 0.3s'
                                        }}
                                    >
                                        <div style={{
                                            width: 48, height: 48, borderRadius: '50%',
                                            background: `${stage.color}22`, border: `2px solid ${stage.color}55`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '1.4rem', flexShrink: 0
                                        }}>
                                            {isComplete ? '✅' : stage.icon}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                                                <span style={{ fontWeight: 700, fontSize: '1rem', color: stage.color }}>
                                                    Stage {si + 1}: {stage.title}
                                                </span>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'var(--bg-card)', padding: '2px 10px', borderRadius: 99 }}>
                                                    {stage.duration}
                                                </span>
                                            </div>
                                            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0, marginBottom: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {stage.description}
                                            </p>
                                            {/* Stage progress bar */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div style={{ flex: 1, height: 5, borderRadius: 99, background: 'var(--border)' }}>
                                                    <div style={{ height: '100%', width: `${pct}%`, background: stage.color, borderRadius: 99, transition: 'width 0.5s ease' }} />
                                                </div>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', flexShrink: 0 }}>{done}/{total}</span>
                                            </div>
                                        </div>
                                        <span style={{ color: 'var(--text-muted)', flexShrink: 0, fontSize: '1.1rem' }}>
                                            {isExpanded ? '▲' : '▼'}
                                        </span>
                                    </div>

                                    {/* Stage Steps */}
                                    {isExpanded && (
                                        <div style={{ borderTop: `1px solid var(--border)` }}>
                                            {stage.steps.map((step, idx) => {
                                                const key = `${stage.id}_${step.id}`;
                                                const done = completedSteps[key];
                                                return (
                                                    <div
                                                        key={step.id}
                                                        onClick={() => toggleStep(stage.id, step.id)}
                                                        style={{
                                                            padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 14,
                                                            cursor: 'pointer', borderBottom: idx < stage.steps.length - 1 ? '1px solid var(--border)' : 'none',
                                                            background: done ? `${stage.color}08` : 'transparent',
                                                            transition: 'background 0.2s'
                                                        }}
                                                    >
                                                        {/* Step number / check */}
                                                        <div style={{
                                                            width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                                                            background: done ? stage.color : 'var(--bg-card)',
                                                            border: `2px solid ${done ? stage.color : 'var(--border)'}`,
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            fontSize: '0.75rem', fontWeight: 700, color: done ? 'white' : 'var(--text-muted)',
                                                            transition: 'all 0.2s'
                                                        }}>
                                                            {done ? '✓' : idx + 1}
                                                        </div>
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{
                                                                fontWeight: 600, fontSize: '0.9rem',
                                                                color: done ? 'var(--text-muted)' : 'var(--text-primary)',
                                                                textDecoration: done ? 'line-through' : 'none',
                                                                transition: 'all 0.2s'
                                                            }}>
                                                                {step.title}
                                                            </div>
                                                            {step.resource && (
                                                                <div style={{ fontSize: '0.77rem', color: 'var(--text-muted)', marginTop: 2 }}>
                                                                    💡 {step.resource}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Bottom Actions */}
                    <div style={{ display: 'flex', gap: 12, marginTop: 28, flexWrap: 'wrap' }}>
                        <button
                            onClick={() => { setRoadmap(null); setTopic(''); setCompletedSteps({}); }}
                            className="btn btn-secondary"
                        >
                            🔄 New Topic
                        </button>
                        <button
                            onClick={() => generateRoadmap(topic)}
                            className="btn btn-secondary"
                        >
                            ✨ Regenerate
                        </button>
                        {totalProgress.pct === 100 && (
                            <div className="badge badge-orange" style={{ padding: '8px 18px', fontSize: '0.95rem' }}>
                                🏆 Roadmap Complete! Excellent work!
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Empty State (no roadmap generated yet) */}
            {!roadmap && !loading && (
                <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '4rem', marginBottom: 16 }}>🗺️</div>
                    <h3 style={{ fontWeight: 700, marginBottom: 8, color: 'var(--text-secondary)' }}>Your roadmap will appear here</h3>
                    <p style={{ fontSize: '0.9rem' }}>Type any topic above or click a quick pick to get started!</p>
                </div>
            )}
        </div>
    );
}
