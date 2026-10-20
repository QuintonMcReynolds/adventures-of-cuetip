// Training battles and fights. Real-time, readable telegraphs, touch-friendly buttons.
//
// HS (Cuetip's curse) rises during every fight. Above 60% his moves are weaker and slower, above 85%
// it flares and staggers him, at 100% it takes him down. A medicine SHOT pushes it back: with his
// treatment, Cuetip can fight.
"use strict";

// Enemy attacks. The "!" over an enemy is coloured by what's coming:
// yellow = normal (guard/parry it), cyan = lunge (DASH into it to interrupt), green = curse bolt (adds HS),
// red = slam (huge: parry or get out of the way with a dash).
const ATTACKS = {
  swipe: { windup: 0.6, dmg: 10, color: "#ffd23d" },
  combo: { windup: 0.45, dmg: 7, hits: 2, color: "#ffd23d" },
  lunge: { windup: 0.95, dmg: 17, color: "#2de2ff", interruptible: true },
  bolt: { windup: 0.8, dmg: 5, hs: 18, color: "#7fff6a" },
  slam: { windup: 1.15, dmg: 26, color: "#ff2a2a" },
  guard: { guard: 1.8 },
};

const ENEMIES = {
  vexmoor_p: { sprite: "vexmoor", name: "Vexmoor", hp: 9999, moves: { swipe: 2, combo: 1 }, idle: [0.7, 1.1], dmg: 0.35, invulnerable: true },
  bramble: { sprite: "bramble", name: "Bramble", hp: 9999, moves: { swipe: 1 }, idle: [1.1, 1.7], dmg: 0.4, invulnerable: true },
  wolf: { sprite: "wolf", name: "Shade Wolf", hp: 55, moves: { swipe: 3, combo: 1 }, idle: [0.8, 1.5], dmg: 1 },
  wisp: { sprite: "wisp", name: "Rot Wisp", hp: 9999, moves: { bolt: 1, swipe: 2 }, idle: [1.3, 2.0], dmg: 0.6, invulnerable: true },
  kit: { sprite: "kit", name: "Kit", hp: 130, moves: { swipe: 2, combo: 2, lunge: 1, guard: 1 }, idle: [0.55, 1.0], dmg: 1 },
  kit_train: { sprite: "kit", name: "Kit", hp: 9999, moves: { lunge: 3, swipe: 1 }, idle: [0.9, 1.3], dmg: 0.4, invulnerable: true },
  ozzie: { sprite: "ozzie", name: "Ozzie", hp: 9999, moves: { guard: 3, swipe: 1 }, idle: [0.6, 1.0], dmg: 0.4, invulnerable: true },
  warden: { sprite: "warden", name: "The Gravewarden", hp: 280, moves: { slam: 2, swipe: 2, guard: 2, lunge: 1 }, idle: [0.7, 1.2], dmg: 1 },
  vexmoor: { sprite: "vexmoor", name: "Vexmoor, the Rot King", hp: 450, moves: { bolt: 3, swipe: 2, combo: 2, lunge: 2, guard: 2, slam: 1 }, idle: [0.5, 1.0], dmg: 1, rage: 0.5 },
};

const BATTLES = {
  prologue: { enemy: "vexmoor_p", bg: "village", music: "boss", goal: { type: "scripted", t: 13 }, hsRate: 0, shots: 0,
    tip: "Fight back! Tap STRIKE." },
  bramble: { enemy: "bramble", bg: "mountain", music: "battle", goal: { type: "parry", n: 3 }, hsRate: 1, shots: 0, parryWindow: 0.38,
    tip: "Tap GUARD right as the “!” turns white to PARRY. Parry 3 times." },
  wolves: { enemy: "wolf", count: 2, bg: "forest", music: "battle", goal: { type: "ko" }, hsRate: 1.6, shots: 0,
    tip: "Shade wolves! STRIKE, and GUARD or PARRY their bites." },
  moss: { enemy: "wisp", bg: "swamp", music: "battle", goal: { type: "treat", t: 18 }, hsRate: 4.5, startHs: 55, shots: 2,
    tip: "HS is flaring. Take your SHOT, then FOCUS to heal. Hold on for 18 seconds." },
  kit: { enemy: "kit", bg: "ember", music: "battle", goal: { type: "ko" }, hsRate: 2, shots: 2,
    tip: "Kit is fast. Parry her, then punish." },
  kit_train: { enemy: "kit_train", bg: "ember", music: "battle", goal: { type: "interrupt", n: 2 }, hsRate: 1.2, shots: 1,
    tip: "When the “!” is CYAN, hit DASH to cut her lunge off. Interrupt 2 lunges." },
  ozzie: { enemy: "ozzie", bg: "arena", music: "battle", goal: { type: "guardbreak", n: 2 }, hsRate: 1.2, shots: 1,
    tip: "Ozzie turtles up. HOLD HEAVY until it glows, release to smash his guard. Break it twice." },
  warden: { enemy: "warden", bg: "spire", music: "boss", goal: { type: "ko" }, hsRate: 2.4, shots: 2,
    tip: "Red “!” means a SLAM. Parry it or dash through." },
  final: { enemy: "vexmoor", bg: "spire", music: "boss", goal: { type: "ko" }, hsRate: 2.8, shots: 2,
    tip: "Everything you've learned. End this." },
};

const MOVE_INFO = {
  strike: { label: "Strike", key: "J" },
  guard: { label: "Guard", key: "K", flag: "guard" },
  dash: { label: "Dash", key: "L", flag: "dash" },
  heavy: { label: "Heavy", key: "I", flag: "heavy" },
  focus: { label: "Focus", key: "U", flag: "focus" },
  shot: { label: "Shot", key: "H" },
};

