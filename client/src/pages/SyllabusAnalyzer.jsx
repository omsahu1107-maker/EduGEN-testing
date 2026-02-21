import { useState, useRef, useEffect } from 'react';

/* ═══════════════════════════════════════════════════════════════
   AI ENGINE — pure keyword/pattern analysis, no external API
═══════════════════════════════════════════════════════════════ */

const EASY_KEYWORDS = [
    'introduction', 'intro', 'basics', 'basic', 'overview', 'definition', 'what is',
    'concept', 'nature', 'types', 'classification', 'simple', 'fundamental', 'meaning',
    'scope', 'history', 'units', 'notation', 'terms', 'terminology', 'identify',
];
const HARD_KEYWORDS = [
    'derivation', 'derive', 'proof', 'theorem', 'advanced', 'complex', 'analysis',
    'integration', 'differential', 'calculus', 'quantum', 'relativity', 'mechanism',
    'synthesis', 'evaluation', 'critical', 'algorithm', 'optimize', 'transform',
    'convergence', 'divergence', 'abstract', 'partial', 'stochastic',
];

function classifyDifficulty(topic) {
    const t = topic.toLowerCase();
    if (HARD_KEYWORDS.some(k => t.includes(k))) return 'Hard';
    if (EASY_KEYWORDS.some(k => t.includes(k))) return 'Easy';
    return 'Medium';
}

function estimateHours(difficulty) {
    return { Easy: 1.5, Medium: 2.5, Hard: 4 }[difficulty];
}

/* Extract topics from raw syllabus text */
function extractTopics(text) {
    const lines = text
        .split('\n')
        .map(l => l.trim())
        // remove chapter/unit headings and very short lines
        .filter(l => {
            if (!l) return false;
            if (l.length < 4) return false;
            // skip pure-number lines or "Unit 1", "Chapter 2" etc.
            if (/^(unit|chapter|module|section)\s*\d+/i.test(l)) return false;
            // skip lines that are just numbering like "1." alone
            if (/^\d+[\.\)]\s*$/.test(l)) return false;
            return true;
        })
        .map(l =>
            // strip leading bullets / numbers  "1. " "a) " "• " "- "
            l.replace(/^[\d]+[\.\)]\s*/, '')
                .replace(/^[a-z][\.\)]\s*/i, '')
                .replace(/^[-•*▸►]\s*/, '')
                .replace(/\(.*?\)/g, '')   // remove parentheses content
                .trim()
        )
        .filter(l => l.length >= 4 && l.split(' ').length <= 12); // topic-length heuristic

    // deduplicate case-insensitively
    const seen = new Set();
    return lines.filter(l => {
        const key = l.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    }).slice(0, 20); // cap at 20 topics for usability
}

/* Generate MCQs */
const MCQ_TEMPLATES = [
    (t) => ({
        q: `Which of the following BEST describes "${t}"?`,
        options: [
            `A detailed study of ${t} and its properties`,
            `An unrelated concept in modern science`,
            `A historical event in the field`,
            `A mathematical function only`,
        ],
        ans: 0,
    }),
    (t) => ({
        q: `"${t}" is primarily concerned with:`,
        options: [
            `Understanding its core principles and applications`,
            `Memorising unrelated facts`,
            `Physical geography`,
            `None of the above`,
        ],
        ans: 0,
    }),
    (t) => ({
        q: `Which statement about "${t}" is CORRECT?`,
        options: [
            `It has no real-world applications`,
            `It forms a foundational part of the subject`,
            `It was discovered in the 20th century only`,
            `It applies only to engineering`,
        ],
        ans: 1,
    }),
    (t) => ({
        q: `A student studying "${t}" should first understand:`,
        options: [
            `Its historical background and significance`,
            `Unrelated advanced topics`,
            `Only numerical problems`,
            `None of the above`,
        ],
        ans: 0,
    }),
    (t) => ({
        q: `The most important aspect of "${t}" in examinations involves:`,
        options: [
            `Conceptual clarity and application`,
            `Rote memorisation of dates`,
            `Skipping derivations`,
            `Learning only definitions`,
        ],
        ans: 0,
    }),
];

const SHORT_TEMPLATES = [
    (t) => `Define "${t}" and state two of its key characteristics.`,
    (t) => `Explain the significance of "${t}" in your subject with a real-world example.`,
    (t) => `Differentiate between "${t}" and a closely related concept.`,
    (t) => `List the steps involved in understanding "${t}" from scratch.`,
];

