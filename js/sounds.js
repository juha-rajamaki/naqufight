var TTS = {
    voice: null,
    ready: false,
    allVoices: [],

    init() {
        if (!window.speechSynthesis) return;
        const pickVoice = () => {
            const voices = speechSynthesis.getVoices();
            if (!voices.length) return;
            this.allVoices = voices;

            console.log('=== TTS VOICES AVAILABLE ===');
            voices.forEach((v, i) => console.log(`  [${i}] ${v.name} (${v.lang})`));

            // Priority list of deep/dramatic voices
            const preferred = [
                'microsoft mark', 'google uk english male', 'microsoft david',
                'microsoft james', 'daniel', 'alex', 'google us english'
            ];
            for (const pref of preferred) {
                const match = voices.find(v => v.name.toLowerCase().includes(pref));
                if (match) { this.voice = match; break; }
            }
            // Fallback: any English male voice, then any English, then first
            if (!this.voice) {
                this.voice = voices.find(v => v.lang.startsWith('en') && /male/i.test(v.name))
                          || voices.find(v => v.lang.startsWith('en'))
                          || voices[0];
            }
            console.log('TTS SELECTED:', this.voice ? this.voice.name : 'default');
            this.ready = true;
        };
        pickVoice();
        speechSynthesis.onvoiceschanged = () => pickVoice();
    },

    speak(text, rate) {
        if (!window.speechSynthesis) return;
        if (!this.ready) TTS.init();
        speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        if (this.voice) utter.voice = this.voice;
        utter.rate = rate || 0.9;
        utter.pitch = 0.7;
        utter.volume = 1.0;
        speechSynthesis.speak(utter);
    },

    setVoice(index) {
        if (this.allVoices[index]) {
            this.voice = this.allVoices[index];
            console.log('TTS voice set to:', this.voice.name);
            this.speak('Naqu Fight');
        }
    }
};

