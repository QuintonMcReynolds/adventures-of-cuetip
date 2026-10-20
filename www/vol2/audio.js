// Generated sound for Adventures of Cuetip: music, ambience and effects are synthesized live, no audio files.
"use strict";

const Sound = {
  ctx: null, master: null, musicBus: null, sfxBus: null, ambBus: null,
  music: null, amb: null, musicKey: null, ambKey: null,
  vol: { music: 0.6, sfx: 0.8 },

  unlock() {
    if (this.ctx) { if (this.ctx.state === "suspended") this.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const c = this.ctx = new AC();
    this.master = c.createGain(); this.master.connect(c.destination);
    this.musicBus = c.createGain(); this.musicBus.connect(this.master);
    this.ambBus = c.createGain(); this.ambBus.connect(this.master);
    this.sfxBus = c.createGain(); this.sfxBus.connect(this.master);
    this.applyVolume();
    const m = this.musicKey, a = this.ambKey;
    this.musicKey = this.ambKey = null;
    if (m) this.playMusic(m);
    if (a) this.playAmb(a);
  },
  applyVolume() {
    if (!this.ctx) return;
    this.musicBus.gain.value = this.vol.music * 0.5;
    this.ambBus.gain.value = this.vol.music * 0.6;
    this.sfxBus.gain.value = this.vol.sfx;
  },

  noiseBuffer(type = "white") {
    const c = this.ctx, b = c.createBuffer(1, c.sampleRate * 2, c.sampleRate), d = b.getChannelData(0);
    let last = 0;
    for (let i = 0; i < d.length; i++) {
      const w = Math.random() * 2 - 1;
      d[i] = type === "brown" ? (last = (last + 0.02 * w) / 1.02) * 3.5 : w;
    }
    return b;
  },

  // ---- ambience ----
  playAmb(key) {
    if (key === this.ambKey) return;
    this.ambKey = key;
    if (!this.ctx) return;
    if (this.amb) { const old = this.amb; old.gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.4); setTimeout(() => old.stop(), 2000); this.amb = null; }
    if (!key || key === "stop") return;
    const c = this.ctx, out = c.createGain();
    out.gain.value = 0; out.gain.setTargetAtTime(1, c.currentTime, 0.6); out.connect(this.ambBus);
    const src = c.createBufferSource(); src.buffer = this.noiseBuffer(key === "rain" ? "white" : "brown"); src.loop = true;
    const f = c.createBiquadFilter();
    if (key === "rain") { f.type = "bandpass"; f.frequency.value = 2400; f.Q.value = 0.4; }
    else { f.type = "lowpass"; f.frequency.value = 260; }
    const g = c.createGain(); g.gain.value = key === "rain" ? 0.25 : 0.9;
    src.connect(f).connect(g).connect(out); src.start();
    let timer = null;
    if (key === "train") {
      // wheels over rail joints: clack-clack
      const clack = (t) => {
        const o = c.createBufferSource(); o.buffer = this.noiseBuffer(); const bp = c.createBiquadFilter();
        bp.type = "bandpass"; bp.frequency.value = 900; bp.Q.value = 3;
        const e = c.createGain(); e.gain.setValueAtTime(0.18, t); e.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
        o.connect(bp).connect(e).connect(out); o.start(t); o.stop(t + 0.1);
      };
      timer = setInterval(() => { const t = c.currentTime + 0.05; clack(t); clack(t + 0.18); }, 1300);
    }
    this.amb = { gain: out, stop: () => { try { src.stop(); } catch (e) {} clearInterval(timer); } };
  },

  // ---- music: small generative loops ----
  TRACKS: {
    // music box lullaby in A minor
    lull: { tempo: 0.42, wave: "triangle", oct: 2, notes: [69, 72, 76, 72, 74, 71, 67, 71, 69, 72, 76, 79, 77, 76, 74, 71], pad: [45, 52, 57], vol: 0.11 },
    // unease: sparse low drone, a tritone that never resolves
    unease: { tempo: 1.1, wave: "sine", oct: 1, notes: [57, null, 63, null, 56, null, null, 62], pad: [33, 39], vol: 0.12 },
    // tender: warmer, major-leaning
    tender: { tempo: 0.55, wave: "triangle", oct: 2, notes: [64, 67, 71, 72, 71, 67, 69, 64, 62, 66, 69, 71, 69, 66, 67, 62], pad: [48, 55, 64], vol: 0.1 },
    // battle: driving minor arpeggio with a kick
    battle: { tempo: 0.16, wave: "square", oct: 1, notes: [57, 60, 64, 60, 57, 60, 65, 60, 55, 59, 62, 59, 56, 59, 64, 59], pad: [33, 40], vol: 0.045, beat: true },
    // boss: heavier, half-diminished, relentless
    boss: { tempo: 0.14, wave: "sawtooth", oct: 1, notes: [50, 53, 56, 53, 50, 53, 57, 53, 49, 52, 56, 52, 48, 51, 55, 58], pad: [26, 32], vol: 0.035, beat: true },
    // home: warm and hopeful
    home: { tempo: 0.5, wave: "triangle", oct: 2, notes: [67, 71, 74, 79, 76, 74, 71, 72, 69, 72, 76, 74, 72, 71, 69, 67], pad: [43, 50, 59], vol: 0.1 },
    // dread: heartbeat bass + high glass
    // blight: a slow, off-kilter waltz under the violet moon
    blight: { tempo: 0.48, wave: "triangle", oct: 2, notes: [62, 65, 68, 62, 65, 69, 61, 64, 68, 61, 64, 67, 60, 63, 66, 59, 62, 65], pad: [38, 44, 49], vol: 0.1 },
    // moonboss: the final fight, faster and stranger than boss
    moonboss: { tempo: 0.13, wave: "sawtooth", oct: 1, notes: [50, 53, 57, 62, 61, 57, 53, 50, 49, 52, 56, 61, 60, 56, 52, 55], pad: [26, 33], vol: 0.035, beat: true },
    // dawn: the morning after, bright and open
    dawn: { tempo: 0.45, wave: "triangle", oct: 2, notes: [72, 76, 79, 84, 83, 79, 76, 74, 71, 74, 79, 81, 79, 76, 74, 72], pad: [48, 55, 64, 67], vol: 0.1 },
    dread: { tempo: 0.8, wave: "square", oct: 1, notes: [84, null, null, 83, null, null, 79, null], pad: [31, 38], vol: 0.05, beat: true },
  },
  playMusic(key) {
    if (key === this.musicKey) return;
    this.musicKey = key;
    if (!this.ctx) return;
    if (this.music) { const old = this.music; old.gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.5); setTimeout(() => old.stop(), 2500); this.music = null; }
    const tr = this.TRACKS[key];
    if (!tr) return;
    const c = this.ctx, out = c.createGain();
    out.gain.value = 0; out.gain.setTargetAtTime(1, c.currentTime, 0.8); out.connect(this.musicBus);
    const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
    // pad
    const pads = tr.pad.map((m) => {
      const o = c.createOscillator(), g = c.createGain(), lp = c.createBiquadFilter();
      o.type = "sawtooth"; o.frequency.value = hz(m); o.detune.value = Math.random() * 10 - 5;
      lp.type = "lowpass"; lp.frequency.value = 500; g.gain.value = 0.035;
      o.connect(lp).connect(g).connect(out); o.start(); return o;
    });
    let step = 0;
    const tick = () => {
      const t = c.currentTime + 0.05, n = tr.notes[step % tr.notes.length];
      if (n != null) {
        const o = c.createOscillator(), g = c.createGain();
        o.type = tr.wave; o.frequency.value = hz(n);
        g.gain.setValueAtTime(tr.vol, t); g.gain.exponentialRampToValueAtTime(0.0008, t + tr.tempo * 2.4);
        o.connect(g).connect(out); o.start(t); o.stop(t + tr.tempo * 2.5);
      }
      if (tr.beat && step % 4 === 0) { this.thump(t, out); this.thump(t + 0.22, out, 0.6); }
      step++;
    };
    tick();
    const timer = setInterval(tick, tr.tempo * 1000);
    this.music = { gain: out, stop: () => { clearInterval(timer); pads.forEach((o) => { try { o.stop(); } catch (e) {} }); } };
  },
  thump(t, dest, v = 1) {
    const c = this.ctx, o = c.createOscillator(), g = c.createGain();
    o.frequency.setValueAtTime(70, t); o.frequency.exponentialRampToValueAtTime(35, t + 0.18);
    g.gain.setValueAtTime(0.5 * v, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    o.connect(g).connect(dest || this.sfxBus); o.start(t); o.stop(t + 0.3);
  },

  // ---- effects ----
  tone(freq, dur, type = "square", vol = 0.08, slide = 0, delay = 0) {
    if (!this.ctx) return;
    const c = this.ctx, t = c.currentTime + delay, o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(this.sfxBus); o.start(t); o.stop(t + dur + 0.02);
  },
  burst(dur, freq, vol = 0.3) {
    if (!this.ctx) return;
    const c = this.ctx, t = c.currentTime, s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    s.buffer = this.noiseBuffer(); f.type = "lowpass"; f.frequency.value = freq;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    s.connect(f).connect(g).connect(this.sfxBus); s.start(t); s.stop(t + dur);
  },
  sfx(key) {
    switch (key) {
      case "blip": this.tone(520 + Math.random() * 60, 0.03, "square", 0.015); break;
      case "select": this.tone(660, 0.06, "square", 0.04); this.tone(990, 0.08, "square", 0.03, 0, 0.05); break;
      case "shard": [988, 1319, 1568, 1976].forEach((f, i) => this.tone(f, 0.5, "triangle", 0.06, 0, i * 0.09)); break;
      case "punch": this.burst(0.06, 4000, 0.4); this.tone(1800, 0.04, "square", 0.05); break;
      case "slam": this.burst(0.5, 400, 0.8); this.tone(60, 0.4, "sine", 0.4, -20); break;
      case "crash": this.burst(1.6, 2500, 0.9); this.tone(120, 1.2, "sawtooth", 0.15, -80); break;
      case "heartbeat": if (this.ctx) { const t = this.ctx.currentTime; this.thump(t); this.thump(t + 0.25, null, 0.6); } break;
      case "glass": [2093, 2637, 3136].forEach((f, i) => this.tone(f, 0.9, "sine", 0.04, -200, i * 0.03)); break;
      case "whisper": this.burst(1.2, 1800, 0.12); break;
      case "cards": for (let i = 0; i < 8; i++) setTimeout(() => this.burst(0.03, 6000, 0.2), i * 35); break;
      case "beep": this.tone(1000, 0.12, "sine", 0.06); break;
      case "hit": this.burst(0.08, 3000, 0.35); this.tone(220, 0.08, "square", 0.05, -120); break;
      case "heavyhit": this.burst(0.25, 1200, 0.7); this.tone(90, 0.3, "sawtooth", 0.12, -40); break;
      case "block": this.tone(900, 0.06, "square", 0.04); this.tone(600, 0.08, "square", 0.03, 0, 0.03); break;
      case "parry": [1568, 2093, 2637].forEach((f, i) => this.tone(f, 0.25, "triangle", 0.07, 0, i * 0.03)); this.burst(0.05, 8000, 0.2); break;
      case "break": this.burst(0.35, 2000, 0.6); this.tone(330, 0.3, "square", 0.08, -250); break;
      case "hurt": this.tone(300, 0.18, "sawtooth", 0.08, -180); break;
      case "charge": this.tone(200, 0.6, "triangle", 0.05, 400); break;
      case "ready": this.tone(1200, 0.08, "square", 0.04); break;
      case "focus": [523, 659, 784].forEach((f, i) => this.tone(f, 0.6, "sine", 0.05, 0, i * 0.12)); break;
      case "shot": this.tone(1400, 0.05, "square", 0.03); [659, 784, 988, 1319].forEach((f, i) => this.tone(f, 0.4, "sine", 0.05, 0, 0.1 + i * 0.08)); break;
      case "win": [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.3, "square", 0.05, 0, i * 0.11)); break;
      case "lose": [392, 349, 311, 262].forEach((f, i) => this.tone(f, 0.35, "triangle", 0.06, 0, i * 0.18)); break;
      case "ward": [1760, 2349, 2637].forEach((f, i) => this.tone(f, 0.3, "sine", 0.05, 0, i * 0.04)); break;
      case "snare": this.burst(0.3, 900, 0.5); this.tone(180, 0.3, "sawtooth", 0.08, -100); this.tone(120, 0.25, "square", 0.04, 60, 0.08); break;
      case "together": [523, 659, 784, 1047, 1319].forEach((f, i) => this.tone(f, 0.45, "triangle", 0.06, 0, i * 0.06)); this.burst(0.2, 6000, 0.15); break;
      case "cuetip": this.tone(880, 0.08, "square", 0.04, 300); this.tone(1320, 0.1, "square", 0.03, -200, 0.09); break;
    }
  },
};
