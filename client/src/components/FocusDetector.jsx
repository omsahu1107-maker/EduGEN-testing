import { useState, useEffect, useRef, useCallback } from 'react';
import * as faceapi from 'face-api.js';
import { sounds } from '../utils/audio';

/* ─── Constants ────────────────────────────────────────────── */
const EAR_THRESHOLD = 0.22;   // below this → eyes closing
const SLEEP_SECONDS = 5;      // seconds closed before alarm
const DETECT_MS = 120;    // detection loop interval
const MODEL_URL = '/models';

/* ─── Helpers ───────────────────────────────────────────────── */
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

function calcEAR(eye) {
    const A = dist(eye[1], eye[5]);
    const B = dist(eye[2], eye[4]);
    const C = dist(eye[0], eye[3]);
    return (A + B) / (2.0 * C);
}

function playBeep() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        [[880, 0], [660, .2], [880, .4], [440, .6]].forEach(([f, s]) => {
            const o = ctx.createOscillator(), g = ctx.createGain();
            o.connect(g); g.connect(ctx.destination);
            o.frequency.value = f; o.type = 'sine';
            g.gain.setValueAtTime(0.4, ctx.currentTime + s);
            g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + s + 0.3);
            o.start(ctx.currentTime + s);
            o.stop(ctx.currentTime + s + 0.35);
        });
    } catch (_) { }
}

/* ─── Status map ────────────────────────────────────────────── */
const S = {
    IDLE: { label: 'Camera Off', dot: '#4b5563', color: '#6b7280', emoji: '⚫' },
    NO_FACE: { label: 'No Face', dot: '#f59e0b', color: '#fbbf24', emoji: '🟡' },
    FOCUSED: { label: 'Focused', dot: '#10b981', color: '#34d399', emoji: '🟢' },
    DISTRACTED: { label: 'Distracted', dot: '#f59e0b', color: '#fbbf24', emoji: '🟡' },
    SLEEPY: { label: 'Sleepy!', dot: '#f97316', color: '#fb923c', emoji: '🟠' },
    SLEEPING: { label: 'SLEEPING!', dot: '#ef4444', color: '#f87171', emoji: '🔴' },
};

