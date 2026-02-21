import { useState, useEffect, useRef } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { toast, Spinner } from '../components/UI';
import { sounds } from '../utils/audio';

const REWARDS = [
    { xp: 50, label: 'Starter', icon: '⭐', color: '#6366f1' },
    { xp: 100, label: 'Plus', icon: '🌟', color: '#8b5cf6' },
    { xp: 150, label: 'Elite', icon: '✨', color: '#3b82f6' },
    { xp: 200, label: 'Epic', icon: '🔥', color: '#10b981' },
    { xp: 300, label: 'Legend', icon: '💎', color: '#f59e0b' },
    { xp: 500, label: 'JACKPOT', icon: '👑', color: '#ef4444' }
];

export default function DailySpin() {
    const { user, updateUser } = useAuth();
    const [spinning, setSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [alreadySpun, setAlreadySpun] = useState(false);
    const [reward, setReward] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        if (!user) return;
        const lastSpin = user.lastSpinDate ? new Date(user.lastSpinDate) : null;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (lastSpin && lastSpin >= today) {
            setAlreadySpun(true);
        }
        setLoading(false);
    }, [user]);

    const spinWheel = async () => {
        if (spinning || alreadySpun) return;

        setSpinning(true);
        setReward(null);
        sounds.transition();

        try {
            const res = await api.post('/users/claim-spin');
            const { reward: prize, lastSpinDate, xp } = res.data;

            const prizeIndex = REWARDS.findIndex(r => r.xp === prize);
            const extraRotations = 10 * 360; // More rotations for drama
            const segmentAngle = 360 / REWARDS.length;
            const targetRotation = extraRotations + (360 - (prizeIndex * segmentAngle) - (segmentAngle / 2));

            setRotation(targetRotation);

            // Play ticker sounds during spin
            const tickerInterval = setInterval(() => {
                if (spinning) sounds.click();
            }, 200);

            setTimeout(() => {
                clearInterval(tickerInterval);
                setSpinning(false);
                setReward(REWARDS[prizeIndex]);
                setAlreadySpun(true);
                setShowConfetti(true);
                updateUser({ xp, lastSpinDate });
                sounds.success();
                toast.success(`JACKPOT! You won ${prize} XP! 🎊`, { duration: 5000 });

                setTimeout(() => setShowConfetti(false), 5000);
            }, 6000); // Slower, more premium deceleration

        } catch (err) {
            setSpinning(false);
            toast.error(err.response?.data?.message || 'Failed to spin');
        }
    };

    if (loading) return <Spinner />;

    return (
        <div className="daily-spin-page stagger">
            <style>{`
                .daily-spin-page {
                    max-width: 800px;
                    margin: 0 auto;
                    text-align: center;
                    padding: 40px 20px;
                    perspective: 1000px;
                }
                
                .premium-title {
                    font-size: 3.5rem;
                    font-weight: 900;
                    margin-bottom: 10px;
                    background: linear-gradient(to bottom, #fff 20%, #94a3b8 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    filter: drop-shadow(0 0 20px rgba(99,102,241,0.3));
                }

                .subtitle {
                    color: var(--text-muted);
                    font-size: 1.1rem;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                    margin-bottom: 50px;
                }

                .wheel-outer-ring {
                    position: relative;
                    width: 420px;
                    height: 420px;
                    margin: 0 auto;
                    padding: 20px;
                    background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);
                    border-radius: 50%;
                    box-shadow: 
                        0 0 0 10px #1e1b4b,
                        0 0 50px rgba(99,102,241,0.5),
                        inset 0 0 30px rgba(0,0,0,0.8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                /* Animated bulb lights */
                .bulb {
                    position: absolute;
                    width: 12px;
                    height: 12px;
                    background: #fff;
                    border-radius: 50%;
                    box-shadow: 0 0 10px #fff;
                    z-index: 5;
                    animation: blink 1s infinite;
                }

                @keyframes blink {
                    0%, 100% { opacity: 0.3; transform: scale(0.8); background: #94b3ff; }
                    50% { opacity: 1; transform: scale(1.1); background: #fff; box-shadow: 0 0 15px #fff; }
                }

                .wheel-inner {
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    position: relative;
                    overflow: hidden;
                    border: 8px solid #1e1b4b;
                    transition: transform 6s cubic-bezier(0.1, 0, 0.1, 1);
                    background: #0f172a;
                }

                .segment {
                    position: absolute;
                    width: 50%;
                    height: 50%;
                    left: 50%;
                    top: 50%;
                    transform-origin: 0 0;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding-bottom: 80px;
                }

                .segment-content {
                    transform: rotate(30deg) translateY(-40px);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                    color: white;
                }

                .seg-icon { font-size: 2rem; }
                .seg-xp { font-weight: 900; font-size: 1.5rem; }
                .seg-label { font-size: 0.7rem; font-weight: 600; opacity: 0.8; letter-spacing: 1px; }

                .wheel-pointer {
                    position: absolute;
                    top: -20px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 40px;
                    height: 50px;
                    background: #ef4444;
                    clip-path: polygon(0% 0%, 100% 0%, 50% 100%);
                    z-index: 20;
                    filter: drop-shadow(0 5px 10px rgba(0,0,0,0.5));
                }

                .wheel-center-hub {
                    position: absolute;
                    width: 80px;
                    height: 80px;
                    background: radial-gradient(circle at 30% 30%, #475569 0%, #0f172a 100%);
                    border-radius: 50%;
                    z-index: 25;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 4px solid #1e1b4b;
                    box-shadow: 0 10px 20px rgba(0,0,0,0.5);
                }

                .hub-logo { font-size: 1.5rem; filter: drop-shadow(0 0 10px #6366f1); }

                .claim-status {
                    margin-top: 60px;
                    min-height: 180px;
                }

                .reward-announce {
                    animation: prizePop 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                }

                @keyframes prizePop {
                    0% { transform: scale(0) rotate(-10deg); opacity: 0; }
                    100% { transform: scale(1) rotate(0); opacity: 1; }
                }

                .spin-button-premium {
                    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
                    color: #000;
                    padding: 20px 60px;
                    border-radius: 50px;
                    font-size: 1.5rem;
                    font-weight: 900;
                    border: none;
                    cursor: pointer;
                    box-shadow: 
                        0 10px 0 #b45309,
                        0 20px 40px rgba(245,158,11,0.3);
                    transition: all 0.2s;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                }

                .spin-button-premium:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 
                        0 12px 0 #b45309,
                        0 25px 50px rgba(245,158,11,0.4);
                }

                .spin-button-premium:active:not(:disabled) {
                    transform: translateY(8px);
                    box-shadow: 0 2px 0 #b45309;
                }

                .spin-button-premium.disabled {
                    background: #334155;
                    color: #94a3b8;
                    box-shadow: none;
                    transform: none;
                    cursor: not-allowed;
                }

                .confetti-container {
                    position: fixed;
                    top: 0; left: 0; width: 100%; height: 100%;
                    pointer-events: none;
                    z-index: 100;
                }

                @media (max-width: 500px) {
                    .wheel-outer-ring { width: 320px; height: 320px; }
                    .premium-title { font-size: 2.22rem; }
                    .segment-content { transform: rotate(30deg) translateY(-20px); }
                    .seg-xp { font-size: 1.1rem; }
                    .seg-icon { font-size: 1.5rem; }
                }
            `}</style>

            {showConfetti && <div className="confetti-container">🎉🎊✨🎈🥳</div>}

            <h1 className="premium-title">LUCKY SPINNER</h1>
            <p className="subtitle">Daily Premium Rewards</p>

            <div className="wheel-outer-ring">
                <div className="wheel-pointer" />
                <div className="wheel-center-hub">
                    <span className="hub-logo">⭐</span>
                </div>

                {/* Decorative bulbs */}
                {[...Array(12)].map((_, i) => (
                    <div
                        key={i}
                        className="bulb"
                        style={{
                            left: `${50 + 46 * Math.cos(i * 30 * Math.PI / 180)}%`,
                            top: `${50 + 46 * Math.sin(i * 30 * Math.PI / 180)}%`,
                            animationDelay: `${i * 0.1}s`
                        }}
                    />
                ))}

                <div
                    className="wheel-inner"
                    style={{ transform: `rotate(${rotation}deg)` }}
                >
                    {REWARDS.map((r, i) => (
                        <div
                            key={i}
                            className="segment"
                            style={{
                                background: r.color,
                                transform: `rotate(${i * 60}deg) skewY(-30deg)`,
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}
                        >
                            <div className="segment-content" style={{ transform: 'skewY(30deg) rotate(30deg) translateY(-60px)' }}>
                                <span className="seg-icon">{r.icon}</span>
                                <span className="seg-xp">{r.xp}</span>
                                <span className="seg-label">{r.label}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="claim-status">
                {reward && (
                    <div className="reward-announce">
                        <div style={{ fontSize: '3rem', marginBottom: 10 }}>🎊</div>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: reward.color }}>
                            +{reward.xp} XP
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>
                            {reward.label} Reward Claimed!
                        </p>
                    </div>
                )}

                {!reward && alreadySpun && !spinning && (
                    <div className="animate-fade-in">
                        <div style={{ fontSize: '2rem', marginBottom: 15 }}>⏰</div>
                        <h3 style={{ color: 'var(--neon-orange)', fontSize: '1.5rem' }}>Next Spin tomorrow!</h3>
                        <p style={{ color: 'var(--text-muted)' }}>You've already claimed today's premium reward.</p>
                    </div>
                )}

                <div style={{ marginTop: 40 }}>
                    <button
                        className={`spin-button-premium ${alreadySpun || spinning ? 'disabled' : ''}`}
                        onClick={spinWheel}
                        disabled={alreadySpun || spinning}
                    >
                        {spinning ? 'SPINNING...' : alreadySpun ? 'CLAIMED' : 'SPIN NOW'}
                    </button>
                </div>
            </div>

            <div style={{ marginTop: 40, opacity: 0.5, fontSize: '0.8rem', letterSpacing: '2px' }}>
                GIET UNIVERSITY ACCESS • PREMIUM EDITION
            </div>
        </div>
    );
}
