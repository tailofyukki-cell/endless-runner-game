export class AudioManager {
    constructor(settings) {
        this.settings = settings;
        this.context = null;
    }

    unlock() {
        if (!this.context) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (!AudioContextClass) return;
            this.context = new AudioContextClass();
        }
        if (this.context.state === 'suspended') this.context.resume().catch(() => {});
    }

    setSettings(settings) {
        this.settings = settings;
    }

    play(effect) {
        if (this.settings.muted || !this.context || this.context.state !== 'running') return;
        const sequences = {
            jump: [[430, 0.06, 'sine'], [600, 0.08, 'sine']],
            land: [[175, 0.045, 'triangle']],
            coin: [[730, 0.055, 'sine'], [980, 0.09, 'sine']],
            shield: [[390, 0.08, 'sine'], [620, 0.14, 'sine']],
            slow: [[520, 0.12, 'triangle'], [300, 0.18, 'sine']],
            shieldSave: [[240, 0.08, 'square'], [480, 0.11, 'sine'], [720, 0.16, 'sine']],
            threat: [[510, 0.11, 'triangle'], [660, 0.14, 'triangle']],
            gameOver: [[310, 0.14, 'sawtooth'], [220, 0.18, 'sawtooth'], [145, 0.28, 'sawtooth']]
        };
        const notes = sequences[effect];
        if (!notes) return;
        let offset = 0;
        notes.forEach(([frequency, duration, wave]) => {
            this.tone(frequency, duration, wave, offset);
            offset += duration * 0.66;
        });
    }

    tone(frequency, duration, wave, offset) {
        const context = this.context;
        const start = context.currentTime + offset;
        const gain = context.createGain();
        const oscillator = context.createOscillator();
        const level = 0.11 * Math.max(0, Math.min(1, this.settings.volume));

        oscillator.type = wave;
        oscillator.frequency.setValueAtTime(frequency, start);
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, level), start + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start(start);
        oscillator.stop(start + duration + 0.02);
    }
}