const Music = {
    ctx: null,
    masterGain: null,
    playing: null,
    nodes: [],
    volume: 0.3,
    distCurve: null,

    init(audioCtx) {
        this.ctx = audioCtx;
        this.masterGain = this.ctx.createGain();
        const saved = localStorage.getItem('naquFightVolume');
        if (saved !== null) this.volume = parseFloat(saved);
        this.masterGain.gain.value = this.volume;
        this.masterGain.connect(this.ctx.destination);

        // Pre-compute distortion curve
        const samples = 44100;
        this.distCurve = new Float32Array(samples);
        const amount = 50;
        for (let i = 0; i < samples; i++) {
            const x = (i * 2) / samples - 1;
            this.distCurve[i] = ((Math.PI + amount) * x) / (Math.PI + amount * Math.abs(x));
        }
    },

    setVolume(vol) {
        this.volume = Math.max(0, Math.min(1, vol));
        if (this.masterGain) {
            this.masterGain.gain.value = this.volume;
        }
        localStorage.setItem('naquFightVolume', this.volume.toString());
    },

    stop() {
        this.nodes.forEach(n => {
            try { if (n.stop) n.stop(); } catch(e) {}
            try { n.disconnect(); } catch(e) {}
        });
        this.nodes = [];
        this.playing = null;
        if (this._loopInterval) clearInterval(this._loopInterval);
    },

    // ========================
    // MENU MUSIC - Dark, MK-style industrial
    // ========================
    playMenu() {
        if (this.playing === 'menu') return;
        this.stop();
        this.playing = 'menu';

        const ctx = this.ctx;
        const bpm = 135;
        const beat = 60 / bpm;
        const barLen = beat * 4;
        const loopLen = barLen * 8;

        const scheduleLoop = (startTime) => {
            // === DRUMS ===
            for (let bar = 0; bar < 8; bar++) {
                for (let b = 0; b < 4; b++) {
                    const t = startTime + bar * barLen + b * beat;

                    // Kick: beats 1 and 3, plus syncopation
                    if (b === 0 || b === 2) {
                        this.scheduleKick(t);
                    }
                    // Extra kick syncopation on certain bars
                    if ((bar % 2 === 1) && b === 3) {
                        this.scheduleKick(t + beat * 0.5);
                    }

                    // Snare: beats 2 and 4
                    if (b === 1 || b === 3) {
                        this.scheduleSnare(t);
                    }

                    // Hi-hats: 16th notes with accent pattern
                    for (let s = 0; s < 4; s++) {
                        const ht = t + s * beat * 0.25;
                        const accent = (s === 0) ? 0.12 : 0.05;
                        const open = (b === 1 && s === 2); // open hat before snare
                        this.scheduleHiHat(ht, accent, open);
                    }
                }

                // Crash on bar 1 and bar 5
                if (bar === 0 || bar === 4) {
                    this.scheduleCrash(startTime + bar * barLen);
                }
            }

            // === DISTORTED BASS ===
            // E Phrygian: E F G A B C D
            // Frequencies: E2=82, F2=87, G2=98, A2=110, Bb2=116, B2=123, C3=131, D3=147
            const bassPattern = [
                // Bar 1-2: aggressive E riff
                { t: 0, f: 82, d: beat * 0.8 },
                { t: beat, f: 82, d: beat * 0.3 },
                { t: beat * 1.5, f: 82, d: beat * 0.3 },
                { t: beat * 2, f: 87, d: beat * 0.8 },
                { t: beat * 3, f: 82, d: beat * 0.8 },
                { t: barLen, f: 82, d: beat * 0.8 },
                { t: barLen + beat, f: 98, d: beat * 0.5 },
                { t: barLen + beat * 2, f: 87, d: beat * 0.8 },
                { t: barLen + beat * 3, f: 82, d: beat * 1.2 },
                // Bar 3-4: climb up
                { t: barLen * 2, f: 98, d: beat * 0.8 },
                { t: barLen * 2 + beat, f: 98, d: beat * 0.3 },
                { t: barLen * 2 + beat * 1.5, f: 110, d: beat * 0.3 },
                { t: barLen * 2 + beat * 2, f: 116, d: beat * 0.8 },
                { t: barLen * 2 + beat * 3, f: 110, d: beat * 0.8 },
                { t: barLen * 3, f: 98, d: beat * 0.8 },
                { t: barLen * 3 + beat, f: 87, d: beat * 0.5 },
                { t: barLen * 3 + beat * 2, f: 82, d: beat * 1.5 },
                // Bar 5-6: variation
                { t: barLen * 4, f: 82, d: beat * 0.4 },
                { t: barLen * 4 + beat * 0.5, f: 82, d: beat * 0.4 },
                { t: barLen * 4 + beat, f: 82, d: beat * 0.4 },
                { t: barLen * 4 + beat * 1.5, f: 98, d: beat * 0.4 },
                { t: barLen * 4 + beat * 2, f: 110, d: beat * 0.8 },
                { t: barLen * 4 + beat * 3, f: 82, d: beat * 0.8 },
                { t: barLen * 5, f: 87, d: beat * 0.8 },
                { t: barLen * 5 + beat, f: 82, d: beat * 0.3 },
                { t: barLen * 5 + beat * 1.5, f: 82, d: beat * 0.3 },
                { t: barLen * 5 + beat * 2, f: 82, d: beat * 1.5 },
                // Bar 7-8: tension build
                { t: barLen * 6, f: 131, d: beat * 0.8 },
                { t: barLen * 6 + beat, f: 123, d: beat * 0.5 },
                { t: barLen * 6 + beat * 1.5, f: 116, d: beat * 0.5 },
                { t: barLen * 6 + beat * 2, f: 110, d: beat * 0.8 },
                { t: barLen * 6 + beat * 3, f: 98, d: beat * 0.5 },
                { t: barLen * 6 + beat * 3.5, f: 87, d: beat * 0.5 },
                { t: barLen * 7, f: 82, d: beat * 0.4 },
                { t: barLen * 7 + beat * 0.5, f: 82, d: beat * 0.4 },
                { t: barLen * 7 + beat, f: 82, d: beat * 0.4 },
                { t: barLen * 7 + beat * 2, f: 65, d: beat * 1.8 },
            ];
            bassPattern.forEach(n => {
                this.scheduleBass(startTime + n.t, n.f, n.d);
            });

            // === LEAD MELODY (dark, MK-inspired) ===
            // E Phrygian lead: E4=330, F4=349, G4=392, A4=440, Bb4=466, B4=494, C5=523
            const leadPattern = [
                // Bars 1-2: iconic riff
                { t: beat * 2, f: 330, d: beat * 0.3 },
                { t: beat * 2.5, f: 349, d: beat * 0.3 },
                { t: beat * 3, f: 330, d: beat * 0.8 },
                { t: barLen + beat, f: 330, d: beat * 0.3 },
                { t: barLen + beat * 1.5, f: 392, d: beat * 0.3 },
                { t: barLen + beat * 2, f: 349, d: beat * 0.5 },
                { t: barLen + beat * 3, f: 330, d: beat * 0.8 },
                // Bars 3-4: answer phrase
                { t: barLen * 2 + beat * 2, f: 392, d: beat * 0.3 },
                { t: barLen * 2 + beat * 2.5, f: 440, d: beat * 0.3 },
                { t: barLen * 2 + beat * 3, f: 466, d: beat * 0.5 },
                { t: barLen * 3, f: 440, d: beat * 0.5 },
                { t: barLen * 3 + beat, f: 392, d: beat * 0.5 },
                { t: barLen * 3 + beat * 2, f: 349, d: beat * 0.5 },
                { t: barLen * 3 + beat * 3, f: 330, d: beat * 1 },
                // Bars 5-6: higher intensity
                { t: barLen * 4, f: 523, d: beat * 0.3 },
                { t: barLen * 4 + beat * 0.5, f: 494, d: beat * 0.3 },
                { t: barLen * 4 + beat, f: 466, d: beat * 0.5 },
                { t: barLen * 4 + beat * 2, f: 440, d: beat * 0.5 },
                { t: barLen * 4 + beat * 3, f: 392, d: beat * 0.8 },
                { t: barLen * 5 + beat, f: 440, d: beat * 0.5 },
                { t: barLen * 5 + beat * 2, f: 392, d: beat * 0.3 },
                { t: barLen * 5 + beat * 2.5, f: 349, d: beat * 0.3 },
                { t: barLen * 5 + beat * 3, f: 330, d: beat * 1 },
                // Bars 7-8: descending resolution
                { t: barLen * 6, f: 466, d: beat * 0.5 },
                { t: barLen * 6 + beat, f: 440, d: beat * 0.5 },
                { t: barLen * 6 + beat * 2, f: 392, d: beat * 0.5 },
                { t: barLen * 6 + beat * 3, f: 349, d: beat * 0.5 },
                { t: barLen * 7, f: 330, d: beat * 1.5 },
                { t: barLen * 7 + beat * 2, f: 294, d: beat * 0.5 },
                { t: barLen * 7 + beat * 3, f: 330, d: beat * 0.8 },
            ];
            leadPattern.forEach(n => {
                this.scheduleLead(startTime + n.t, n.f, n.d);
            });

            // === POWER CHORD STABS ===
            // Hit on bar 1, 3, 5, 7 beat 1
            for (let bar = 0; bar < 8; bar += 2) {
                this.scheduleChord(startTime + bar * barLen, 82, beat * 0.4);
                // Echo stab
                this.scheduleChord(startTime + bar * barLen + beat * 1.5, 82, beat * 0.2);
            }

            // === DARK PAD (atmosphere) ===
            // Sustained drone that shifts every 2 bars
            const padNotes = [82, 87, 98, 82]; // E, F, G, E
            padNotes.forEach((freq, i) => {
                this.schedulePad(startTime + i * barLen * 2, freq, barLen * 2 - 0.1);
            });
        };

        scheduleLoop(ctx.currentTime + 0.1);

        this._loopInterval = setInterval(() => {
            if (this.playing !== 'menu') {
                clearInterval(this._loopInterval);
                return;
            }
            scheduleLoop(ctx.currentTime + 0.05);
        }, loopLen * 1000 - 200);
    },

    // ========================
    // FIGHT MUSIC - Fast, intense, aggressive
    // ========================
    playFight() {
        if (this.playing === 'fight') return;
        this.stop();
        this.playing = 'fight';

        const ctx = this.ctx;
        const bpm = 155;
        const beat = 60 / bpm;
        const barLen = beat * 4;
        const loopLen = barLen * 8;

        const scheduleLoop = (startTime) => {
            // === DRUMS (double-time feel) ===
            for (let bar = 0; bar < 8; bar++) {
                for (let b = 0; b < 4; b++) {
                    const t = startTime + bar * barLen + b * beat;

                    // Kick: every beat + offbeat on bars 2,4,6,8
                    this.scheduleKick(t);
                    if (bar % 2 === 1 && (b === 0 || b === 2)) {
                        this.scheduleKick(t + beat * 0.5);
                    }

                    // Snare: 2 and 4, with ghost notes
                    if (b === 1 || b === 3) {
                        this.scheduleSnare(t);
                    }
                    // Ghost snare
                    if (b === 0 && bar % 2 === 1) {
                        this.scheduleSnare(t + beat * 0.75, 0.15);
                    }

                    // Hi-hats: fast 16ths
                    for (let s = 0; s < 4; s++) {
                        const ht = t + s * beat * 0.25;
                        this.scheduleHiHat(ht, s === 0 ? 0.1 : 0.04, false);
                    }
                }

                // Crash every 4 bars
                if (bar % 4 === 0) {
                    this.scheduleCrash(startTime + bar * barLen);
                }

                // Fill on bar 4 and 8
                if (bar === 3 || bar === 7) {
                    const ft = startTime + bar * barLen + beat * 3;
                    for (let f = 0; f < 6; f++) {
                        this.scheduleSnare(ft + f * beat * 0.16, 0.2 + f * 0.03);
                    }
                }
            }

            // === AGGRESSIVE BASS ===
            const bassPattern = [
                // Bar 1-2: pumping E
                { t: 0, f: 82, d: beat * 0.5 },
                { t: beat * 0.5, f: 82, d: beat * 0.3 },
                { t: beat, f: 82, d: beat * 0.5 },
                { t: beat * 2, f: 98, d: beat * 0.5 },
                { t: beat * 3, f: 87, d: beat * 0.5 },
                { t: beat * 3.5, f: 82, d: beat * 0.3 },
                { t: barLen, f: 82, d: beat * 0.5 },
                { t: barLen + beat * 0.5, f: 82, d: beat * 0.3 },
                { t: barLen + beat, f: 110, d: beat * 0.5 },
                { t: barLen + beat * 2, f: 98, d: beat * 0.5 },
                { t: barLen + beat * 3, f: 87, d: beat * 0.8 },
                // Bar 3-4: variation
                { t: barLen * 2, f: 110, d: beat * 0.5 },
                { t: barLen * 2 + beat * 0.5, f: 110, d: beat * 0.3 },
                { t: barLen * 2 + beat, f: 98, d: beat * 0.5 },
                { t: barLen * 2 + beat * 2, f: 82, d: beat * 0.5 },
                { t: barLen * 2 + beat * 2.5, f: 82, d: beat * 0.3 },
                { t: barLen * 2 + beat * 3, f: 87, d: beat * 0.8 },
                { t: barLen * 3, f: 82, d: beat * 0.5 },
                { t: barLen * 3 + beat, f: 82, d: beat * 0.5 },
                { t: barLen * 3 + beat * 2, f: 65, d: beat * 1.8 },
                // Bar 5-8: repeat with more intensity
                { t: barLen * 4, f: 82, d: beat * 0.4 },
                { t: barLen * 4 + beat * 0.5, f: 82, d: beat * 0.4 },
                { t: barLen * 4 + beat, f: 82, d: beat * 0.4 },
                { t: barLen * 4 + beat * 1.5, f: 98, d: beat * 0.4 },
                { t: barLen * 4 + beat * 2, f: 110, d: beat * 0.5 },
                { t: barLen * 4 + beat * 3, f: 98, d: beat * 0.5 },
                { t: barLen * 5, f: 87, d: beat * 0.5 },
                { t: barLen * 5 + beat, f: 82, d: beat * 0.5 },
                { t: barLen * 5 + beat * 2, f: 82, d: beat * 1.5 },
                { t: barLen * 6, f: 131, d: beat * 0.5 },
                { t: barLen * 6 + beat, f: 123, d: beat * 0.5 },
                { t: barLen * 6 + beat * 2, f: 110, d: beat * 0.5 },
                { t: barLen * 6 + beat * 3, f: 98, d: beat * 0.5 },
                { t: barLen * 7, f: 87, d: beat * 0.5 },
                { t: barLen * 7 + beat, f: 82, d: beat * 0.3 },
                { t: barLen * 7 + beat * 1.5, f: 82, d: beat * 0.3 },
                { t: barLen * 7 + beat * 2, f: 65, d: beat * 1.8 },
            ];
            bassPattern.forEach(n => {
                this.scheduleBass(startTime + n.t, n.f, n.d);
            });

            // === FIGHT LEAD (aggressive stabs) ===
            const leadPattern = [
                { t: 0, f: 330, d: beat * 0.3 },
                { t: beat * 0.5, f: 349, d: beat * 0.3 },
                { t: beat, f: 330, d: beat * 0.5 },
                { t: beat * 2, f: 392, d: beat * 0.3 },
                { t: beat * 2.5, f: 349, d: beat * 0.3 },
                { t: beat * 3, f: 330, d: beat * 0.8 },
                { t: barLen * 2, f: 440, d: beat * 0.3 },
                { t: barLen * 2 + beat * 0.5, f: 466, d: beat * 0.3 },
                { t: barLen * 2 + beat, f: 440, d: beat * 0.5 },
                { t: barLen * 2 + beat * 2, f: 392, d: beat * 0.5 },
                { t: barLen * 2 + beat * 3, f: 349, d: beat * 0.8 },
                // Higher section
                { t: barLen * 4, f: 523, d: beat * 0.3 },
                { t: barLen * 4 + beat * 0.5, f: 494, d: beat * 0.3 },
                { t: barLen * 4 + beat, f: 466, d: beat * 0.5 },
                { t: barLen * 4 + beat * 2, f: 440, d: beat * 0.3 },
                { t: barLen * 4 + beat * 2.5, f: 392, d: beat * 0.3 },
                { t: barLen * 4 + beat * 3, f: 349, d: beat * 0.8 },
                { t: barLen * 6, f: 330, d: beat * 0.3 },
                { t: barLen * 6 + beat * 0.5, f: 349, d: beat * 0.3 },
                { t: barLen * 6 + beat, f: 392, d: beat * 0.5 },
                { t: barLen * 6 + beat * 2, f: 349, d: beat * 0.5 },
                { t: barLen * 6 + beat * 3, f: 330, d: beat * 1 },
            ];
            leadPattern.forEach(n => {
                this.scheduleLead(startTime + n.t, n.f, n.d);
            });

            // === POWER CHORDS (heavier) ===
            for (let bar = 0; bar < 8; bar += 2) {
                this.scheduleChord(startTime + bar * barLen, 82, beat * 0.5);
                this.scheduleChord(startTime + bar * barLen + beat * 2, 87, beat * 0.3);
            }
        };

        scheduleLoop(ctx.currentTime + 0.1);

        this._loopInterval = setInterval(() => {
            if (this.playing !== 'fight') {
                clearInterval(this._loopInterval);
                return;
            }
            scheduleLoop(ctx.currentTime + 0.05);
        }, loopLen * 1000 - 200);
    },

    // ========================
    // INSTRUMENTS
    // ========================

    // Heavy layered kick
    scheduleKick(time) {
        const ctx = this.ctx;
        // Sub layer
        const sub = ctx.createOscillator();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(180, time);
        sub.frequency.exponentialRampToValueAtTime(30, time + 0.12);
        const subGain = ctx.createGain();
        subGain.gain.setValueAtTime(0.6, time);
        subGain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
        sub.connect(subGain);
        subGain.connect(this.masterGain);
        sub.start(time);
        sub.stop(time + 0.15);
        this.nodes.push(sub);

        // Click/attack layer
        const click = ctx.createOscillator();
        click.type = 'square';
        click.frequency.setValueAtTime(800, time);
        click.frequency.exponentialRampToValueAtTime(100, time + 0.02);
        const clickGain = ctx.createGain();
        clickGain.gain.setValueAtTime(0.15, time);
        clickGain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);
        click.connect(clickGain);
        clickGain.connect(this.masterGain);
        click.start(time);
        click.stop(time + 0.03);
        this.nodes.push(click);
    },

    // Snare with noise + body
    scheduleSnare(time, vol) {
        const ctx = this.ctx;
        const v = vol || 0.3;

        // Noise burst
        const len = ctx.sampleRate * 0.12;
        const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < len; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 1.5);
        }
        const src = ctx.createBufferSource();
        src.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 3500;
        filter.Q.value = 0.8;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(v, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);
        src.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        src.start(time);
        src.stop(time + 0.12);
        this.nodes.push(src);

        // Body (pitched component)
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, time);
        osc.frequency.exponentialRampToValueAtTime(120, time + 0.04);
        const g2 = ctx.createGain();
        g2.gain.setValueAtTime(v * 0.6, time);
        g2.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
        osc.connect(g2);
        g2.connect(this.masterGain);
        osc.start(time);
        osc.stop(time + 0.05);
        this.nodes.push(osc);
    },

    // Hi-hat (closed/open)
    scheduleHiHat(time, vol, open) {
        const ctx = this.ctx;
        const duration = open ? 0.15 : 0.04;
        const len = ctx.sampleRate * duration;
        const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        const decay = open ? 0.7 : 2;
        for (let i = 0; i < len; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
        }
        const src = ctx.createBufferSource();
        src.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = open ? 6000 : 9000;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(vol || 0.06, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
        src.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        src.start(time);
        src.stop(time + duration);
        this.nodes.push(src);
    },

    // Crash cymbal
    scheduleCrash(time) {
        const ctx = this.ctx;
        const len = ctx.sampleRate * 0.8;
        const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < len; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 0.5);
        }
        const src = ctx.createBufferSource();
        src.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 5000;
        filter.Q.value = 0.3;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.12, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.8);
        src.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        src.start(time);
        src.stop(time + 0.8);
        this.nodes.push(src);
    },

    // Distorted bass synth (two oscillators + waveshaper)
    scheduleBass(time, freq, duration) {
        const ctx = this.ctx;

        // Main oscillator
        const osc1 = ctx.createOscillator();
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(freq, time);
        // Sub oscillator (one octave down)
        const osc2 = ctx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(freq * 0.5, time);

        // Mix
        const mix = ctx.createGain();
        mix.gain.value = 0.5;
        const subMix = ctx.createGain();
        subMix.gain.value = 0.4;

        osc1.connect(mix);
        osc2.connect(subMix);

        // Distortion
        const dist = ctx.createWaveShaper();
        dist.curve = this.distCurve;
        dist.oversample = '2x';

        // Filter with envelope
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, time);
        filter.frequency.exponentialRampToValueAtTime(300, time + duration);
        filter.Q.value = 4;

        // Output gain
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.18, time);
        gain.gain.setValueAtTime(0.18, time + duration * 0.6);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

        mix.connect(dist);
        dist.connect(filter);
        subMix.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc1.start(time);
        osc1.stop(time + duration);
        osc2.start(time);
        osc2.stop(time + duration);
        this.nodes.push(osc1, osc2);
    },

    // Lead synth (detuned for thickness)
    scheduleLead(time, freq, duration) {
        const ctx = this.ctx;

        // Two slightly detuned oscillators for thickness
        const osc1 = ctx.createOscillator();
        osc1.type = 'square';
        osc1.frequency.setValueAtTime(freq * 1.003, time);
        const osc2 = ctx.createOscillator();
        osc2.type = 'sawtooth';
        osc2.frequency.setValueAtTime(freq * 0.997, time);

        const mix = ctx.createGain();
        mix.gain.value = 0.5;
        osc1.connect(mix);
        osc2.connect(mix);

        // Filter sweep
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(4000, time);
        filter.frequency.exponentialRampToValueAtTime(1500, time + duration);
        filter.Q.value = 2;

        // Gain envelope
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.001, time);
        gain.gain.linearRampToValueAtTime(0.09, time + 0.01); // quick attack
        gain.gain.setValueAtTime(0.09, time + duration * 0.5);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

        mix.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc1.start(time);
        osc1.stop(time + duration);
        osc2.start(time);
        osc2.stop(time + duration);
        this.nodes.push(osc1, osc2);
    },

    // Power chord (root + fifth + octave, distorted)
    scheduleChord(time, rootFreq, duration) {
        const ctx = this.ctx;
        [1, 1.5, 2, 3].forEach(mult => {
            const osc = ctx.createOscillator();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(rootFreq * mult, time);

            const dist = ctx.createWaveShaper();
            dist.curve = this.distCurve;

            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.06, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

            osc.connect(dist);
            dist.connect(gain);
            gain.connect(this.masterGain);
            osc.start(time);
            osc.stop(time + duration + 0.05);
            this.nodes.push(osc);
        });
    },

    // Dark atmospheric pad
    schedulePad(time, freq, duration) {
        const ctx = this.ctx;
        // Three detuned oscillators for wide stereo-like pad
        const detunes = [-7, 0, 7];
        detunes.forEach(det => {
            const osc = ctx.createOscillator();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq * 2, time); // one octave up
            osc.detune.setValueAtTime(det, time);

            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(600, time);
            filter.frequency.linearRampToValueAtTime(900, time + duration * 0.5);
            filter.frequency.linearRampToValueAtTime(600, time + duration);

            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.001, time);
            gain.gain.linearRampToValueAtTime(0.025, time + duration * 0.2);
            gain.gain.setValueAtTime(0.025, time + duration * 0.7);
            gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.masterGain);
            osc.start(time);
            osc.stop(time + duration + 0.05);
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
        src.onended = () => { src.disconnect(); filter.disconnect(); gain.disconnect(); };
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
        osc.onended = () => { osc.disconnect(); gain.disconnect(); };
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
        this.noise(0.1, 0.15, 4000, 'highpass');
    },

    lowKick() {
        this.noise(0.1, 0.45, 1200, 'lowpass');
        this.tone(150, 0.08, 0.2, 'sawtooth', 40);
    },

    uppercut() {
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
        this.noise(0.2, 0.7, 1500, 'bandpass');
        this.tone(100, 0.25, 0.3, 'sawtooth', 30);
        this.tone(400, 0.2, 0.15, 'square', 100);
        setTimeout(() => {
            this.noise(0.15, 0.3, 5000, 'highpass');
            this.tone(800, 0.15, 0.1, 'sine', 200);
        }, 50);
    },

    blocked() {
        this.tone(600, 0.08, 0.2, 'square', 200);
        this.tone(900, 0.06, 0.15, 'square', 300);
        this.noise(0.06, 0.2, 3000, 'highpass');
    },

    sweep() {
        this.noise(0.15, 0.5, 600, 'lowpass');
        this.tone(80, 0.12, 0.3, 'sine', 30);
        this.noise(0.12, 0.2, 5000, 'highpass');
    },

    knockdown() {
        this.noise(0.25, 0.6, 400, 'lowpass');
        this.tone(60, 0.2, 0.35, 'sine', 20);
        setTimeout(() => {
            this.noise(0.15, 0.3, 300, 'lowpass');
        }, 100);
    },

    ko() {
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
        this.tone(200, 0.15, 0.15, 'square');
        setTimeout(() => this.tone(300, 0.15, 0.15, 'square'), 120);
        setTimeout(() => this.tone(400, 0.2, 0.2, 'square'), 240);
        setTimeout(() => this.tone(600, 0.3, 0.25, 'sawtooth'), 400);
    },

    fight() {
        this.tone(500, 0.1, 0.2, 'sawtooth');
        setTimeout(() => {
            this.tone(700, 0.15, 0.25, 'sawtooth');
            this.noise(0.1, 0.2, 3000, 'bandpass');
        }, 100);
    },

    roundWin() {
        const t = (delay, freq, dur) => setTimeout(() => this.tone(freq, dur, 0.15, 'square'), delay);
        t(0, 523, 0.12);
        t(120, 659, 0.12);
        t(240, 784, 0.12);
        t(400, 1047, 0.3);
    },

    gameOver() {
        const t = (delay, freq, dur) => setTimeout(() => this.tone(freq, dur, 0.15, 'sawtooth'), delay);
        t(0, 400, 0.2);
        t(200, 350, 0.2);
        t(400, 300, 0.2);
        t(600, 200, 0.4);
    },

    victory() {
        const t = (delay, freq, dur) => setTimeout(() => this.tone(freq, dur, 0.15, 'square'), delay);
        t(0, 523, 0.1);
        t(100, 523, 0.1);
        t(200, 523, 0.15);
        t(380, 659, 0.15);
        t(550, 784, 0.2);
        t(750, 1047, 0.4);
    },

    finishHim() {
        this.tone(80, 0.5, 0.2, 'sawtooth', 60);
        this.tone(120, 0.5, 0.15, 'square', 80);
        setTimeout(() => {
            this.tone(60, 0.6, 0.25, 'sawtooth', 40);
            this.noise(0.3, 0.15, 800, 'lowpass');
        }, 300);
    }
};
