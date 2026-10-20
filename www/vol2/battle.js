// Training battles and fights. Real-time, readable telegraphs, touch-friendly buttons.
//
// HS (Cuetip's curse) rises during every fight. Above 60% his moves are weaker and slower, above 85%
// it flares and staggers him, at 100% it takes him down. A medicine SHOT pushes it back: with his
// treatment, Cuetip can fight.
//
// New in Vol. 2: WARD (the Starlit Braid) reflects green curse bolts, purple thorn SNARES can't be
// guarded (dash out of them), and TOGETHER calls in a friend once parries/interrupts/reflects fill it.
"use strict";

// Enemy attacks. The "!" over an enemy is coloured by what's coming:
// yellow = normal (guard/parry it), cyan = lunge (DASH into it to interrupt), green = curse bolt (adds HS),
// red = slam (huge: parry or get out of the way with a dash), purple = thorn snare (unblockable: dash away).
const ATTACKS = {
  swipe: { windup: 0.6, dmg: 10, color: "#ffd23d" },
  combo: { windup: 0.45, dmg: 7, hits: 2, color: "#ffd23d" },
  lunge: { windup: 0.95, dmg: 17, color: "#2de2ff", interruptible: true },
  bolt: { windup: 0.8, dmg: 5, hs: 18, color: "#7fff6a", reflectable: true },
  snare: { windup: 0.9, dmg: 13, hs: 8, color: "#c07aff", unblockable: true },
  slam: { windup: 1.15, dmg: 26, color: "#ff2a2a" },
  guard: { guard: 1.8 },
};

const ENEMIES = {
  kit_spar: { sprite: "kit", name: "Kit", hp: 90, moves: { swipe: 2, combo: 1, lunge: 2, guard: 1 }, idle: [0.8, 1.3], dmg: 0.35 },
  hound: { sprite: "hound", name: "Thorn Hound", hp: 46, moves: { swipe: 3, combo: 1, snare: 2 }, idle: [0.8, 1.4], dmg: 0.9 },
  rook: { sprite: "rook", name: "Rook", hp: 9999, moves: { bolt: 4, swipe: 1 }, idle: [1.0, 1.5], dmg: 0.4, invulnerable: true },
  moth: { sprite: "moth", name: "Blight Moth", hp: 58, moves: { bolt: 3, swipe: 2 }, idle: [0.9, 1.5], dmg: 0.8 },
  knight: { sprite: "knight", name: "Thorn Knight", hp: 120, moves: { swipe: 2, combo: 1, guard: 2, snare: 1, slam: 1 }, idle: [0.7, 1.2], dmg: 0.9 },
  quill: { sprite: "quill", name: "Sir Quill", hp: 250, moves: { combo: 2, lunge: 2, guard: 2, snare: 1, slam: 1, swipe: 1 }, idle: [0.6, 1.1], dmg: 1 },
  bloom: { sprite: "bloom", name: "The Withering Bloom", hp: 300, moves: { bolt: 3, snare: 2, guard: 2, slam: 1, swipe: 1 }, idle: [0.8, 1.3], dmg: 1 },
  nightshade: { sprite: "nightshade", name: "Lady Nightshade", hp: 280, moves: { bolt: 3, snare: 2, swipe: 2, combo: 1, lunge: 1, guard: 1 }, idle: [0.6, 1.1], dmg: 1 },
  nightshade2: { sprite: "nightshade", name: "Nightshade, Queen of the Blight Moon", hp: 460, moves: { bolt: 3, snare: 2, swipe: 2, combo: 2, lunge: 2, guard: 2, slam: 1 }, idle: [0.5, 1.0], dmg: 1, rage: 0.5 },
};