function generateQuestions(topic) {
    const mcqs = MCQ_TEMPLATES.map(fn => fn(topic));
    const shorts = [SHORT_TEMPLATES[0](topic), SHORT_TEMPLATES[1](topic)];
    return { mcqs, shorts };
}

/* Build study plan */
function buildStudyPlan(topics) {
    const plan = [];
    let day = 1;
    const groups = [
        topics.filter(t => t.difficulty === 'Easy'),
        topics.filter(t => t.difficulty === 'Medium'),
        topics.filter(t => t.difficulty === 'Hard'),
    ];
    groups.forEach((group, gi) => {
        group.forEach((t, ti) => {
            plan.push({ day: day++, topic: t.name, type: 'Study', difficulty: t.difficulty });
        });
        if (group.length) {
            plan.push({ day: day++, topic: `${['Easy', 'Medium', 'Hard'][gi]} Topics Revision`, type: 'Revision', difficulty: ['Easy', 'Medium', 'Hard'][gi] });
        }
    });
    plan.push({ day: day++, topic: 'Full Syllabus Revision', type: 'Revision', difficulty: 'Medium' });
    plan.push({ day: day++, topic: 'Mock Test + Error Analysis', type: 'Test', difficulty: 'Hard' });
    plan.push({ day: day, topic: 'Final Revision & Confidence Building', type: 'Revision', difficulty: 'Easy' });
    return plan;
}

/* Build flowchart steps */
function buildFlowchart(topics) {
    const easy = topics.filter(t => t.difficulty === 'Easy');
    const medium = topics.filter(t => t.difficulty === 'Medium');
    const hard = topics.filter(t => t.difficulty === 'Hard');
    return [
        { label: '🚀 Start', sub: 'Begin your EduGen journey', type: 'start' },
        { label: '📖 Foundation Concepts', sub: easy.map(t => t.name).join(', ') || '—', type: 'easy' },
        { label: '🔷 Core Topics', sub: medium.map(t => t.name).join(', ') || '—', type: 'medium' },
        { label: '🔥 Advanced Topics', sub: hard.map(t => t.name).join(', ') || '—', type: 'hard' },
        { label: '📝 Practice Questions', sub: 'MCQs & Short Answers per topic', type: 'practice' },
        { label: '🔁 Topic-wise Revision', sub: 'Review notes, mind maps, flashcards', type: 'revision' },
        { label: '📊 Mock Test', sub: 'Full timed test — identify weak areas', type: 'test' },
        { label: '✅ Final Revision', sub: 'Quick-read summaries, formula sheets', type: 'final' },
        { label: '🏆 Goal Achieved!', sub: 'Syllabus complete — you are exam ready', type: 'done' },
    ];
}

const FLOW_COLORS = {
    start: { bg: 'rgba(99,102,241,0.18)', border: '#6366f1', dot: '#818cf8' },
    easy: { bg: 'rgba(16,185,129,0.12)', border: '#10b981', dot: '#34d399' },
    medium: { bg: 'rgba(245,158,11,0.12)', border: '#f59e0b', dot: '#fbbf24' },
    hard: { bg: 'rgba(239,68,68,0.12)', border: '#ef4444', dot: '#f87171' },
    practice: { bg: 'rgba(14,165,233,0.12)', border: '#0ea5e9', dot: '#38bdf8' },
    revision: { bg: 'rgba(168,85,247,0.12)', border: '#a855f7', dot: '#c084fc' },
    test: { bg: 'rgba(249,115,22,0.12)', border: '#f97316', dot: '#fb923c' },
    final: { bg: 'rgba(20,184,166,0.12)', border: '#14b8a6', dot: '#2dd4bf' },
    done: { bg: 'rgba(99,102,241,0.25)', border: '#6366f1', dot: '#a5b4fc' },
};

const DIFF_STYLE = {
    Easy: { bg: 'rgba(16,185,129,0.12)', color: '#34d399', border: '#10b98133' },
    Medium: { bg: 'rgba(245,158,11,0.12)', color: '#fbbf24', border: '#f59e0b33' },
    Hard: { bg: 'rgba(239,68,68,0.12)', color: '#f87171', border: '#ef444433' },
};
const TYPE_STYLE = {
    Study: { color: '#a5b4fc', icon: '📚' },
    Revision: { color: '#c084fc', icon: '🔁' },
    Test: { color: '#fb923c', icon: '📊' },
};

