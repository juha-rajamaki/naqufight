const TTS = {
    voice: null,
    ready: false,

    init() {
        if (!window.speechSynthesis) return;
        const pickVoice = () => {
            const voices = speechSynthesis.getVoices();
            if (!voices.length) return;
            const preferred = [
                'microsoft mark', 'google uk english male', 'microsoft david',
                'microsoft james', 'daniel', 'alex', 'google us english'
            ];
            for (const pref of preferred) {
                const match = voices.find(v => v.name.toLowerCase().includes(pref));
                if (match) { this.voice = match; break; }
            }
            if (!this.voice) {
                this.voice = voices.find(v => v.lang.startsWith('en') && /male/i.test(v.name))
                          || voices.find(v => v.lang.startsWith('en'))
                          || voices[0];
            }
            this.ready = true;
        };
        pickVoice();
        speechSynthesis.onvoiceschanged = () => pickVoice();
    },

    speak(text, rate) {
        if (!window.speechSynthesis) return;
        speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        if (this.voice) utter.voice = this.voice;
        utter.rate = rate || 0.9;
        utter.pitch = 0.7;
        utter.volume = 1.0;
        speechSynthesis.speak(utter);
    }
};

const Music = {
    ctx: null,
    masterGain: null,
    playing: null,
    nodes: [],

    init(audioCtx) {
        this.ctx = audioCtx;
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.25;
        this.masterGain.connect(this.ctx.destination);
    },

    stop() {
        this.nodes.forEach(n => { try { n.stop(); } catch(e) {} });
        this.nodes = [];
        this.playing = null;
    },

    // MK-style menu theme — dark, aggressive, driving beat
    playMenu() {
        if (this.playing === 'menu') return;
        this.stop();
        this.playing = 'menu';

        const ctx = this.ctx;
        const now = ctx.currentTime;
        const bpm = 140;
        const beat = 60 / bpm;
        const barLen = beat * 4;
        const loopLen = barLen * 8; // 8 bars per loop

        // Schedule multiple loops ahead
        const scheduleLoop = (startTime) => {
            // Kick drum pattern (4 on the floor with variation)
            for (let bar = 0; bar < 8; bar++) {
                for (let b = 0; b < 4; b++) {
                    const t = startTime + bar * barLen + b * beat;
                    // Kick on every beat
                    this.scheduleKick(t);
                    // Hi-hat on every 8th note
                    this.scheduleHiHat(t);
                    this.scheduleHiHat(t + beat * 0.5);
                    // Snare on 2 and 4
                    if (b === 1 || b === 3) {
                        this.scheduleSnare(t);
                    }
                }
            }

            // Dark bass line (MK-style pentatonic minor)
            // E minor pentatonic: E2, G2, A2, B2, D3
            const bassNotes = [
                // Bar 1-2: E-E-E-G-A-E-E-E
                82, 82, 82, 98, 110, 82, 82, 82,
                // Bar 3-4: E-E-G-A-B-A-G-E
                82, 82, 98, 110, 123, 110, 98, 82,
                // Bar 5-6: A-A-A-G-E-A-A-A
                110, 110, 110, 98, 82, 110, 110, 110,
                // Bar 7-8: B-A-G-E-G-A-B-E
                123, 110, 98, 82, 98, 110, 123, 82
            ];

            bassNotes.forEach((freq, i) => {
                const t = startTime + i * (beat * 2);
                this.scheduleBass(t, freq, beat * 1.8);
            });

            // Dark lead melody (higher octave, sparser)
            const leadPattern = [
                // Bars 1-4: sparse aggressive hits
                { t: 0, f: 330, d: beat * 0.5 },
                { t: beat * 2, f: 392, d: beat * 0.5 },
                { t: beat * 4, f: 330, d: beat },
                { t: beat * 7, f: 294, d: beat * 0.5 },
                { t: barLen * 2, f: 330, d: beat * 0.5 },
                { t: barLen * 2 + beat * 1.5, f: 440, d: beat * 0.5 },
                { t: barLen * 2 + beat * 3, f: 494, d: beat },
                { t: barLen * 3 + beat * 2, f: 440, d: beat * 0.5 },
                { t: barLen * 3 + beat * 3, f: 392, d: beat },
                // Bars 5-8: rising tension
                { t: barLen * 4, f: 440, d: beat * 0.5 },
                { t: barLen * 4 + beat * 1.5, f: 494, d: beat * 0.5 },
                { t: barLen * 4 + beat * 3, f: 440, d: beat },
                { t: barLen * 5 + beat, f: 392, d: beat * 0.5 },
                { t: barLen * 5 + beat * 2, f: 330, d: beat * 0.5 },
                { t: barLen * 5 + beat * 3, f: 392, d: beat },
                { t: barLen * 6, f: 494, d: beat },
                { t: barLen * 6 + beat * 2, f: 440, d: beat * 0.5 },
                { t: barLen * 6 + beat * 3, f: 392, d: beat * 0.5 },
                { t: barLen * 7, f: 330, d: beat * 1.5 },
                { t: barLen * 7 + beat * 2, f: 294, d: beat },
            ];

            leadPattern.forEach(note => {
                this.scheduleLead(startTime + note.t, note.f, note.d);
            });

            // Power chord stabs (every 2 bars)
            for (let bar = 0; bar < 8; bar += 2) {
                const t = startTime + bar * barLen;
                this.scheduleChord(t, 82, beat * 0.3);
                this.scheduleChord(t + beat * 3.5, 82, beat * 0.2);
            }
        };

        // Schedule first loop and set up continuous looping
        scheduleLoop(now + 0.1);

        const loopInterval = setInterval(() => {
            if (this.playing !== 'menu') {
                clearInterval(loopInterval);
                return;
            }
            scheduleLoop(ctx.currentTime + 0.05);
        }, loopLen * 1000 - 200);

        this._loopInterval = loopInterval;
    },

    // Fight music — faster, more intense
    playFight() {
        if (this.playing === 'fight') return;
        this.stop();
        this.playing = 'fight';

        const ctx = this.ctx;
        const bpm = 160;
        const beat = 60 / bpm;
        const barLen = beat * 4;

        const scheduleLoop = (startTime) => {
            for (let bar = 0; bar < 4; bar++) {
                for (let b = 0; b < 4; b++) {
                    const t = startTime + bar * barLen + b * beat;
                    this.scheduleKick(t);
                    this.scheduleHiHat(t);
                    this.scheduleHiHat(t + beat * 0.25);
                    this.scheduleHiHat(t + beat * 0.5);
                    this.scheduleHiHat(t + beat * 0.75);
                    if (b === 1 || b === 3) this.scheduleSnare(t);
                }
            }

            // Aggressive bass
            const bassNotes = [
                82, 82, 98, 82, 110, 82, 98, 73,
                82, 82, 110, 123, 110, 98, 82, 73
            ];
            bassNotes.forEach((freq, i) => {
                this.scheduleBass(startTime + i * beat, freq, beat * 0.8);
            });
        };

        const loopLen = barLen * 4;
        scheduleLoop(ctx.currentTime + 0.1);

        const loopInterval = setInterval(() => {
            if (this.playing !== 'fight') {
                clearInterval(loopInterval);
                return;
            }
            scheduleLoop(ctx.currentTime + 0.05);
        }, loopLen * 1000 - 200);

        this._loopInterval = loopInterval;
    },

    // Drum sounds
    scheduleKick(time) {
        const ctx = this.ctx;
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, time);
        osc.frequency.exponentialRampToValueAtTime(30, time + 0.1);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.5, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(time);
        osc.stop(time + 0.12);
        this.nodes.push(osc);
    },

    scheduleSnare(time) {
        const ctx = this.ctx;
        // Noise burst
        const len = ctx.sampleRate * 0.1;
        const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
        const src = ctx.createBufferSource();
        src.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 2000;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.3, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
        src.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        src.start(time);
        src.stop(time + 0.1);
        this.nodes.push(src);

        // Body tone
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(200, time);
        osc.frequency.exponentialRampToValueAtTime(100, time + 0.05);
        const g2 = ctx.createGain();
        g2.gain.setValueAtTime(0.2, time);
        g2.gain.exponentialRampToValueAtTime(0.001, time + 0.06);
        osc.connect(g2);
        g2.connect(this.masterGain);
        osc.start(time);
        osc.stop(time + 0.06);
        this.nodes.push(osc);
    },

    scheduleHiHat(time) {
        const ctx = this.ctx;
        const len = ctx.sampleRate * 0.04;
        const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
        const src = ctx.createBufferSource();
        src.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 8000;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.08, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);
        src.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        src.start(time);
        src.stop(time + 0.04);
        this.nodes.push(src);
    },

    // Bass synth
    scheduleBass(time, freq, duration) {
        const ctx = this.ctx;
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, time);
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, time);
        filter.frequency.exponentialRampToValueAtTime(200, time + duration);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.2, time);
        gain.gain.setValueAtTime(0.2, time + duration * 0.7);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        osc.start(time);
        osc.stop(time + duration);
        this.nodes.push(osc);
    },

    // Lead synth
    scheduleLead(time, freq, duration) {
        const ctx = this.ctx;
        const osc = ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, time);
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(3000, time);
        filter.frequency.exponentialRampToValueAtTime(1000, time + duration);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.08, time);
        gain.gain.setValueAtTime(0.08, time + duration * 0.6);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        osc.start(time);
        osc.stop(time + duration);
        this.nodes.push(osc);
    },

    // Power chord stab
    scheduleChord(time, rootFreq, duration) {
        const ctx = this.ctx;
        [1, 1.5, 2].forEach(mult => {
            const osc = ctx.createOscillator();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(rootFreq * mult, time);
            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.1, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
            const dist = ctx.createWaveShaperFunction ? null : null;
            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(time);
            osc.stop(time + duration);
            this.nodes.push(osc);
        });
    }
};