const BATTLES = {
  spar: { enemy: "kit_spar", bg: "home", music: "battle", goal: { type: "ko" }, hsRate: 0.6, shots: 1,
    tip: "Sparring with Kit. Remember: GUARD to parry, DASH through cyan lunges, HEAVY for guards." },
  hounds: { enemy: "hound", count: 3, bg: "blightree", music: "boss", goal: { type: "ko" }, hsRate: 2, shots: 2,
    tip: "PURPLE “!” is a thorn snare. You can't guard it. DASH out of the way." },
  rook: { enemy: "rook", bg: "peaks", music: "battle", goal: { type: "reflect", n: 3 }, hsRate: 1, shots: 1, wardWindow: 0.5,
    tip: "When the “!” is GREEN, tap WARD just before the bolt lands to send it back. Reflect 3." },
  thistle: { enemy: "moth", count: 3, bg: "thistle", music: "battle", goal: { type: "ko" }, hsRate: 3.2, startHs: 30, shots: 2,
    tip: "Pip is watching. WARD the bolts, take your SHOT when you need it. No shame in it." },
  knights: { enemy: "knight", count: 2, bg: "briar", music: "battle", goal: { type: "ko" }, hsRate: 2, shots: 2,
    tip: "Parry, interrupt and reflect to fill TOGETHER. When it's full, call a friend in." },
  quill: { enemy: "quill", bg: "bridge", music: "boss", goal: { type: "ko" }, hsRate: 2.2, shots: 2,
    tip: "Sir Quill guards a lot. HEAVY breaks it. Dash his snares." },
  bloom: { enemy: "bloom", bg: "garden", music: "boss", goal: { type: "ko" }, hsRate: 2.6, shots: 2,
    tip: "The Bloom spits curse bolts. WARD them back into it." },
  nightshade: { enemy: "nightshade", bg: "throne2", music: "boss", goal: { type: "ko" }, hsRate: 2.6, shots: 2,
    tip: "Lady Nightshade. Everything you've got." },
  final: { enemy: "nightshade2", bg: "throne2", music: "moonboss", goal: { type: "ko" }, hsRate: 3, startHs: 25, shots: 2,
    tip: "The Blight Moon is full. Stay standing. You're not alone." },
};

const MOVE_INFO = {
  strike: { label: "Strike", key: "J" },
  guard: { label: "Guard", key: "K", flag: "guard" },
  dash: { label: "Dash", key: "L", flag: "dash" },
  heavy: { label: "Heavy", key: "I", flag: "heavy" },
  focus: { label: "Focus", key: "U", flag: "focus" },
  ward: { label: "Ward", key: "O", flag: "ward" },
  together: { label: "Together", key: "Y", flag: "together" },
  shot: { label: "Shot", key: "H" },
};

// Who answers when Cuetip calls for help, in turn. Dr. Moss heals instead of hitting.
const ASSISTS = [
  { who: "kit", line: "Kit: Go, blue!" },
  { who: "moss", line: "Dr. Moss: Breathe, sweetheart." },
  { who: "ozzie", line: "Ozzie: MOUNTAIN FALLING!" },
  { who: "pip", line: "Pip: I'm not scared!" },
  { who: "bramble", line: "Bramble: Shell up, little one." },
  { who: "rook", line: "Rook: Hex. Broken." },
];

