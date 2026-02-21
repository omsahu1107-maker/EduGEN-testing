import { useState, useRef, useEffect } from 'react';

/* ═══════════════════════════════════════════════════════════════
   DATA — real YouTube video IDs for Physics, Maths, Chemistry
═══════════════════════════════════════════════════════════════ */
const CATEGORIES = ['All', 'Physics', 'Mathematics', 'Chemistry', 'Biology'];

const LESSONS = [
    /* ── Physics ── */
    {
        id: 1, category: 'Physics',
        title: 'Introduction to Physics',
        desc: 'What is physics? Fundamental quantities, units and measurement.',
        videoId: 'b1t41Q3xRM8',
        duration: '12:45', thumb: '🔭',
    },
    {
        id: 2, category: 'Physics',
        title: 'Laws of Motion',
        desc: "Newton's three laws explained with real-world examples.",
        videoId: 'NYd6wzYkQIM',
        duration: '18:30', thumb: '⚙️',
    },
    {
        id: 3, category: 'Physics',
        title: 'Work, Energy & Power',
        desc: 'Kinetic & potential energy, conservation law, power calculation.',
        videoId: 'w4QFJb9a8vo',
        duration: '20:15', thumb: '⚡',
    },
    {
        id: 4, category: 'Physics',
        title: 'Waves Basics',
        desc: 'Transverse vs longitudinal waves, frequency, wavelength, amplitude.',
        videoId: 'Rbuhdo0AZDU',
        duration: '15:00', thumb: '🌊',
    },
    {
        id: 5, category: 'Physics',
        title: 'Revision & Quiz Explanation',
        desc: 'Complete chapter revision with MCQ walkthrough.',
        videoId: 'ZM8ECpBuQYE',
        duration: '22:10', thumb: '📝',
    },
    /* ── Mathematics ── */
    {
        id: 6, category: 'Mathematics',
        title: 'Introduction to Calculus',
        desc: 'Limits, derivatives and the fundamental theorem of calculus.',
        videoId: 'WUvTyaaNkzM',
        duration: '16:20', thumb: '∫',
    },
    {
        id: 7, category: 'Mathematics',
        title: 'Algebra Fundamentals',
        desc: 'Linear equations, quadratics and systems of equations.',
        videoId: 'NybHckSEQBI',
        duration: '19:45', thumb: 'x²',
    },
    /* ── Chemistry ── */
    {
        id: 8, category: 'Chemistry',
        title: 'Atomic Structure',
        desc: 'Protons, neutrons, electrons and the periodic table.',
        videoId: 'Vqbk9cDX0l0',
        duration: '14:55', thumb: '⚛️',
    },
    {
        id: 9, category: 'Chemistry',
        title: 'Chemical Bonding',
        desc: 'Ionic, covalent, and metallic bonds explained simply.',
        videoId: 'CGA8sRwqIFg',
        duration: '17:30', thumb: '🧪',
    },
    /* ── Biology ── */
    {
        id: 10, category: 'Biology',
        title: 'Cell Structure',
        desc: 'Plant vs animal cells, organelles and their functions.',
        videoId: 'URUJD5NEXC8',
        duration: '13:15', thumb: '🧬',
    },
];