/* ══════════════════════════════════════════════════════════════
   Main component
══════════════════════════════════════════════════════════════ */
export default function FocusDetector() {

    /* ── ALL STATE DECLARATIONS FIRST (Rules of Hooks) ──────── */
    const [active, setActive] = useState(false);
    const [minimized, setMinimized] = useState(false);
    const [status, setStatus] = useState('IDLE');
    const [modelsOk, setModelsOk] = useState(false);
    const [modLoading, setModLoading] = useState(true);
    const [modErr, setModErr] = useState(false);
    const [perm, setPerm] = useState('prompt');  // prompt | granted | denied
    const [camErr, setCamErr] = useState(null);      // null | 'no_device' | 'in_use' | 'unknown'
    const [devCount, setDevCount] = useState(-1);        // # of video inputs visible to browser
    const [closedSec, setClosedSec] = useState(0);
    const [ear, setEar] = useState(null);
    const [showAlert, setShowAlert] = useState(false);

    const [starting, setStarting] = useState(false);

    /* ... REFS ... */
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const detectRef = useRef(null);
    const closedRef = useRef(0);
    const lastTsRef = useRef(null);
    const alertedRef = useRef(false);

    /* ── Load face-api.js models from /public/models ─────────── */
    useEffect(() => {
        setModLoading(true);
        Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
            faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
        ]).then(() => {
            setModelsOk(true);
            setModErr(false);
        }).catch(e => {
            console.error('[FocusDetector] Model load error:', e);
            setModErr(true);
        }).finally(() => setModLoading(false));
    }, []);

    /* ── Check camera permission via Permissions API ────────── */
    useEffect(() => {
        if (!navigator.permissions) return;
        navigator.permissions.query({ name: 'camera' })
            .then(r => {
                setPerm(r.state);
                r.onchange = () => setPerm(r.state);
            })
            .catch(() => { });
    }, []);

    /* ── Enumerate available video devices ───────────────────── */
    const scanDevices = useCallback(async () => {
        try {
            const all = await navigator.mediaDevices.enumerateDevices();
            const vids = all.filter(d => d.kind === 'videoinput');
            setDevCount(vids.length);
            return vids;
        } catch (e) {
            setDevCount(0);
            return [];
        }
    }, []);

    useEffect(() => { scanDevices(); }, [scanDevices]);

    /* ── Stop camera stream ───────────────────────────────────── */
    const stopCamera = useCallback(() => {
        clearInterval(detectRef.current);
        streamRef.current?.getTracks().forEach(t => t.stop());
        streamRef.current = null;
        if (videoRef.current) videoRef.current.srcObject = null;
        setActive(false);
        setStarting(false);
        setStatus('IDLE');
        setShowAlert(false);
        setEar(null);
        closedRef.current = 0;
        setClosedSec(0);
    }, []);

    /* ── Start camera — v: try minimal → enumerate fallback ──── */
    const startCamera = useCallback(async () => {
        if (!modelsOk) return;
        setCamErr(null);
        setStarting(true);
        setActive(true); // Ensure DOM element is rendered

        /* Helper: open stream, attach to video element, update state */
        const openStream = async (constraints) => {
            const stream = await navigator.mediaDevices.getUserMedia({ video: constraints, audio: false });
            streamRef.current = stream;

            // Wait a few cycles for React to render the video element if it just became active
            let retry = 0;
            while (!videoRef.current && retry < 10) {
                await new Promise(r => setTimeout(r, 100));
                retry++;
            }

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play().catch(e => console.warn('Play failed:', e));
            } else {
                throw new Error('Video element not found in DOM');
            }

            setPerm('granted');
            setCamErr(null);
            setStarting(false);
            setStatus('FOCUSED');
            closedRef.current = 0;
            lastTsRef.current = Date.now();
            alertedRef.current = false;
            scanDevices();
            return true;
        };

        /* Strategy A: bare minimum */
        try {
            await openStream(true);
            return;
        } catch (eA) {
            console.warn('[FocusDetector] Strategy A failed:', eA.name, eA.message);
            if (eA.name === 'NotAllowedError') { setPerm('denied'); setStarting(false); setActive(false); return; }
            if (eA.name === 'NotReadableError') { setCamErr('in_use'); setStarting(false); setActive(false); return; }
        }

        /* Strategy B: enumerate every video device and try each */
        try {
            console.log('[FocusDetector] Strategy B: enumerate devices');
            const vids = await scanDevices();

            if (vids.length === 0) {
                console.error('[FocusDetector] No video inputs visible to browser');
                setCamErr('no_device');
                return;
            }

            for (const dev of vids) {
                const constraint = dev.deviceId
                    ? { deviceId: { ideal: dev.deviceId } }
                    : true;
                try {
                    console.log('[FocusDetector] Trying device:', dev.label || dev.deviceId || 'unlabelled');
                    await openStream(constraint);
                    return;                       // success — stop trying
                } catch (eD) {
                    console.warn('[FocusDetector] Device failed:', eD.name, eD.message);
                }
            }
            setCamErr('no_device');              // every device failed
            setStarting(false);
            setActive(false);
        } catch (eB) {
            console.error('[FocusDetector] Strategy B error:', eB.name, eB.message);
            setStarting(false);
            setActive(false);
            if (eB.name === 'NotAllowedError') { setPerm('denied'); return; }
            setCamErr('unknown');
        }
    }, [modelsOk, scanDevices]);

    /* ── Detection loop ──────────────────────────────────────── */
    useEffect(() => {
        if (!active || !modelsOk) return;

        detectRef.current = setInterval(async () => {
            const video = videoRef.current;
            if (!video || video.readyState < 2) return;

            const result = await faceapi
                .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.36 }))
                .withFaceLandmarks(true);

            const now = Date.now();
            const delta = lastTsRef.current ? now - lastTsRef.current : DETECT_MS;
            lastTsRef.current = now;

            if (!result) { setStatus('NO_FACE'); return; }

            /* Draw landmarks */
            if (canvasRef.current) {
                faceapi.matchDimensions(canvasRef.current, { width: video.videoWidth, height: video.videoHeight });
                const ctx = canvasRef.current.getContext('2d');
                ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                faceapi.draw.drawFaceLandmarks(canvasRef.current, result);
            }

            /* EAR — landmarks 36-41 left, 42-47 right */
            const lms = result.landmarks.positions;
            const avgEar = (calcEAR(lms.slice(36, 42)) + calcEAR(lms.slice(42, 48))) / 2;
            setEar(avgEar.toFixed(3));

            if (avgEar < EAR_THRESHOLD) {
                closedRef.current += delta;
                const sec = closedRef.current / 1000;
                setClosedSec(Math.floor(sec));

                if (sec >= SLEEP_SECONDS) {
                    setStatus('SLEEPING');
                    if (!alertedRef.current) {
                        alertedRef.current = true;
                        setShowAlert(true);
                        playBeep();
                        const loop = setInterval(() => {
                            closedRef.current / 1000 >= SLEEP_SECONDS ? playBeep() : clearInterval(loop);
                        }, 3000);
                    }
                } else if (sec >= 2) {
                    setStatus('SLEEPY');
                    setShowAlert(false);
                    alertedRef.current = false;
                } else {
                    setStatus('DISTRACTED');
                    setShowAlert(false);
                    alertedRef.current = false;
                }
            } else {
                closedRef.current = 0;
                setClosedSec(0);
                setStatus('FOCUSED');
                setShowAlert(false);
                alertedRef.current = false;
            }
        }, DETECT_MS);

        return () => clearInterval(detectRef.current);
    }, [active, modelsOk]);

    /* Cleanup on unmount */
    useEffect(() => () => stopCamera(), [stopCamera]);

    /* ── Derived ──────────────────────────────────────────────── */
    const st = S[status];
    const btnLabel = modLoading ? '⏳ Loading AI models…'
        : modErr ? '⚠️ Model error — check /public/models'
            : '▶ Start Focus Monitor';

    /* ══════════════════════════════════════════════════════════
       Render
    ══════════════════════════════════════════════════════════ */
    return (
        <>
            {/* ── Floating panel ─────────────────────────────── */}
            <div id="fm-panel" style={{
                position: 'fixed', bottom: 20, right: 20, zIndex: 600,
                width: minimized ? 52 : 306,
                background: 'rgba(7,7,22,0.95)',
                backdropFilter: 'blur(28px)',
                border: `1px solid ${active ? st.dot + '55' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 18,
                boxShadow: active
                    ? `0 0 30px ${st.dot}22, 0 12px 40px rgba(0,0,0,0.6)`
                    : '0 12px 40px rgba(0,0,0,0.55)',
                overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(.4,0,.2,1)',
            }}>
                <style>{`
                    @media (max-width: 768px) {
                        #fm-panel {
                            bottom: 15px !important;
                            right: 15px !important;
                            width: ${minimized ? '48px' : '260px'} !important;
                        }
                    }
                `}</style>
                {/* Header */}
                <div onClick={() => { sounds.click(); setMinimized(m => !m); }} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: minimized ? '10px 12px' : '11px 14px',
                    cursor: 'pointer', userSelect: 'none',
                    background: 'rgba(255,255,255,0.03)',
                    borderBottom: minimized ? 'none' : '1px solid rgba(255,255,255,0.06)',
                }}>
                    <span style={{ fontSize: '1rem' }}>👁️</span>
                    {!minimized && <span style={{ flex: 1, fontWeight: 700, fontSize: '0.82rem', color: '#f0f0ff' }}>Focus Monitor</span>}
                    <span style={{
                        width: 9, height: 9, borderRadius: '50%', flexShrink: 0,
                        background: st.dot,
                        boxShadow: active ? `0 0 7px ${st.dot}` : 'none',
                        animation: status === 'SLEEPING' ? 'fm-blink .45s ease infinite' : 'none',
                    }} />
                    {!minimized && <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.28)' }}>▼</span>}
                </div>

                {!minimized && (
                    <div style={{ padding: '11px 13px' }}>

                        {/* Live webcam feed */}
                        {active && (
                            <div style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', background: '#000', marginBottom: 10 }}>
                                <video ref={videoRef} muted playsInline
                                    style={{ display: 'block', width: '100%', borderRadius: 10, transform: 'scaleX(-1)', opacity: starting ? 0 : 1, transition: 'opacity 0.5s' }} />
                                <canvas ref={canvasRef}
                                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', transform: 'scaleX(-1)', opacity: starting ? 0 : 1 }} />

                                {starting && (
                                    <div style={{
                                        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                                        alignItems: 'center', justifyContent: 'center', gap: 10,
                                        background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)'
                                    }}>
                                        <div className="fm-spinner" />
                                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#a5b4fc' }}>Warming up camera...</span>
                                    </div>
                                )}

                                {/* status badge */}
                                <div style={{
                                    position: 'absolute', top: 7, left: 7,
                                    background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)',
                                    border: `1px solid ${st.dot}44`, borderRadius: 20, padding: '3px 9px',
                                    display: 'flex', alignItems: 'center', gap: 5,
                                    fontSize: '0.7rem', fontWeight: 700, color: st.color,
                                }}>
                                    <span style={{
                                        width: 6, height: 6, borderRadius: '50%', background: st.dot, display: 'inline-block',
                                        animation: status !== 'FOCUSED' ? 'fm-blink 1s ease infinite' : 'none'
                                    }} />
                                    {st.label}
                                </div>
                                {ear && (
                                    <div style={{
                                        position: 'absolute', bottom: 5, right: 7, fontSize: '0.58rem',
                                        color: 'rgba(255,255,255,0.3)', background: 'rgba(0,0,0,0.4)', padding: '2px 5px', borderRadius: 4
                                    }}>
                                        EAR {ear}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Placeholder when off */}
                        {!active && perm !== 'denied' && !camErr && (
                            <div style={{
                                height: 96, borderRadius: 10,
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px dashed rgba(255,255,255,0.09)',
                                display: 'flex', flexDirection: 'column',
                                alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 10,
                                color: 'rgba(255,255,255,0.25)', fontSize: '0.76rem',
                            }}>
                                <span style={{ fontSize: '1.8rem' }}>📷</span>
                                <span>Camera inactive</span>
                                {modLoading && <span style={{ fontSize: '0.63rem', color: '#f59e0b' }}>⏳ Loading AI…</span>}
                                {devCount === 0 && !modLoading && (
                                    <span style={{ fontSize: '0.63rem', color: '#ef4444' }}>⚠️ No camera found by browser</span>
                                )}
                                {devCount > 0 && !modLoading && (
                                    <span style={{ fontSize: '0.63rem', color: '#10b981' }}>✓ {devCount} camera device(s) ready</span>
                                )}
                            </div>
                        )}

                        {/* Permission denied help */}
                        {!active && perm === 'denied' && (
                            <div style={{
                                background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)',
                                borderRadius: 10, padding: '12px', marginBottom: 10,
                            }}>
                                <div style={{ fontWeight: 700, fontSize: '0.78rem', color: '#ef4444', marginBottom: 4 }}>🚫 Camera Blocked by Browser</div>
                                <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, marginBottom: 8 }}>
                                    1. Click the 🔒 lock icon in the address bar<br />
                                    2. Set <strong>Camera → Allow</strong><br />
                                    3. Click Retry
                                </div>
                                <button onClick={startCamera} style={btnSm}>🔄 Retry</button>
                            </div>
                        )}

                        {/* Camera hardware / OS error */}
                        {!active && camErr && (
                            <div style={{
                                background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)',
                                borderRadius: 10, padding: '12px', marginBottom: 10,
                            }}>
                                {camErr === 'in_use' ? (
                                    <>
                                        <div style={{ fontWeight: 700, fontSize: '0.78rem', color: '#f97316', marginBottom: 4 }}>🔒 Camera In Use</div>
                                        <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, marginBottom: 8 }}>
                                            Close Teams, Zoom, Skype, or any other app using your camera, then click Retry.
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div style={{ fontWeight: 700, fontSize: '0.78rem', color: '#ef4444', marginBottom: 4 }}>
                                            🚫 {devCount === 0 ? 'No Camera Visible to Browser' : 'Camera Access Failed'}
                                        </div>
                                        <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.8, marginBottom: 8 }}>
                                            <span style={{ color: '#f59e0b', fontWeight: 700 }}>Windows Settings fix:</span><br />
                                            1. <strong>Win + I</strong> → Privacy &amp; Security → Camera<br />
                                            2. Turn ON <strong>"Let apps access camera"</strong><br />
                                            3. Turn ON <strong>"Let <u>desktop</u> apps access camera"</strong><br />
                                            4. Click "Open Settings" below, then Retry
                                        </div>
                                        <button
                                            onClick={() => window.open('ms-settings:privacy-webcam')}
                                            style={{ ...btnSm, marginBottom: 6, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }}
                                        >⚙️ Open Windows Camera Settings</button>
                                    </>
                                )}
                                <button onClick={startCamera} style={btnSm}>🔄 Retry Camera</button>
                            </div>
                        )}

                        {/* Eye-closed progress bar */}
                        {active && !['FOCUSED', 'NO_FACE'].includes(status) && (
                            <div style={{ marginBottom: 8 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.66rem', color: 'rgba(255,255,255,0.35)', marginBottom: 3 }}>
                                    <span>Eyes closed</span>
                                    <span style={{ color: st.color, fontWeight: 700 }}>{closedSec}s / {SLEEP_SECONDS}s</span>
                                </div>
                                <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
                                    <div style={{
                                        height: '100%',
                                        width: `${Math.min(100, (closedSec / SLEEP_SECONDS) * 100)}%`,
                                        background: closedSec >= SLEEP_SECONDS ? '#ef4444' : closedSec >= 2 ? '#f97316' : '#06b6d4',
                                        borderRadius: 99, transition: 'width 0.2s linear',
                                    }} />
                                </div>
                            </div>
                        )}

                        {/* Status row */}
                        {active && (
                            <div style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '7px 10px', borderRadius: 8,
                                background: `${st.dot}10`, border: `1px solid ${st.dot}20`,
                                marginBottom: 10,
                            }}>
                                <span style={{ fontSize: '1.2rem' }}>{st.emoji}</span>
                                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: st.color }}>{st.label}</span>
                                <span style={{ fontSize: '0.64rem', color: 'rgba(255,255,255,0.28)' }}>
                                    {status === 'FOCUSED' ? 'Eyes open ✓' : status === 'NO_FACE' ? 'Look at screen' : `EAR: ${ear || '—'}`}
                                </span>
                            </div>
                        )}

                        {/* Main button */}
                        {perm !== 'denied' && !camErr && (
                            !active ? (
                                <button
                                    id="fm-start-btn"
                                    onClick={() => { sounds.click(); startCamera(); }}
                                    disabled={modLoading || modErr || starting}
                                    style={{
                                        width: '100%', padding: '10px 0', borderRadius: 9, border: 'none',
                                        cursor: (modLoading || modErr || starting) ? 'not-allowed' : 'pointer',
                                        background: (modLoading || modErr || starting)
                                            ? 'rgba(255,255,255,0.06)'
                                            : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                                        color: (modLoading || modErr || starting) ? 'rgba(255,255,255,0.3)' : '#fff',
                                        fontSize: '0.82rem', fontWeight: 700, transition: 'opacity .2s',
                                    }}
                                    onMouseEnter={e => { if (!modLoading && !modErr && !starting) e.currentTarget.style.opacity = '.85'; }}
                                    onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                                >
                                    {starting ? '🔄 Starting camera...' : btnLabel}
                                </button>
                            ) : (
                                <button onClick={() => { sounds.click(); stopCamera(); }} style={{
                                    width: '100%', padding: '10px 0', borderRadius: 9, border: 'none',
                                    cursor: 'pointer', background: 'rgba(239,68,68,0.12)',
                                    color: '#f87171', fontSize: '0.82rem', fontWeight: 700, transition: 'opacity .2s',
                                }}>
                                    ■ Stop Monitor
                                </button>
                            )
                        )}
                    </div>
                )}
            </div>

            {/* ── Sleep alarm modal ──────────────────────────── */}
            {showAlert && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 9999,
                    background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(14px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    animation: 'fm-fade .2s ease',
                }}>
                    <div style={{
                        background: 'linear-gradient(145deg,rgba(10,3,25,.99),rgba(25,3,10,.99))',
                        border: '1.5px solid rgba(239,68,68,0.4)', borderRadius: 22,
                        padding: '44px 40px 36px', maxWidth: 420, width: '90vw', textAlign: 'center',
                        boxShadow: '0 0 70px rgba(239,68,68,.2), 0 24px 64px rgba(0,0,0,.7)',
                        animation: 'fm-pop .4s cubic-bezier(.34,1.56,.64,1)',
                    }}>
                        <div style={{ fontSize: '4.5rem', marginBottom: 16, display: 'inline-block', animation: 'fm-shake .35s ease infinite' }}>😴</div>
                        <h2 style={{ fontWeight: 800, fontSize: '1.55rem', color: '#ef4444', marginBottom: 10, lineHeight: 1.2 }}>
                            ⚠️ You're falling asleep!
                        </h2>
                        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.92rem', marginBottom: 6 }}>
                            Eyes closed for {SLEEP_SECONDS}+ seconds.
                        </p>
                        <p style={{ color: '#f59e0b', fontWeight: 700, fontSize: '1rem', marginBottom: 30 }}>
                            💪 Stay focused — your goals matter!
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <button
                                onClick={() => {
                                    sounds.success();
                                    setShowAlert(false);
                                    alertedRef.current = false;
                                    closedRef.current = 0;
                                    setClosedSec(0);
                                    playBeep();
                                }}
                                style={{
                                    padding: '14px 0', borderRadius: 11, border: 'none', cursor: 'pointer',
                                    background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                                    color: '#fff', fontSize: '1rem', fontWeight: 800,
                                    boxShadow: '0 4px 20px rgba(99,102,241,.4)',
                                }}
                            >✅ I'm Awake! Resume Study</button>
                            <button
                                onClick={() => { setShowAlert(false); stopCamera(); }}
                                style={{
                                    padding: '10px 0', borderRadius: 11, cursor: 'pointer',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    background: 'transparent', color: 'rgba(255,255,255,.4)',
                                    fontSize: '0.85rem', fontWeight: 600,
                                }}
                            >😴 Take a Break</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Keyframes ──────────────────────────────────── */}
            <style>{`
                @keyframes fm-blink { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.35;transform:scale(.72)} }
                @keyframes fm-shake { 0%,100%{transform:rotate(-7deg)} 50%{transform:rotate(7deg)} }
                @keyframes fm-fade  { from{opacity:0} to{opacity:1} }
                @keyframes fm-pop   { from{opacity:0;transform:scale(.8) translateY(18px)} to{opacity:1;transform:scale(1) translateY(0)} }
                @keyframes fm-spin  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
                .fm-spinner { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.1); border-top-color: #a5b4fc; border-radius: 50%; animation: fm-spin 0.8s linear infinite; }
            `}</style>
        </>
    );
}

/* ─── Shared small button style ─────────────────────────────── */
const btnSm = {
    width: '100%', padding: '8px 0', borderRadius: 7, border: 'none',
    cursor: 'pointer', background: 'rgba(99,102,241,0.2)', color: '#a5b4fc',
    fontSize: '0.74rem', fontWeight: 700, transition: 'opacity .2s',
};