const Battle = {
  active: false, paused: false,

  start(id, vars, easy, done) {
    const cfg = BATTLES[id], en = ENEMIES[cfg.enemy];
    this.id = id; this.cfg = cfg; this.done = done; this.vars = vars; this.easy = !!easy;
    CAST.cuetip.braid = !!vars.braid;
    this.active = true; this.paused = false; this.t = 0; this.result = null; this.queue = [];
    const bonusShots = (vars.bonds || 0) >= 3 && id === "final" ? 1 : 0;
    this.p = {
      hp: 100, hs: cfg.startHs || 0, shots: cfg.shots + (easy ? 1 : 0) + bonusShots,
      cd: { strike: 0, dash: 0, heavy: 0, focus: 0, ward: 0 }, lock: 0, guarding: false, guardAt: -9, charging: null,
      focusUntil: 0, wardUntil: 0, snared: 0, bond: 0, anim: null, flash: 0, stumbleAt: 4,
    };
    this.ev = { parry: 0, interrupt: 0, guardbreak: 0, shot: 0, focus: 0, reflect: 0 };
    this.assist = null; this.assistIdx = vars.assistIdx || 0;
    this.remaining = (cfg.count || 1);
    this.spawn(en);
    this.parts = [];
    Sound.playMusic(cfg.music || "battle");
    this.buildUI();
    this.tip(cfg.tip, 5);
    $("battle-ui").classList.add("show");
  },

  spawn(en) {
    this.e = { def: en, hp: en.hp, max: en.hp, state: "idle", timer: 1.2, move: null, anim: null, flash: 0, stun: 0 };
  },

  unlocked(move) {
    if (move === "strike") return true;
    if (move === "shot") return this.p.shots > 0 || !!this.vars.meds;
    if (this.id === "bramble" && move === "guard") return true;
    if (this.id === "moss" && move === "focus") return true;
    if (this.id === "kit_train" && move === "dash") return true;
    if (this.id === "ozzie" && move === "heavy") return true;
    if (this.id === "rook" && move === "ward") return true;
    return !!this.vars[MOVE_INFO[move].flag];
  },

  buildUI() {
    const box = $("b-controls");
    box.innerHTML = "";
    const desk = matchMedia("(hover: hover)").matches;
    for (const [m, info] of Object.entries(MOVE_INFO)) {
      if (!this.unlocked(m)) continue;
      const b = document.createElement("button");
      b.className = "bbtn"; b.dataset.move = m;
      b.innerHTML = `<span>${info.label}</span>${desk ? `<kbd>${info.key}</kbd>` : ""}<i class="cd"></i>`;
      const hold = m === "guard" || m === "heavy";
      b.addEventListener("pointerdown", (e) => { e.preventDefault(); b.setPointerCapture(e.pointerId); this.press(m); });
      if (hold) {
        const up = () => this.release(m);
        b.addEventListener("pointerup", up); b.addEventListener("pointercancel", up); b.addEventListener("lostpointercapture", up);
      }
      box.appendChild(b);
    }
    $("b-ename").textContent = this.e.def.name;
    $("b-result").classList.remove("show");
    this.syncUI();
  },

  key(e, down) {
    const map = { j: "strike", k: "guard", l: "dash", i: "heavy", u: "focus", o: "ward", y: "together", h: "shot", " ": "strike" };
    const m = map[e.key.toLowerCase()];
    if (!m || !this.unlocked(m)) return false;
    if (down && !e.repeat) this.press(m);
    if (!down) this.release(m);
    return true;
  },

  // ---- player actions ----
  hsMul() { return this.p.hs >= 60 ? 1.4 : 1; },
  dmgMul() { return (this.p.hs >= 60 ? 0.7 : 1) * (this.vars.claws ? 1.3 : 1); },

  press(m) {
    if (!this.active || this.result || this.paused) return;
    Sound.unlock();
    const p = this.p;
    if (m === "guard") { if (p.lock <= 0 && !p.charging) { p.guarding = true; p.guardAt = this.t; } return; }
    if (m === "heavy") { if (p.lock <= 0 && p.cd.heavy <= 0) { p.charging = { at: this.t }; p.guarding = false; Sound.sfx("charge"); } return; }
    if (p.lock > 0 || p.focusUntil > this.t) return;
    if (m === "strike" && p.cd.strike <= 0) {
      p.cd.strike = 0.45 * this.hsMul(); p.anim = { kind: "strike", t: 0, dur: 0.22 };
      this.later(0.09, () => this.hitEnemy(5, "strike"));
    } else if (m === "dash" && p.cd.dash <= 0) {
      p.cd.dash = 2.4 * this.hsMul(); p.anim = { kind: "dash", t: 0, dur: 0.35 };
      const e = this.e;
      if (e.state === "windup" && e.move.interruptible) {
        e.state = "stun"; e.stun = 1.2; e.move = null; this.ev.interrupt++; this.addBond(25);
        this.float("INTERRUPT!", 228, 70, "#2de2ff"); Sound.sfx("parry");
      }
      for (let i = 0; i < 3; i++) this.later(0.06 + i * 0.07, () => this.hitEnemy(5, "dash"));
    } else if (m === "ward" && p.cd.ward <= 0) {
      p.cd.ward = 2.2 * this.hsMul(); p.wardUntil = this.t + (this.cfg.wardWindow || 0.42);
      Sound.sfx("ward");
    } else if (m === "together" && p.bond >= 100) {
      this.callFriend();
    } else if (m === "focus" && p.cd.focus <= 0) {
      p.cd.focus = 9; p.focusUntil = this.t + 1.2; this.ev.focus++;
      this.float("Focus...", 92, 70, "#9fffcf"); Sound.sfx("focus");
    } else if (m === "shot" && p.shots > 0) {
      p.shots--; p.hs = Math.max(0, p.hs - 75); p.lock = 0.6; this.ev.shot++;
      p.anim = { kind: "shot", t: 0, dur: 0.6 };
      this.float("Medicine in. Breathe.", 92, 64, "#9fffcf"); Sound.sfx("shot");
      for (let i = 0; i < 14; i++) this.parts.push({ x: 92 + Math.random() * 20 - 10, y: 120, vx: Math.random() * 30 - 15, vy: -30 - Math.random() * 40, life: 0.9, c: "#7fffc8", plus: true });
    }
    this.syncUI();
  },

  release(m) {
    const p = this.p;
    if (m === "guard") p.guarding = false;
    if (m === "heavy" && p.charging) {
      const held = this.t - p.charging.at;
      p.charging = null; p.cd.heavy = 3.2 * this.hsMul();
      p.anim = { kind: "heavy", t: 0, dur: 0.3 };
      const full = held >= 0.6;
      this.later(0.11, () => this.hitEnemy(full ? 26 : 8, full ? "heavy" : "strike"));
    }
  },

  later(delay, fn) { this.queue.push({ at: this.t + delay, fn }); },

  addBond(n) {
    if (!this.unlocked("together")) return;
    const was = this.p.bond;
    this.p.bond = Math.min(100, this.p.bond + n);
    if (was < 100 && this.p.bond >= 100) { this.float("Together ready!", 92, 60, "#ffd8ec"); Sound.sfx("ready"); }
  },

  callFriend() {
    const p = this.p, a = ASSISTS[this.assistIdx++ % ASSISTS.length];
    this.vars.assistIdx = this.assistIdx;
    p.bond = 0;
    this.assist = { who: a.who, t: 0 };
    this.tip(a.line, 1.6);
    Sound.sfx("together");
    if (a.who === "moss") {
      p.hp = Math.min(100, p.hp + 35); p.hs = Math.max(0, p.hs - 35);
      this.float("+35  HS -35", 92, 80, "#9fffcf");
      for (let i = 0; i < 16; i++) this.parts.push({ x: 92 + Math.random() * 24 - 12, y: 130, vx: Math.random() * 30 - 15, vy: -30 - Math.random() * 40, life: 1, c: "#7fffc8", plus: true });
      return;
    }
    const e = this.e;
    e.state = "stun"; e.stun = 2; e.move = null;
    for (let i = 0; i < 3; i++) this.later(0.25 + i * 0.12, () => this.hitEnemy(13, "assist"));
  },

  hitEnemy(base, kind) {
    const e = this.e;
    if (!this.active || this.result || !e) return;
    if (e.state === "guard") {
      if (kind === "heavy") {
        e.state = "stun"; e.stun = 1.6; this.ev.guardbreak++; this.addBond(30);
        this.float("GUARD BREAK!", 228, 66, "#ffd23d"); Sound.sfx("break"); this.shake = 0.3;
      } else { this.float("blocked", 228, 76, "#9a8cc0"); Sound.sfx("block"); return; }
    }
    if (kind === "strike" || kind === "dash") this.addBond(3);
    let dmg = Math.round(base * this.dmgMul() * (e.state === "stun" ? 1.5 : 1));
    e.flash = 0.12;
    Sound.sfx(kind === "heavy" || kind === "assist" || kind === "reflect" ? "heavyhit" : "hit");
    for (let i = 0; i < 6; i++) this.parts.push({ x: 222, y: 112, vx: Math.random() * 60 - 10, vy: -Math.random() * 60, life: 0.4, c: "#ffffff" });
    if (e.def.invulnerable) { this.float(String(dmg), 232, 84, "#c8c0e8"); return; }
    e.hp -= dmg;
    this.float(String(dmg), 232, 84, kind === "heavy" ? "#ffd23d" : kind === "reflect" ? "#7fff6a" : kind === "assist" ? "#ffd8ec" : "#ffffff");
    if (e.hp <= 0) {
      this.remaining--;
      if (this.remaining > 0) { this.float("Another one!", 228, 60, "#ff9a4a"); this.spawn(e.def); }
      else this.finish(true);
    }
  },

  // ---- enemy ----
  pickMove() {
    const moves = this.e.def.moves, total = Object.values(moves).reduce((a, b) => a + b, 0);
    let r = Math.random() * total;
    for (const [k, w] of Object.entries(moves)) { r -= w; if (r <= 0) return k; }
    return Object.keys(moves)[0];
  },

  enemyHits(move) {
    const p = this.p, a = ATTACKS[move], win = this.cfg.parryWindow || 0.24;
    const dmgMul = this.e.def.dmg * (this.easy ? 0.5 : 1);
    const sinceGuard = this.t - p.guardAt;
    const dodging = p.anim && p.anim.kind === "dash" && p.anim.t < 0.25;
    if (a.unblockable) {
      if (dodging) { this.float("dodged", 96, 76, "#c07aff"); return true; }
      const dmg = Math.round(a.dmg * dmgMul);
      p.hp -= dmg; p.hs += a.hs; p.flash = 0.2; p.snared = 0.6; p.lock = 0.5;
      this.float(p.guarding ? `-${dmg} can't guard thorns!` : `-${dmg} SNARED`, 96, 80, "#c07aff");
      p.guarding = false; p.charging = null; p.focusUntil = 0;
      Sound.sfx("snare"); this.shake = 0.25;
      return true;
    }
    if (a.reflectable && p.wardUntil > this.t) {
      p.wardUntil = 0; this.ev.reflect++; this.addBond(25);
      this.float("REFLECT!", 96, 66, "#fff2b0"); Sound.sfx("parry");
      this.reflectFx = 0.3;
      this.later(0.12, () => this.hitEnemy(18, "reflect"));
      return false;
    }
    if (p.guarding && sinceGuard <= win) {
      this.ev.parry++; this.addBond(25);
      this.e.state = "stun"; this.e.stun = 1.3; this.e.move = null;
      this.float("PARRY!", 96, 66, "#ffffff"); Sound.sfx("parry"); this.flashAll = 0.15;
      return false;
    }
    if (p.guarding) {
      p.hp -= Math.round(a.dmg * dmgMul * 0.2);
      if (a.hs) p.hs += a.hs * 0.3;
      this.float("guarded", 96, 76, "#8fd3ff"); Sound.sfx("block");
      return true;
    }
    if (dodging) { this.float("dodged", 96, 76, "#2de2ff"); return true; }
    const dmg = Math.round(a.dmg * dmgMul);
    p.hp -= dmg; p.flash = 0.2; p.charging = null; p.focusUntil = 0;
    p.hs += (a.hs || 0) + 3 * (this.cfg.hsRate > 0 ? 1 : 0);
    this.float(`-${dmg}`, 96, 80, "#ff5a6a");
    if (a.hs) this.float("HS spreads", 96, 92, "#7fff6a");
    Sound.sfx("hurt"); this.shake = 0.2;
    return true;
  },

  update(dt) {
    if (!this.active || this.paused) return;
    this.t += dt;
    const p = this.p, e = this.e, cfg = this.cfg;
    this.shake = Math.max(0, (this.shake || 0) - dt);
    this.flashAll = Math.max(0, (this.flashAll || 0) - dt);
    for (const pt of this.parts) { pt.x += pt.vx * dt; pt.y += pt.vy * dt; pt.vy += 120 * dt; pt.life -= dt; }
    this.parts = this.parts.filter((pt) => pt.life > 0);
    if (this.result) return;
    const due = this.queue.filter((q) => q.at <= this.t);
    this.queue = this.queue.filter((q) => q.at > this.t);
    for (const q of due) q.fn();
    if (this.result) return;

    for (const k in p.cd) p.cd[k] = Math.max(0, p.cd[k] - dt);
    p.lock = Math.max(0, p.lock - dt);
    p.flash = Math.max(0, p.flash - dt);
    p.snared = Math.max(0, p.snared - dt);
    this.reflectFx = Math.max(0, (this.reflectFx || 0) - dt);
    if (this.assist) { this.assist.t += dt; if (this.assist.t > 1.1) this.assist = null; }
    if (p.anim) { p.anim.t += dt; if (p.anim.t > p.anim.dur) p.anim = null; }
    // focus heals when it completes
    if (p.focusUntil && this.t >= p.focusUntil) { p.focusUntil = 0; p.hp = Math.min(100, p.hp + 28); this.float("+28", 92, 80, "#9fffcf"); }
    // HS creeps
    if (cfg.hsRate && !(p.focusUntil > this.t)) p.hs += cfg.hsRate * (this.easy ? 0.6 : 1) * dt;
    if (p.hs >= 85 && this.t >= p.stumbleAt) {
      p.stumbleAt = this.t + 3.5; p.lock = 0.6; p.guarding = false; p.charging = null;
      this.float("HS flare!", 92, 70, "#b07aff"); Sound.sfx("hurt");
    }
    if (p.charging && this.t - p.charging.at > 0.6 && !p.charging.ready) { p.charging.ready = true; Sound.sfx("ready"); }

    // enemy state machine
    e.flash = Math.max(0, e.flash - dt);
    if (e.anim) { e.anim.t += dt; if (e.anim.t > e.anim.dur) e.anim = null; }
    e.timer -= dt;
    if (e.state === "stun") { e.stun -= dt; if (e.stun <= 0) { e.state = "idle"; e.timer = 0.5; } }
    else if (e.state === "idle" && e.timer <= 0) {
      const mk = this.pickMove(), a = ATTACKS[mk];
      if (a.guard) { e.state = "guard"; e.timer = a.guard; }
      else {
        const rage = e.def.rage && e.hp < e.max * e.def.rage ? 0.8 : 1;
        e.state = "windup"; e.move = { ...a, key: mk, hitsLeft: a.hits || 1 }; e.timer = a.windup * rage; e.windupLen = e.timer;
      }
    } else if (e.state === "windup" && e.timer <= 0) {
      e.anim = { kind: "attack", t: 0, dur: 0.22 };
      const landed = this.enemyHits(e.move.key);
      if (e.state === "stun") { /* parried */ }
      else if (--e.move.hitsLeft > 0 && landed) { e.timer = 0.3; e.windupLen = 0.3; }
      else { e.state = "recover"; e.timer = 0.45; e.move = null; }
    } else if (e.state === "recover" && e.timer <= 0) {
      e.state = "idle"; e.timer = e.def.idle[0] + Math.random() * (e.def.idle[1] - e.def.idle[0]);
    } else if (e.state === "guard" && e.timer <= 0) {
      e.state = "idle"; e.timer = 0.4;
    }

    // goals and defeat
    const g = cfg.goal;
    if (g.type === "scripted" && this.t >= g.t) return this.finish(true, true);
    if (g.type === "parry" && this.ev.parry >= g.n) return this.finish(true);
    if (g.type === "interrupt" && this.ev.interrupt >= g.n) return this.finish(true);
    if (g.type === "guardbreak" && this.ev.guardbreak >= g.n) return this.finish(true);
    if (g.type === "reflect" && this.ev.reflect >= g.n) return this.finish(true);
    if (g.type === "treat" && this.t >= g.t && this.ev.shot > 0 && this.ev.focus > 0) return this.finish(true);
    if (g.type === "scripted") p.hp = Math.max(p.hp, 30);
    if (p.hs >= 100) { p.hs = 100; return this.finish(false, false, "HS overwhelmed Cuetip."); }
    if (p.hp <= 0) { p.hp = 0; return this.finish(false, false, "Cuetip went down."); }
    this.syncUI();
  },

  finish(won, scripted, why) {
    if (this.result) return;
    this.result = won ? "win" : "lose";
    this.p.guarding = false; this.p.charging = null;
    const box = $("b-result"), title = $("b-result-title"), text = $("b-result-text"), btns = $("b-result-btns");
    btns.innerHTML = "";
    const add = (label, fn, primary) => { const b = document.createElement("button"); b.className = "btn" + (primary ? " primary" : ""); b.textContent = label; b.onclick = fn; btns.appendChild(b); };
    if (won) {
      Sound.sfx(scripted ? "hurt" : "win");
      title.textContent = scripted ? "..." : this.cfg.goal.type === "ko" ? "Victory" : "Lesson learned";
      text.textContent = scripted ? this.cfg.scriptedText || "Too strong. For now." : this.lessonText();
      add("Continue", () => this.end("win"), true);
      setTimeout(() => btns.querySelector("button") && matchMedia("(hover: hover)").matches && btns.querySelector("button").focus(), 50);
    } else {
      Sound.sfx("lose");
      title.textContent = "Not like this";
      text.textContent = `${why} Try again?`;
      add("Retry", () => this.retry(false), true);
      add("Retry (easier)", () => this.retry(true));
      add("Skip fight", () => this.end("skip"));
    }
    box.classList.add("show");
  },

  lessonText() {
    return {
      spar: "Still got it.",
      rook: "Cuetip learned WARD. Curse bolts can be sent back where they came from.",
      thistle: "Pip saw the whole thing. Shot and all.",
      knights: "Nobody fights alone.",
    }[this.id] || "The fight is won.";
  },

  retry(easy) { this.start(this.id, this.vars, easy || this.easy, this.done); },

  end(result) {
    this.active = false;
    $("battle-ui").classList.remove("show");
    $("b-result").classList.remove("show");
    this.done(result);
  },

  tip(text, secs) {
    const el = $("b-goal");
    el.textContent = text;
    el.classList.add("show");
    clearTimeout(this.tipTimer);
    this.tipTimer = setTimeout(() => el.classList.remove("show"), secs * 1000);
  },

  float(text, x, y, color) {
    const el = document.createElement("div");
    el.className = "bfloat"; el.textContent = text; el.style.color = color;
    el.style.left = `${(x / SW) * 100}%`; el.style.top = `${(y / SH) * 100}%`;
    $("b-fx").appendChild(el);
    setTimeout(() => el.remove(), 900);
  },

  syncUI() {
    const p = this.p, e = this.e;
    $("b-hp").style.width = `${Math.max(0, p.hp)}%`;
    $("b-hs").style.width = `${Math.min(100, p.hs)}%`;
    $("b-hs-wrap").classList.toggle("danger", p.hs >= 60);
    $("b-ehp").style.width = e.def.invulnerable ? "100%" : `${Math.max(0, (e.hp / e.max) * 100)}%`;
    $("b-goal-count").textContent = this.goalText();
    document.querySelectorAll("#b-controls .bbtn").forEach((b) => {
      const m = b.dataset.move;
      let frac = 0;
      if (m === "shot") { b.querySelector("span").textContent = `Shot ×${p.shots}`; b.disabled = p.shots <= 0; }
      else if (m === "together") { frac = 1 - p.bond / 100; b.disabled = p.bond < 100; }
      else if (p.cd[m] !== undefined) { const full = { strike: 0.45, dash: 2.4, heavy: 3.2, focus: 9, ward: 2.2 }[m] * this.hsMul(); frac = p.cd[m] / full; }
      b.querySelector(".cd").style.height = `${Math.min(1, frac) * 100}%`;
      b.classList.toggle("held", (m === "guard" && p.guarding) || (m === "heavy" && !!p.charging));
      b.classList.toggle("ready", (m === "heavy" && !!(p.charging && p.charging.ready)) || (m === "together" && p.bond >= 100));
    });
  },

  goalText() {
    const g = this.cfg.goal, ev = this.ev;
    if (g.type === "parry") return `Parries ${ev.parry}/${g.n}`;
    if (g.type === "interrupt") return `Interrupts ${ev.interrupt}/${g.n}`;
    if (g.type === "guardbreak") return `Guard breaks ${ev.guardbreak}/${g.n}`;
    if (g.type === "reflect") return `Reflects ${ev.reflect}/${g.n}`;
    if (g.type === "treat") return `${ev.shot ? "✓" : "•"} Shot  ${ev.focus ? "✓" : "•"} Focus  ${Math.max(0, Math.ceil(g.t - this.t))}s`;
    if (this.cfg.count > 1) return `Enemies left: ${this.remaining}`;
    return "";
  },

  // ---- drawing ----
  draw(g, t) {
    const p = this.p, e = this.e;
    g.save();
    if (this.shake > 0) g.translate(Math.round(Math.random() * 4 - 2), Math.round(Math.random() * 2 - 1));
    g.drawImage(BgCache.get(this.cfg.bg), 0, 0);
    BACKGROUNDS[this.cfg.bg].draw(g, t);
    g.fillStyle = "rgba(7,4,15,0.35)"; g.fillRect(0, 0, SW, SH);
    // ground shadows
    for (const x of [92, 228]) { g.fillStyle = "rgba(0,0,0,0.45)"; g.beginPath(); g.ellipse(x, 150, 22, 4, 0, 0, 7); g.fill(); }

    // --- Cuetip
    let px = 92, py = 0;
    const a = p.anim;
    if (a) {
      const k = a.t / a.dur;
      if (a.kind === "strike") px += Math.sin(k * Math.PI) * 24;
      if (a.kind === "dash") px += Math.sin(k * Math.PI) * 90;
      if (a.kind === "heavy") px += Math.sin(k * Math.PI) * 40;
      if (a.kind === "shot") py = Math.sin(k * Math.PI) * -2;
    }
    if (p.flash > 0) px -= 4;
    if (p.lock > 0 && !a) px -= Math.round(Math.sin(t * 40));
    const bob = Math.round(Math.sin(t * 3) * 1);
    const hsLevel = Math.min(1, p.hs / 100);
    const cue = SpriteCache.fighter("cuetip", hsLevel);
    if (p.charging) {
      const c = Math.min(1, (this.t - p.charging.at) / 0.6);
      g.fillStyle = c >= 1 ? `rgba(255,210,61,${0.35 + 0.2 * Math.sin(t * 20)})` : `rgba(255,210,61,${c * 0.3})`;
      g.beginPath(); g.arc(px, 122, 16 + c * 10, 0, 7); g.fill();
    }
    if (p.wardUntil > this.t) {
      const k = (p.wardUntil - this.t) / 0.45;
      g.strokeStyle = `rgba(255,242,176,${0.5 + 0.5 * k})`; g.beginPath(); g.arc(px, 120, 20, 0, 7); g.stroke();
      for (let i = 0; i < 6; i++) { const ang = this.t * 6 + i * 1.05; Px.rect(g, px + Math.cos(ang) * 20, 120 + Math.sin(ang) * 20, 1, 1, "#ffffff"); }
    }
    if (p.focusUntil > this.t) { g.strokeStyle = "rgba(159,255,207,0.8)"; g.lineWidth = 1; const r = 14 + ((this.t * 30) % 16); g.beginPath(); g.arc(px, 120, r, 0, 7); g.stroke(); }
    g.drawImage(cue, Math.round(px - 32), 88 + bob + py);
    if (p.flash > 0) { g.fillStyle = `rgba(255,60,80,${p.flash * 2})`; g.fillRect(px - 18, 100, 36, 50); }
    if (p.snared > 0) for (let i = 0; i < 5; i++) {
      const x = px - 14 + i * 7, h = Math.round(Math.min(1, p.snared * 3) * (18 + (i % 2) * 10));
      Px.line(g, x, 150, x + (i % 2 ? 3 : -3), 150 - h, "#5a2a6a"); Px.rect(g, x + (i % 2 ? 3 : -3), 150 - h, 2, 2, "#c07aff");
    }
    if (this.reflectFx > 0) { g.fillStyle = `rgba(127,255,106,${this.reflectFx * 2.5})`; g.fillRect(104, 112, 120, 3); }
    if (p.guarding) {
      g.strokeStyle = this.t - p.guardAt <= (this.cfg.parryWindow || 0.24) ? "#ffffff" : "#8fd3ff"; g.lineWidth = 2;
      g.beginPath(); g.arc(px + 4, 120, 22, -1.1, 1.1); g.stroke(); g.lineWidth = 1;
    }
    if (a && a.kind === "strike" && a.t > 0.06 && a.t < 0.18) { g.strokeStyle = "#ffffff"; g.beginPath(); g.arc(px + 20, 118, 14, -1.2, 0.9); g.stroke(); }
    if (a && a.kind === "heavy" && a.t < 0.2) { g.strokeStyle = "#ffd23d"; g.lineWidth = 3; g.beginPath(); g.arc(px + 26, 118, 18, -1.3, 1.1); g.stroke(); g.lineWidth = 1; }
    if (a && a.kind === "dash") { g.fillStyle = "rgba(45,226,255,0.4)"; g.fillRect(92, 116, px - 92, 2); g.fillRect(92, 124, px - 92, 1); }
    if (a && a.kind === "shot") { Px.rect(g, px - 18, 110, 8, 2, "#e8f0ff"); Px.rect(g, px - 20, 110, 2, 2, "#c8d0e0"); Px.rect(g, px - 10, 110, 4, 1, "#e8f0ff"); Px.rect(g, px - 16, 110, 3, 1, "#7fffc8"); }

    // --- enemy (mirrored to face Cuetip)
    let ex = 228;
    if (e.state === "windup") ex += Math.round(Math.sin(this.t * 30) * 1) + 3;
    if (e.anim) ex -= Math.sin((e.anim.t / e.anim.dur) * Math.PI) * 70;
    const img = SpriteCache.fighter(e.def.sprite);
    g.save(); g.translate(Math.round(ex + 32), 88); g.scale(-1, 1);
    g.drawImage(img, 0, 0);
    if (e.flash > 0) { g.globalCompositeOperation = "source-atop"; g.fillStyle = "rgba(255,255,255,0.8)"; g.fillRect(0, 0, 64, 64); }
    g.restore();
    if (e.state === "guard") { g.strokeStyle = "#c9a24a"; g.lineWidth = 2; g.beginPath(); g.arc(ex - 6, 120, 22, Math.PI - 1.1, Math.PI + 1.1); g.stroke(); g.lineWidth = 1; }
    if (e.state === "stun") for (let i = 0; i < 3; i++) { const ang = this.t * 5 + i * 2.1; Px.rect(g, ex + Math.cos(ang) * 10, 84 + Math.sin(ang) * 3, 2, 2, "#ffd23d"); }
    if (e.state === "windup" && e.move) {
      const late = e.timer <= (this.cfg.parryWindow || 0.24);
      const c = late ? "#ffffff" : e.move.color;
      Px.rect(g, ex - 2, 72, 4, 9, c); Px.rect(g, ex - 2, 83, 4, 3, c);
      if (late) { g.fillStyle = "rgba(255,255,255,0.25)"; g.beginPath(); g.arc(ex, 78, 9, 0, 7); g.fill(); }
    }

    if (this.assist && this.assist.who !== "moss") {
      const k = this.assist.t / 1.1, ax = -40 + Math.sin(Math.min(1, k * 1.6) * Math.PI / 2) * 220 - (k > 0.75 ? (k - 0.75) * 900 : 0);
      g.globalAlpha = k > 0.75 ? Math.max(0, 1 - (k - 0.75) * 4) : 1;
      g.drawImage(SpriteCache.fighter(this.assist.who), Math.round(ax), 86);
      g.fillStyle = "rgba(255,216,236,0.35)"; g.fillRect(Math.round(ax) - 30, 114, 30, 2);
      g.globalAlpha = 1;
    }
    if (this.assist && this.assist.who === "moss") {
      const r = 10 + this.assist.t * 30;
      g.strokeStyle = `rgba(127,255,200,${1 - this.assist.t})`; g.beginPath(); g.arc(px, 120, r, 0, 7); g.stroke();
    }
    for (const pt of this.parts) {
      if (pt.plus) { Px.rect(g, pt.x - 1, pt.y, 3, 1, pt.c); Px.rect(g, pt.x, pt.y - 1, 1, 3, pt.c); }
      else Px.rect(g, pt.x, pt.y, 2, 2, pt.c);
    }
    // HS darkens the edges of the world as it rises
    if (p.hs > 40) {
      const k = Math.min(1, (p.hs - 40) / 60);
      const grd = g.createRadialGradient(160, 100, 80 - k * 30, 160, 100, 200);
      grd.addColorStop(0, "rgba(10,4,20,0)"); grd.addColorStop(1, `rgba(10,4,20,${0.75 * k})`);
      g.fillStyle = grd; g.fillRect(0, 0, SW, SH);
    }
    if (this.flashAll > 0) { g.fillStyle = `rgba(255,255,255,${this.flashAll * 3})`; g.fillRect(0, 0, SW, SH); }
    g.restore();
  },
};