/* ═══════════════════════════════════════════════════════════════
   Component
═══════════════════════════════════════════════════════════════ */
export default function LearningVideos() {
    const [activeLesson, setActiveLesson] = useState(LESSONS[0]);
    const [category, setCategory] = useState('All');
    const [search, setSearch] = useState('');
    const [watched, setWatched] = useState(new Set());
    const [iframeKey, setIframeKey] = useState(0);   // force iframe reload
    const playerRef = useRef(null);

    const filtered = LESSONS.filter(l => {
        const matchCat = category === 'All' || l.category === category;
        const matchQ = l.title.toLowerCase().includes(search.toLowerCase()) ||
            l.desc.toLowerCase().includes(search.toLowerCase());
        return matchCat && matchQ;
    });

    function changeVideo(lesson) {
        setActiveLesson(lesson);
        setIframeKey(k => k + 1);   // remounts iframe so new video starts cleanly
        setWatched(prev => new Set([...prev, lesson.id]));
        // scroll player into view on mobile
        playerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Mark first lesson as watched on load
    useEffect(() => {
        setWatched(new Set([LESSONS[0].id]));
    }, []);

    const progress = Math.round((watched.size / LESSONS.length) * 100);

    return (
        <div style={styles.page}>

            {/* ── Page Header ── */}
            <div style={styles.header}>
                <h1 style={styles.heading}>📚 Learning Videos</h1>
                <p style={styles.subheading}>
                    Curated lessons — Physics, Maths, Chemistry & Biology
                </p>

                {/* Progress bar */}
                <div style={styles.progressWrap}>
                    <div style={styles.progressLabel}>
                        <span>Course Progress</span>
                        <span style={{ color: '#a78bfa', fontWeight: 700 }}>{watched.size}/{LESSONS.length} lessons • {progress}%</span>
                    </div>
                    <div style={styles.progressTrack}>
                        <div style={{ ...styles.progressFill, width: `${progress}%` }} />
                    </div>
                </div>
            </div>

            {/* ── Category tabs + Search ── */}
            <div style={styles.controls}>
                <div style={styles.tabs}>
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategory(cat)}
                            style={category === cat ? styles.tabActive : styles.tab}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
                <div style={styles.searchBox}>
                    <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>🔍</span>
                    <input
                        type="text"
                        placeholder="Search lessons…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={styles.searchInput}
                    />
                </div>
            </div>

            {/* ── Main layout: player left + playlist right ── */}
            <div style={styles.layout}>

                {/* ─── Player side ─── */}
                <div style={styles.playerSide} ref={playerRef}>

                    {/* Now Playing label */}
                    <div style={styles.nowPlayingBar}>
                        <span style={styles.nowPlayingDot} />
                        <span style={styles.nowPlayingText}>NOW PLAYING</span>
                        <span style={styles.nowPlayingCat}>{activeLesson.category}</span>
                    </div>

                    {/* iFrame player */}
                    <div style={styles.videoWrapper}>
                        <iframe
                            key={iframeKey}
                            src={`https://www.youtube.com/embed/${activeLesson.videoId}?autoplay=1&rel=0&modestbranding=1`}
                            title={activeLesson.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            style={styles.iframe}
                        />
                    </div>

                    {/* Video info */}
                    <div style={styles.videoInfo}>
                        <h2 style={styles.videoTitle}>{activeLesson.thumb} {activeLesson.title}</h2>
                        <p style={styles.videoDesc}>{activeLesson.desc}</p>
                        <div style={styles.videoMeta}>
                            <span style={styles.metaTag}>⏱ {activeLesson.duration}</span>
                            <span style={styles.metaTag}>{activeLesson.category}</span>
                            {watched.has(activeLesson.id) && (
                                <span style={{ ...styles.metaTag, background: 'rgba(16,185,129,0.15)', color: '#34d399', borderColor: '#10b98133' }}>
                                    ✓ Watched
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Prev / Next navigation */}
                    <div style={styles.navBtns}>
                        <button
                            onClick={() => {
                                const idx = LESSONS.findIndex(l => l.id === activeLesson.id);
                                if (idx > 0) changeVideo(LESSONS[idx - 1]);
                            }}
                            disabled={LESSONS.findIndex(l => l.id === activeLesson.id) === 0}
                            style={styles.navBtn}
                        >
                            ← Previous
                        </button>
                        <button
                            onClick={() => {
                                const idx = LESSONS.findIndex(l => l.id === activeLesson.id);
                                if (idx < LESSONS.length - 1) changeVideo(LESSONS[idx + 1]);
                            }}
                            disabled={LESSONS.findIndex(l => l.id === activeLesson.id) === LESSONS.length - 1}
                            style={{ ...styles.navBtn, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', border: 'none' }}
                        >
                            Next →
                        </button>
                    </div>
                </div>

                {/* ─── Playlist side ─── */}
                <div style={styles.playlist}>
                    <div style={styles.playlistHeader}>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#e2e8f0' }}>📋 Playlist</span>
                        <span style={{ fontSize: '0.72rem', color: '#6b7280' }}>{filtered.length} videos</span>
                    </div>

                    <div style={styles.playlistScroll}>
                        {filtered.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#4b5563' }}>
                                <div style={{ fontSize: '2rem', marginBottom: 8 }}>🔍</div>
                                <div>No lessons match your search.</div>
                            </div>
                        ) : filtered.map((lesson, idx) => {
                            const isActive = lesson.id === activeLesson.id;
                            return (
                                <button
                                    key={lesson.id}
                                    onClick={() => changeVideo(lesson)}
                                    style={isActive ? styles.cardActive : styles.card}
                                    id={`lesson-card-${lesson.id}`}
                                >
                                    {/* Thumb circle */}
                                    <div style={{ ...styles.cardThumb, background: isActive ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.04)' }}>
                                        {isActive
                                            ? <span style={{ fontSize: '1.1rem', animation: 'lv-pulse 1s ease infinite' }}>▶</span>
                                            : <span style={{ fontSize: '1rem' }}>{lesson.thumb}</span>
                                        }
                                    </div>

                                    {/* Text */}
                                    <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
                                        <div style={{
                                            fontSize: '0.84rem', fontWeight: isActive ? 700 : 600,
                                            color: isActive ? '#a5b4fc' : '#e2e8f0',
                                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                        }}>
                                            {idx + 1}. {lesson.title}
                                        </div>
                                        <div style={{ fontSize: '0.68rem', color: '#6b7280', marginTop: 2 }}>
                                            {lesson.category} • {lesson.duration}
                                        </div>
                                    </div>

                                    {/* Watch badge */}
                                    <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                                        {watched.has(lesson.id) && (
                                            <span style={{
                                                fontSize: '0.65rem', color: '#34d399', background: 'rgba(16,185,129,0.12)',
                                                padding: '2px 6px', borderRadius: 10, whiteSpace: 'nowrap'
                                            }}>✓</span>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ── Keyframes ── */}
            <style>{`
                @keyframes lv-pulse {
                    0%,100% { opacity:1; transform:scale(1); }
                    50%      { opacity:.6; transform:scale(.85); }
                }
                /* Playlist card hover */
                #lv-playlist button:hover {
                    background: rgba(99,102,241,0.08) !important;
                    border-color: rgba(99,102,241,0.25) !important;
                }
                /* Category tab hover */
                .lv-tab:hover {
                    background: rgba(99,102,241,0.12) !important;
                    border-color: rgba(99,102,241,0.3) !important;
                    color: #c4b5fd !important;
                }
                @media (max-width: 860px) {
                    #lv-layout   { flex-direction: column !important; }
                    #lv-playlist { max-height: 420px !important; border-left: none !important; border-top: 1px solid rgba(255,255,255,0.06) !important; }
                }
            `}</style>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   Inline styles — no external CSS dependency
═══════════════════════════════════════════════════════════════ */
const styles = {
    page: {
        minHeight: '100vh',
        padding: '28px 24px 60px',
        maxWidth: 1280,
        margin: '0 auto',
        fontFamily: "'Inter','Segoe UI',sans-serif",
        color: '#e2e8f0',
    },

    /* Header */
    header: {
        marginBottom: 28,
    },
    heading: {
        fontSize: 'clamp(1.6rem,3vw,2.4rem)',
        fontWeight: 800,
        background: 'linear-gradient(120deg,#818cf8,#c084fc,#38bdf8)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        margin: '0 0 6px',
    },
    subheading: {
        fontSize: '0.9rem', color: '#6b7280', margin: '0 0 20px',
    },
    progressWrap: { marginBottom: 0 },
    progressLabel: {
        display: 'flex', justifyContent: 'space-between',
        fontSize: '0.78rem', color: '#6b7280', marginBottom: 6,
    },
    progressTrack: {
        height: 6, borderRadius: 99,
        background: 'rgba(255,255,255,0.06)', overflow: 'hidden',
    },
    progressFill: {
        height: '100%', borderRadius: 99,
        background: 'linear-gradient(90deg,#6366f1,#a78bfa)',
        transition: 'width 0.5s ease',
    },

    /* Controls */
    controls: {
        display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 12,
        marginBottom: 24,
    },
    tabs: { display: 'flex', flexWrap: 'wrap', gap: 8 },
    tab: {
        padding: '6px 14px', borderRadius: 99,
        border: '1px solid rgba(255,255,255,0.09)',
        background: 'rgba(255,255,255,0.03)',
        color: '#9ca3af', fontSize: '0.78rem', fontWeight: 600,
        cursor: 'pointer', transition: 'all .2s',
    },
    tabActive: {
        padding: '6px 14px', borderRadius: 99,
        border: '1px solid #6366f1',
        background: 'rgba(99,102,241,0.18)',
        color: '#a5b4fc', fontSize: '0.78rem', fontWeight: 700,
        cursor: 'pointer', transition: 'all .2s',
    },
    searchBox: {
        display: 'flex', alignItems: 'center', gap: 8,
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
        borderRadius: 10, padding: '7px 12px', marginLeft: 'auto',
    },
    searchInput: {
        background: 'none', border: 'none', outline: 'none',
        color: '#e2e8f0', fontSize: '0.82rem', width: 180,
    },

    /* Layout */
    layout: {
        display: 'flex', gap: 20, alignItems: 'flex-start',
    },

    /* Player side */
    playerSide: {
        flex: '1 1 0', minWidth: 0,
        background: 'rgba(255,255,255,0.025)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 18, overflow: 'hidden',
        backdropFilter: 'blur(20px)',
    },
    nowPlayingBar: {
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 16px',
        background: 'rgba(99,102,241,0.1)',
        borderBottom: '1px solid rgba(99,102,241,0.15)',
    },
    nowPlayingDot: {
        width: 8, height: 8, borderRadius: '50%',
        background: '#ef4444',
        animation: 'lv-pulse 1s ease infinite',
        flexShrink: 0,
    },
    nowPlayingText: {
        fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.1em',
        color: '#ef4444',
    },
    nowPlayingCat: {
        marginLeft: 'auto', fontSize: '0.68rem', fontWeight: 600,
        color: '#a78bfa', background: 'rgba(167,139,250,0.12)',
        padding: '2px 10px', borderRadius: 99,
    },
    videoWrapper: {
        position: 'relative', width: '100%', paddingTop: '56.25%',  // 16:9
        background: '#000',
    },
    iframe: {
        position: 'absolute', inset: 0, width: '100%', height: '100%',
        border: 'none',
    },
    videoInfo: { padding: '16px 18px 0' },
    videoTitle: {
        fontSize: 'clamp(1rem,2.2vw,1.25rem)',
        fontWeight: 800, color: '#f1f5f9', margin: '0 0 8px',
        lineHeight: 1.3,
    },
    videoDesc: {
        fontSize: '0.82rem', color: '#9ca3af', margin: '0 0 12px', lineHeight: 1.6,
    },
    videoMeta: { display: 'flex', flexWrap: 'wrap', gap: 8 },
    metaTag: {
        fontSize: '0.7rem', fontWeight: 600,
        background: 'rgba(255,255,255,0.06)', color: '#94a3b8',
        border: '1px solid rgba(255,255,255,0.08)',
        padding: '3px 10px', borderRadius: 99,
    },
    navBtns: {
        display: 'flex', gap: 10, padding: '14px 18px 18px', justifyContent: 'space-between',
    },
    navBtn: {
        flex: 1, padding: '10px 0', borderRadius: 9,
        border: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(255,255,255,0.04)', color: '#94a3b8',
        fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
        transition: 'all .2s',
    },

    /* Playlist side */
    playlist: {
        width: 320, flexShrink: 0,
        background: 'rgba(255,255,255,0.025)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 18, overflow: 'hidden',
        backdropFilter: 'blur(20px)',
        maxHeight: '85vh',
        display: 'flex', flexDirection: 'column',
    },
    playlistHeader: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 14px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        flexShrink: 0,
    },
    playlistScroll: {
        overflowY: 'auto', flex: 1,
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(99,102,241,0.3) transparent',
    },
    card: {
        width: '100%', display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 12px', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.04)',
        background: 'transparent', cursor: 'pointer', transition: 'all .18s',
        textAlign: 'left',
    },
    cardActive: {
        width: '100%', display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 12px', border: 'none', borderBottom: '1px solid rgba(99,102,241,0.2)',
        background: 'rgba(99,102,241,0.12)', cursor: 'pointer', transition: 'all .18s',
        borderLeft: '3px solid #6366f1',
        textAlign: 'left',
    },
    cardThumb: {
        width: 38, height: 38, borderRadius: 10, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.1rem', transition: 'all .18s',
    },
};