const SFX = {
    ctx: null,

    init() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        Music.init(this.ctx);
        TTS.init();
    },

    ensure() {
        if (!this.ctx) this.init();
        if (this.ctx.state === 'suspended') this.ctx.resume();
    },

    // Utility: play a noise burst (for impact sounds)
    noise(duration, volume, filterFreq, filterType) {
        this.ensure();
        const ctx = this.ctx;
        const len = ctx.sampleRate * duration;
        const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < len; i++) {
            data[i] = (Math.random() * 2 - 1) * (1 - i / len);
        }
        const src = ctx.createBufferSource();
        src.buffer = buffer;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

        const filter = ctx.createBiquadFilter();
        filter.type = filterType || 'lowpass';
        filter.frequency.value = filterFreq || 1000;

        src.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        src.start();
    },

    // Utility: play a tone
    tone(freq, duration, volume, type, freqEnd) {
        this.ensure();
        const ctx = this.ctx;
        const osc = ctx.createOscillator();
        osc.type = type || 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        if (freqEnd) {
            osc.frequency.exponentialRampToValueAtTime(freqEnd, ctx.currentTime + duration);
        }

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration);
    },

    // ========================
    // GAME SOUNDS
    // ========================

    highPunch() {
        this.noise(0.08, 0.4, 2500, 'bandpass');
        this.tone(300, 0.05, 0.15, 'square', 100);
    },

    lowPunch() {
        this.noise(0.07, 0.35, 2000, 'bandpass');
        this.tone(250, 0.04, 0.12, 'square', 80);
    },

    highKick() {
        this.noise(0.12, 0.5, 1800, 'bandpass');
        this.tone(200, 0.08, 0.2, 'sawtooth', 60);
        // Whoosh
        this.noise(0.1, 0.15, 4000, 'highpass');
    },

    lowKick() {
        this.noise(0.1, 0.45, 1200, 'lowpass');
        this.tone(150, 0.08, 0.2, 'sawtooth', 40);
    },

    uppercut() {
        // Rising pitch impact
        this.noise(0.15, 0.6, 2000, 'bandpass');
        this.tone(150, 0.15, 0.25, 'sawtooth', 500);
        this.tone(200, 0.1, 0.15, 'square', 600);
    },

    jumpPunch() {
        this.noise(0.09, 0.4, 2800, 'bandpass');
        this.tone(350, 0.06, 0.15, 'square', 150);
    },

    jumpKick() {
        this.noise(0.11, 0.45, 2200, 'bandpass');
        this.tone(250, 0.08, 0.18, 'sawtooth', 80);
        this.noise(0.08, 0.12, 4500, 'highpass');
    },

    special() {
        // Big dramatic impact
        this.noise(0.2, 0.7, 1500, 'bandpass');
        this.tone(100, 0.25, 0.3, 'sawtooth', 30);
        this.tone(400, 0.2, 0.15, 'square', 100);
        // Energy burst
        setTimeout(() => {
            this.noise(0.15, 0.3, 5000, 'highpass');
            this.tone(800, 0.15, 0.1, 'sine', 200);
        }, 50);
    },

    blocked() {
        // Metallic clang
        this.tone(600, 0.08, 0.2, 'square', 200);
        this.tone(900, 0.06, 0.15, 'square', 300);
        this.noise(0.06, 0.2, 3000, 'highpass');
    },

    sweep() {
        // Low thud + whoosh
        this.noise(0.15, 0.5, 600, 'lowpass');
        this.tone(80, 0.12, 0.3, 'sine', 30);
        this.noise(0.12, 0.2, 5000, 'highpass');
    },

    knockdown() {
        // Heavy body fall
        this.noise(0.25, 0.6, 400, 'lowpass');
        this.tone(60, 0.2, 0.35, 'sine', 20);
        setTimeout(() => {
            this.noise(0.15, 0.3, 300, 'lowpass');
        }, 100);
    },

    ko() {
        // Dramatic KO impact
        this.noise(0.3, 0.8, 800, 'lowpass');
        this.tone(80, 0.4, 0.4, 'sawtooth', 20);
        this.tone(200, 0.3, 0.2, 'square', 40);
        setTimeout(() => {
            this.noise(0.2, 0.4, 500, 'lowpass');
            this.tone(50, 0.3, 0.3, 'sine', 15);
        }, 150);
    },

    whoosh() {
        this.noise(0.1, 0.15, 5000, 'highpass');
        this.tone(1000, 0.08, 0.05, 'sine', 400);
    },

    menuSelect() {
        this.tone(500, 0.08, 0.15, 'square');
        this.tone(700, 0.08, 0.15, 'square');
    },

    menuConfirm() {
        this.tone(400, 0.1, 0.15, 'square');
        setTimeout(() => this.tone(600, 0.1, 0.15, 'square'), 80);
        setTimeout(() => this.tone(800, 0.15, 0.2, 'square'), 160);
    },

    menuMove() {
        this.tone(400, 0.04, 0.1, 'square');
    },

    roundStart() {
        // Rising dramatic tone
        this.tone(200, 0.15, 0.15, 'square');
        setTimeout(() => this.tone(300, 0.15, 0.15, 'square'), 120);
        setTimeout(() => this.tone(400, 0.2, 0.2, 'square'), 240);
        setTimeout(() => this.tone(600, 0.3, 0.25, 'sawtooth'), 400);
    },

    fight() {
        // "FIGHT!" stinger
        this.tone(500, 0.1, 0.2, 'sawtooth');
        setTimeout(() => {
            this.tone(700, 0.15, 0.25, 'sawtooth');
            this.noise(0.1, 0.2, 3000, 'bandpass');
        }, 100);
    },

    roundWin() {
        // Victory fanfare
        const t = (delay, freq, dur) => setTimeout(() => this.tone(freq, dur, 0.15, 'square'), delay);
        t(0, 523, 0.12);     // C
        t(120, 659, 0.12);   // E
        t(240, 784, 0.12);   // G
        t(400, 1047, 0.3);   // High C
    },

    gameOver() {
        // Descending sad tones
        const t = (delay, freq, dur) => setTimeout(() => this.tone(freq, dur, 0.15, 'sawtooth'), delay);
        t(0, 400, 0.2);
        t(200, 350, 0.2);
        t(400, 300, 0.2);
        t(600, 200, 0.4);
    },

    victory() {
        // Full victory fanfare
        const t = (delay, freq, dur) => setTimeout(() => this.tone(freq, dur, 0.15, 'square'), delay);
        t(0, 523, 0.1);
        t(100, 523, 0.1);
        t(200, 523, 0.15);
        t(380, 659, 0.15);
        t(550, 784, 0.2);
        t(750, 1047, 0.4);
    },

    finishHim() {
        // Ominous low drone
        this.tone(80, 0.5, 0.2, 'sawtooth', 60);
        this.tone(120, 0.5, 0.15, 'square', 80);
        setTimeout(() => {
            this.tone(60, 0.6, 0.25, 'sawtooth', 40);
            this.noise(0.3, 0.15, 800, 'lowpass');
        }, 300);
    }
};