/* ═══════════════════════════════════════════════════════════════
   Component
═══════════════════════════════════════════════════════════════ */
export default function SyllabusAnalyzer() {
    const [text, setText] = useState('');
    const [fileName, setFileName] = useState('');
    const [analyzing, setAnalyzing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [result, setResult] = useState(null);   // { topics, flowchart, studyPlan, totalHours }
    const [activeTab, setActiveTab] = useState('questions');
    const [showPlan, setShowPlan] = useState(false);
    const [expandedTopic, setExpandedTopic] = useState(null);
    const fileRef = useRef(null);
    const resultRef = useRef(null);

    /* File upload handler */
    function handleFile(e) {
        const file = e.target.files[0];
        if (!file) return;
        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = ev => setText(ev.target.result);
        reader.readAsText(file);
    }

    /* Core analyzer */
    async function analyzeSyllabus() {
        const raw = text.trim();
        if (!raw) return;
        setAnalyzing(true);
        setProgress(0);
        setResult(null);
        setShowPlan(false);

        // Animate progress
        const timer = setInterval(() => {
            setProgress(p => {
                if (p >= 90) { clearInterval(timer); return 90; }
                return p + Math.random() * 18;
            });
        }, 220);

        await new Promise(r => setTimeout(r, 2200));   // simulate processing

        clearInterval(timer);
        setProgress(100);

        const names = extractTopics(raw);
        const topics = names.map(name => ({
            name,
            difficulty: classifyDifficulty(name),
            hours: estimateHours(classifyDifficulty(name)),
            questions: generateQuestions(name),
        }));
        const totalHours = topics.reduce((s, t) => s + t.hours, 0);
        const flowchart = buildFlowchart(topics);
        const studyPlan = buildStudyPlan(topics);

        await new Promise(r => setTimeout(r, 300));
        setResult({ topics, totalHours, flowchart, studyPlan });
        setAnalyzing(false);
        setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }

    return (
        <div style={css.page}>

            {/* ── Header ── */}
            <div style={css.header}>
                <div style={css.headerGlow} />
                <h1 style={css.heading}>📘 Smart Syllabus Analyzer</h1>
                <p style={css.subheading}>
                    Paste or upload your syllabus — AI extracts topics, generates practice questions
                    and builds your optimal study plan.
                </p>
            </div>

            {/* ── Input card ── */}
            <div style={css.card}>
                <div style={css.cardLabel}>📥 Step 1 — Input Your Syllabus</div>

                {/* Upload strip */}
                <div
                    style={css.uploadZone}
                    onClick={() => fileRef.current.click()}
                    onDragOver={e => { e.preventDefault(); }}
                    onDrop={e => { e.preventDefault(); handleFile({ target: { files: e.dataTransfer.files } }); }}
                >
                    <input ref={fileRef} type="file" accept=".txt,.pdf" style={{ display: 'none' }} onChange={handleFile} />
                    <span style={{ fontSize: '2rem' }}>📤</span>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: 700, color: '#c4b5fd', fontSize: '0.85rem' }}>
                            {fileName || 'Drop a .TXT or .PDF file here'}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: 3 }}>
                            or click to browse — {fileName ? '✅ loaded' : 'plain-text files work best'}
                        </div>
                    </div>
                </div>

                <div style={css.orRow}><span style={css.orLine} /><span style={css.orText}>OR paste text below</span><span style={css.orLine} /></div>

                {/* Textarea */}
                <textarea
                    value={text}
                    onChange={e => setText(e.target.value)}
                    placeholder={'Paste your syllabus here…\n\nExample:\n1. Introduction to Physics\n2. Laws of Motion\n3. Work, Energy & Power\n4. Atomic Structure\n5. Chemical Bonding\n6. Cell Division\n7. Calculus Fundamentals\n8. Integration and Differentiation'}
                    style={css.textarea}
                    rows={10}
                />

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                    <span style={{ fontSize: '0.72rem', color: '#4b5563' }}>
                        {text.length} characters · ~{text.split('\n').filter(Boolean).length} lines
                    </span>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button
                            onClick={() => { setText(''); setFileName(''); setResult(null); setProgress(0); }}
                            style={css.btnSecondary}
                        >🗑 Clear</button>
                        <button
                            onClick={analyzeSyllabus}
                            disabled={!text.trim() || analyzing}
                            style={!text.trim() || analyzing ? css.btnDisabled : css.btnPrimary}
                        >
                            {analyzing ? '🧠 Analyzing…' : '🔍 Analyze Syllabus'}
                        </button>
                    </div>
                </div>

                {/* Progress bar */}
                {(analyzing || progress > 0) && (
                    <div style={{ marginTop: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#6b7280', marginBottom: 6 }}>
                            <span>{analyzing ? '🧠 AI is processing your syllabus…' : '✅ Analysis complete!'}</span>
                            <span style={{ color: '#a78bfa', fontWeight: 700 }}>{Math.min(100, Math.floor(progress))}%</span>
                        </div>
                        <div style={css.progressTrack}>
                            <div style={{ ...css.progressFill, width: `${Math.min(100, progress)}%` }} />
                        </div>
                        {analyzing && (
                            <div style={{ display: 'flex', gap: 12, marginTop: 10, flexWrap: 'wrap' }}>
                                {['Extracting topics', 'Classifying difficulty', 'Generating questions', 'Building flowchart'].map((s, i) => (
                                    <span key={i} style={{
                                        fontSize: '0.68rem', color: progress > i * 25 ? '#a78bfa' : '#374151',
                                        background: progress > i * 25 ? 'rgba(167,139,250,0.1)' : 'rgba(255,255,255,0.03)',
                                        border: `1px solid ${progress > i * 25 ? 'rgba(167,139,250,0.25)' : 'transparent'}`,
                                        padding: '3px 10px', borderRadius: 99, transition: 'all .4s',
                                    }}>
                                        {progress > i * 25 ? '✓ ' : '◌ '}{s}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ── Results ── */}
            {result && (
                <div ref={resultRef}>
                    {/* Stats row */}
                    <div style={css.statsRow}>
                        {[
                            { icon: '📚', val: result.topics.length, label: 'Topics found' },
                            { icon: '🟢', val: result.topics.filter(t => t.difficulty === 'Easy').length, label: 'Easy' },
                            { icon: '🟡', val: result.topics.filter(t => t.difficulty === 'Medium').length, label: 'Medium' },
                            { icon: '🔴', val: result.topics.filter(t => t.difficulty === 'Hard').length, label: 'Hard' },
                            { icon: '⏱', val: `${result.totalHours.toFixed(1)}h`, label: 'Total study time' },
                            { icon: '📝', val: result.topics.length * 7, label: 'Questions generated' },
                        ].map((s, i) => (
                            <div key={i} style={css.statCard}>
                                <div style={{ fontSize: '1.5rem' }}>{s.icon}</div>
                                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#e2e8f0' }}>{s.val}</div>
                                <div style={{ fontSize: '0.68rem', color: '#6b7280' }}>{s.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Tab bar */}
                    <div style={css.tabs}>
                        {[
                            { key: 'questions', label: '📊 Practice Questions' },
                            { key: 'flowchart', label: '🗺 Study Flowchart' },
                        ].map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                style={activeTab === tab.key ? css.tabActive : css.tab}
                            >{tab.label}</button>
                        ))}
                    </div>

                    {/* ─── TAB: Questions ─── */}
                    {activeTab === 'questions' && (
                        <div>
                            <div style={css.sectionTitle}>📊 Generated Practice Questions</div>
                            {result.topics.map((topic, ti) => {
                                const ds = DIFF_STYLE[topic.difficulty];
                                const isOpen = expandedTopic === ti;
                                return (
                                    <div key={ti} style={css.topicCard}>
                                        {/* Topic header — clickable */}
                                        <button
                                            onClick={() => setExpandedTopic(isOpen ? null : ti)}
                                            style={css.topicHeader}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                                                <span style={{ ...css.diffBadge, background: ds.bg, color: ds.color, borderColor: ds.border }}>
                                                    {topic.difficulty}
                                                </span>
                                                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#e2e8f0', textAlign: 'left' }}>
                                                    {ti + 1}. {topic.name}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                                                <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>⏱ {topic.hours}h</span>
                                                <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>7 Qs</span>
                                                <span style={{
                                                    color: '#6366f1', fontSize: '1rem', transition: 'transform .25s',
                                                    display: 'inline-block', transform: isOpen ? 'rotate(180deg)' : 'rotate(0)'
                                                }}>▼</span>
                                            </div>
                                        </button>

                                        {/* Expanded content */}
                                        {isOpen && (
                                            <div style={{ padding: '0 16px 16px' }}>
                                                {/* MCQs */}
                                                <div style={css.qSection}>Multiple Choice Questions (MCQ)</div>
                                                {topic.questions.mcqs.map((mcq, qi) => (
                                                    <div key={qi} style={css.mcqCard}>
                                                        <div style={css.mcqQ}>Q{qi + 1}. {mcq.q}</div>
                                                        <div style={css.mcqOptions}>
                                                            {mcq.options.map((opt, oi) => (
                                                                <div key={oi} style={{
                                                                    ...css.mcqOpt,
                                                                    background: oi === mcq.ans ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.03)',
                                                                    borderColor: oi === mcq.ans ? '#10b98133' : 'rgba(255,255,255,0.06)',
                                                                    color: oi === mcq.ans ? '#34d399' : '#9ca3af',
                                                                }}>
                                                                    <span style={{ fontWeight: 700, marginRight: 6, color: oi === mcq.ans ? '#34d399' : '#4b5563' }}>
                                                                        {['A', 'B', 'C', 'D'][oi]}.
                                                                    </span>
                                                                    {opt}
                                                                    {oi === mcq.ans && <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#34d399' }}>✓ Answer</span>}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}

                                                {/* Short Answers */}
                                                <div style={css.qSection}>Short Answer Questions</div>
                                                {topic.questions.shorts.map((sq, si) => (
                                                    <div key={si} style={css.shortCard}>
                                                        <span style={{ color: '#6366f1', fontWeight: 700, marginRight: 8 }}>Q{si + 1}.</span>
                                                        {sq}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* ─── TAB: Flowchart ─── */}
                    {activeTab === 'flowchart' && (
                        <div>
                            <div style={css.sectionTitle}>🗺 Optimal Study Flowchart</div>

                            {/* Info strip */}
                            <div style={css.infoStrip}>
                                <span>⏱ Total estimated time: <strong style={{ color: '#a78bfa' }}>{result.totalHours.toFixed(1)} hours</strong></span>
                                <span>📅 Recommended duration: <strong style={{ color: '#38bdf8' }}>{result.studyPlan.length} days</strong></span>
                                <span>🎯 Priority: Easy → Medium → Hard</span>
                            </div>

                            {/* Flowchart */}
                            <div style={css.flowchart}>
                                {result.flowchart.map((step, si) => {
                                    const cl = FLOW_COLORS[step.type];
                                    return (
                                        <div key={si} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                            <div style={{ ...css.flowBox, background: cl.bg, borderColor: cl.border }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    <span style={{ ...css.flowDot, background: cl.dot, boxShadow: `0 0 8px ${cl.dot}` }} />
                                                    <div>
                                                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#e2e8f0' }}>{step.label}</div>
                                                        <div style={{ fontSize: '0.68rem', color: '#9ca3af', marginTop: 2, lineHeight: 1.4 }}>
                                                            {step.sub.length > 80 ? step.sub.slice(0, 80) + '…' : step.sub}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            {si < result.flowchart.length - 1 && (
                                                <div style={css.flowArrow}>↓</div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Priority list */}
                            <div style={{ ...css.card, marginTop: 20 }}>
                                <div style={css.cardLabel}>🎯 Topic Priority Order</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {result.topics.map((t, i) => {
                                        const ds = DIFF_STYLE[t.difficulty];
                                        return (
                                            <div key={i} style={css.priorityRow}>
                                                <span style={{ ...css.rankBadge }}>{i + 1}</span>
                                                <span style={{ flex: 1, fontSize: '0.84rem', color: '#e2e8f0' }}>{t.name}</span>
                                                <span style={{ ...css.diffBadge, background: ds.bg, color: ds.color, borderColor: ds.border }}>{t.difficulty}</span>
                                                <span style={{ fontSize: '0.72rem', color: '#6b7280' }}>⏱ {t.hours}h</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Generate Smart Study Plan ── */}
                    <div style={{ textAlign: 'center', marginTop: 28 }}>
                        <button
                            onClick={() => setShowPlan(p => !p)}
                            style={css.btnGreen}
                        >
                            📅 {showPlan ? 'Hide' : 'Generate'} Smart Study Plan
                        </button>
                    </div>

                    {showPlan && (
                        <div style={{ ...css.card, marginTop: 20 }}>
                            <div style={css.cardLabel}>📅 Smart Day-by-Day Study Plan</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {result.studyPlan.map((day, i) => {
                                    const ts = TYPE_STYLE[day.type];
                                    const ds = DIFF_STYLE[day.difficulty] || { bg: 'rgba(255,255,255,0.04)', color: '#94a3b8', border: 'transparent' };
                                    return (
                                        <div key={i} style={css.dayRow}>
                                            <div style={css.dayBadge}>Day {day.day}</div>
                                            <span style={{ fontSize: '1rem' }}>{ts.icon}</span>
                                            <span style={{ flex: 1, fontSize: '0.84rem', color: '#e2e8f0' }}>{day.topic}</span>
                                            <span style={{ ...css.diffBadge, background: ds.bg, color: ds.color, borderColor: ds.border, fontSize: '0.65rem' }}>
                                                {day.type}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                            <div style={{
                                marginTop: 16, padding: '12px 14px', borderRadius: 10,
                                background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)'
                            }}>
                                <span style={{ fontSize: '0.78rem', color: '#a5b4fc' }}>
                                    💡 Tip: Study each topic for the estimated hours, take short breaks, and always revise the previous day's topic before starting a new one.
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <style>{`
                @keyframes sa-pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
                textarea::placeholder { color:#374151; }
                textarea:focus { outline:none; border-color:rgba(99,102,241,0.5) !important; box-shadow:0 0 0 3px rgba(99,102,241,0.08); }
            `}</style>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   Styles
═══════════════════════════════════════════════════════════════ */
const css = {
    page: {
        minHeight: '100vh', padding: '28px 24px 80px',
        maxWidth: 1100, margin: '0 auto',
        fontFamily: "'Inter','Segoe UI',sans-serif", color: '#e2e8f0',
    },
    header: { position: 'relative', marginBottom: 32, overflow: 'hidden' },
    headerGlow: {
        position: 'absolute', inset: 0, zIndex: 0,
        background: 'radial-gradient(ellipse 60% 80% at 50% -30%,rgba(99,102,241,0.12),transparent)',
        pointerEvents: 'none',
    },
    heading: {
        fontSize: 'clamp(1.7rem,3.5vw,2.6rem)', fontWeight: 900, margin: '0 0 8px', position: 'relative',
        background: 'linear-gradient(120deg,#818cf8,#c084fc,#38bdf8)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    },
    subheading: { fontSize: '0.9rem', color: '#6b7280', margin: 0, position: 'relative', maxWidth: 580 },

    card: {
        background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 16, padding: '20px 22px', marginBottom: 20,
        backdropFilter: 'blur(20px)',
    },
    cardLabel: { fontSize: '0.75rem', fontWeight: 700, color: '#6366f1', letterSpacing: '0.08em', marginBottom: 14, textTransform: 'uppercase' },

    uploadZone: {
        border: '2px dashed rgba(99,102,241,0.3)', borderRadius: 12, padding: '22px 16px',
        display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer',
        background: 'rgba(99,102,241,0.04)', marginBottom: 14, transition: 'all .2s',
    },

    orRow: { display: 'flex', alignItems: 'center', gap: 12, margin: '14px 0' },
    orLine: { flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' },
    orText: { fontSize: '0.72rem', color: '#4b5563', whiteSpace: 'nowrap' },

    textarea: {
        width: '100%', resize: 'vertical', padding: '12px 14px',
        background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 10, color: '#e2e8f0', fontSize: '0.83rem', fontFamily: 'inherit',
        lineHeight: 1.7, marginBottom: 12, boxSizing: 'border-box', transition: 'border-color .2s',
    },

    progressTrack: { height: 7, borderRadius: 99, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 99, background: 'linear-gradient(90deg,#6366f1,#a78bfa,#38bdf8)', transition: 'width .25s ease' },

    btnPrimary: {
        padding: '10px 24px', borderRadius: 9, border: 'none', cursor: 'pointer',
        background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff',
        fontSize: '0.85rem', fontWeight: 700, transition: 'opacity .2s',
    },
    btnSecondary: {
        padding: '10px 18px', borderRadius: 9, cursor: 'pointer',
        border: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(255,255,255,0.04)', color: '#9ca3af',
        fontSize: '0.82rem', fontWeight: 600,
    },
    btnDisabled: {
        padding: '10px 24px', borderRadius: 9, border: 'none', cursor: 'not-allowed',
        background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.2)',
        fontSize: '0.85rem', fontWeight: 700,
    },
    btnGreen: {
        padding: '12px 32px', borderRadius: 10, border: 'none', cursor: 'pointer',
        background: 'linear-gradient(135deg,#059669,#10b981)', color: '#fff',
        fontSize: '0.9rem', fontWeight: 800, boxShadow: '0 4px 20px rgba(16,185,129,0.25)',
        transition: 'opacity .2s',
    },

    statsRow: {
        display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 20,
    },
    statCard: {
        flex: '1 1 120px', background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14,
        padding: '16px 14px', display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 4, backdropFilter: 'blur(10px)',
    },

    tabs: { display: 'flex', gap: 10, marginBottom: 20 },
    tab: {
        padding: '8px 20px', borderRadius: 99,
        border: '1px solid rgba(255,255,255,0.09)', background: 'rgba(255,255,255,0.03)',
        color: '#9ca3af', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all .2s',
    },
    tabActive: {
        padding: '8px 20px', borderRadius: 99,
        border: '1px solid #6366f1', background: 'rgba(99,102,241,0.18)',
        color: '#a5b4fc', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', transition: 'all .2s',
    },

    sectionTitle: {
        fontSize: '1.1rem', fontWeight: 800, color: '#e2e8f0', marginBottom: 14,
        borderLeft: '3px solid #6366f1', paddingLeft: 12,
    },

    topicCard: {
        background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 14, marginBottom: 10, overflow: 'hidden', backdropFilter: 'blur(10px)',
    },
    topicHeader: {
        width: '100%', display: 'flex', alignItems: 'center', gap: 10,
        padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer',
        transition: 'background .18s',
    },
    diffBadge: {
        fontSize: '0.65rem', fontWeight: 700, padding: '3px 10px', borderRadius: 99,
        border: '1px solid', letterSpacing: '0.05em', flexShrink: 0,
    },
    qSection: {
        fontSize: '0.72rem', fontWeight: 700, color: '#6366f1', letterSpacing: '0.08em',
        textTransform: 'uppercase', marginTop: 14, marginBottom: 8, borderBottom: '1px solid rgba(99,102,241,0.15)', paddingBottom: 6,
    },
    mcqCard: { marginBottom: 12 },
    mcqQ: { fontSize: '0.82rem', color: '#cbd5e1', marginBottom: 8, fontWeight: 600, lineHeight: 1.5 },
    mcqOptions: { display: 'flex', flexDirection: 'column', gap: 5 },
    mcqOpt: {
        display: 'flex', alignItems: 'center', gap: 0,
        fontSize: '0.78rem', padding: '7px 12px', borderRadius: 7,
        border: '1px solid', transition: 'all .15s',
    },
    shortCard: {
        background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.1)',
        borderRadius: 8, padding: '10px 14px', fontSize: '0.81rem', color: '#94a3b8',
        lineHeight: 1.6, marginBottom: 7, display: 'flex',
    },

    infoStrip: {
        display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 20,
        padding: '12px 16px', background: 'rgba(255,255,255,0.025)',
        border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10,
        fontSize: '0.78rem', color: '#9ca3af',
    },

    flowchart: {
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0,
        maxWidth: 600, margin: '0 auto',
    },
    flowBox: {
        width: '100%', padding: '14px 18px', borderRadius: 12, border: '1.5px solid',
        transition: 'all .2s', backdropFilter: 'blur(10px)',
    },
    flowDot: {
        width: 10, height: 10, borderRadius: '50%', flexShrink: 0, display: 'inline-block',
    },
    flowArrow: {
        fontSize: '1.4rem', color: 'rgba(99,102,241,0.5)',
        lineHeight: 1, paddingTop: 4, paddingBottom: 4,
    },

    priorityRow: {
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '8px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.025)',
        border: '1px solid rgba(255,255,255,0.05)', transition: 'background .18s',
    },
    rankBadge: {
        width: 26, height: 26, borderRadius: '50%', background: 'rgba(99,102,241,0.15)',
        color: '#818cf8', fontSize: '0.72rem', fontWeight: 800, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '1px solid rgba(99,102,241,0.2)',
    },

    dayRow: {
        display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
        borderRadius: 9, background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.05)',
    },
    dayBadge: {
        fontSize: '0.68rem', fontWeight: 800, color: '#6366f1',
        background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)',
        padding: '2px 9px', borderRadius: 99, flexShrink: 0, whiteSpace: 'nowrap',
    },
};