const Battle = {
  active: false, paused: false,

  start(id, vars, easy, done) {
    const cfg = BATTLES[id], en = ENEMIES[cfg.enemy];
    this.id = id; this.cfg = cfg; this.done = done; this.vars = vars; this.easy = !!easy;
    this.active = true; this.paused = false; this.t = 0; this.result = null; this.queue = [];
    const bonusShots = (vars.bonds || 0) >= 3 && id === "final" ? 1 : 0;
    this.p = {
      hp: 100, hs: cfg.startHs || 0, shots: cfg.shots + (easy ? 1 : 0) + bonusShots,
      cd: { strike: 0, dash: 0, heavy: 0, focus: 0 }, lock: 0, guarding: false, guardAt: -9, charging: null,
      focusUntil: 0, anim: null, flash: 0, stumbleAt: 4,
    };
    this.ev = { parry: 0, interrupt: 0, guardbreak: 0, shot: 0, focus: 0 };
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
    const map = { j: "strike", k: "guard", l: "dash", i: "heavy", u: "focus", h: "shot", " ": "strike" };
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
        e.state = "stun"; e.stun = 1.2; e.move = null; this.ev.interrupt++;
        this.float("INTERRUPT!", 228, 70, "#2de2ff"); Sound.sfx("parry");
      }
      for (let i = 0; i < 3; i++) this.later(0.06 + i * 0.07, () => this.hitEnemy(5, "dash"));
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

  hitEnemy(base, kind) {
    const e = this.e;
    if (!this.active || this.result || !e) return;
    if (e.state === "guard") {
      if (kind === "heavy") {
        e.state = "stun"; e.stun = 1.6; this.ev.guardbreak++;
        this.float("GUARD BREAK!", 228, 66, "#ffd23d"); Sound.sfx("break"); this.shake = 0.3;
      } else { this.float("blocked", 228, 76, "#9a8cc0"); Sound.sfx("block"); return; }
    }
    let dmg = Math.round(base * this.dmgMul() * (e.state === "stun" ? 1.5 : 1));
    e.flash = 0.12;
    Sound.sfx(kind === "heavy" ? "heavyhit" : "hit");
    for (let i = 0; i < 6; i++) this.parts.push({ x: 222, y: 112, vx: Math.random() * 60 - 10, vy: -Math.random() * 60, life: 0.4, c: "#ffffff" });
    if (e.def.invulnerable) { this.float(String(dmg), 232, 84, "#c8c0e8"); return; }
    e.hp -= dmg;
    this.float(String(dmg), 232, 84, kind === "heavy" ? "#ffd23d" : "#ffffff");
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
    if (p.guarding && sinceGuard <= win) {
      this.ev.parry++;
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
    if (p.anim && p.anim.kind === "dash" && p.anim.t < 0.25) { this.float("dodged", 96, 76, "#2de2ff"); return true; }
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
      text.textContent = scripted ? "Vexmoor is too strong. For now." : this.lessonText();
      add("Continue", () => this.end("win"), true);
      setTimeout(() => btns.querySelector("button") && matchMedia("(hover: hover)").matches && btns.querySelector("button").focus(), 50);
    } else {
      Sound.sfx("lose");
      title.textContent = "Not like this";
      text.textContent = `${why} Try again?`;
      add("Retry", () => this.retry(false), true);
      add("Retry (easier)", () => this.retry(true));
      if (Ads.hasReward()) add("▶ Video: retry with +2 shots", async () => { if (await Ads.watchForReward()) { this.retry(false); this.p.shots += 2; this.syncUI(); } });
      add("Skip fight", () => this.end("skip"));
    }
    box.classList.add("show");
  },

  lessonText() {
    return {
      bramble: "Cuetip learned GUARD and PARRY.",
      moss: "Cuetip learned FOCUS, and how his medicine keeps him in the fight.",
      kit_train: "Cuetip learned DASH STRIKE.",
      ozzie: "Cuetip learned HEAVY BLOW.",
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
      else if (p.cd[m] !== undefined) { const full = { strike: 0.45, dash: 2.4, heavy: 3.2, focus: 9 }[m] * this.hsMul(); frac = p.cd[m] / full; }
      b.querySelector(".cd").style.height = `${Math.min(1, frac) * 100}%`;
      b.classList.toggle("held", (m === "guard" && p.guarding) || (m === "heavy" && !!p.charging));
      b.classList.toggle("ready", m === "heavy" && !!(p.charging && p.charging.ready));
    });
  },

  goalText() {
    const g = this.cfg.goal, ev = this.ev;
    if (g.type === "parry") return `Parries ${ev.parry}/${g.n}`;
    if (g.type === "interrupt") return `Interrupts ${ev.interrupt}/${g.n}`;
    if (g.type === "guardbreak") return `Guard breaks ${ev.guardbreak}/${g.n}`;
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
    if (p.focusUntil > this.t) { g.strokeStyle = "rgba(159,255,207,0.8)"; g.lineWidth = 1; const r = 14 + ((this.t * 30) % 16); g.beginPath(); g.arc(px, 120, r, 0, 7); g.stroke(); }
    g.drawImage(cue, Math.round(px - 32), 88 + bob + py);
    if (p.flash > 0) { g.fillStyle = `rgba(255,60,80,${p.flash * 2})`; g.fillRect(px - 18, 100, 36, 50); }
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
