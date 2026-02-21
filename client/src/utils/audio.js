/**
 * UI Sound System using Web Audio API
 * Generates lightweight, procedural audio for buttons and interactions
 */

class SoundEngine {
    constructor() {
        this.ctx = null;
        // Load preference from localStorage, default to true
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('edugen_sound_enabled');
            this.enabled = saved === null ? true : saved === 'true';
        } else {
            this.enabled = true;
        }

        // Auto-unlock audio on first user interaction (standard web practice)
        if (typeof window !== 'undefined') {
            const unlock = () => {
                this.init();
                this.resume();
                window.removeEventListener('click', unlock);
                window.removeEventListener('keydown', unlock);
                window.removeEventListener('touchstart', unlock);
            };
            window.addEventListener('click', unlock);
            window.addEventListener('keydown', unlock);
            window.addEventListener('touchstart', unlock);
        }
    }

    toggleMute() {
        this.enabled = !this.enabled;
        localStorage.setItem('edugen_sound_enabled', this.enabled);
        return this.enabled;
    }

    init() {
        if (this.ctx) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            console.log("[SoundEngine] AudioContext initialized.");
        } catch (e) {
            console.error("[SoundEngine] Could not init AudioContext", e);
        }
    }

    async resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            await this.ctx.resume();
            console.log("[SoundEngine] AudioContext resumed.");
        }
    }

    async play(freq, type, duration, volume = 0.1) {
        if (!this.enabled) return;
        this.init();
        await this.resume();

        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        const now = this.ctx.currentTime;

        // Use setTargetAtTime for smoother, click-free starts
        osc.frequency.setTargetAtTime(freq, now, 0.01);

        // Higher base volume for punchier feedback
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(volume * 2, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + duration + 0.1);
        console.log(`[SoundEngine] Playing ${freq}Hz ${type} for ${duration}s`);
    }

    // --- PRESETS ---

    click() {
        // Sharp high-pitched click
        this.play(1200, 'sine', 0.08, 0.25);
    }

    pop() {
        // Deep bubble pop
        this.play(500, 'sine', 0.15, 0.3);
    }

    success() {
        // Chime sequence
        this.play(800, 'triangle', 0.1, 0.2);
        setTimeout(() => this.play(1100, 'triangle', 0.15, 0.2), 60);
    }

    error() {
        // Warning buzz
        this.play(250, 'square', 0.12, 0.15);
        setTimeout(() => this.play(180, 'square', 0.2, 0.12), 100);
    }

    transition() {
        this.play(400, 'sine', 0.4, 0.2);
    }
}

export const sounds = new SoundEngine();
