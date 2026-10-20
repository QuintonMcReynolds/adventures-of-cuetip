// Adventures of Cuetip: story engine. Parses story.js, runs it, draws the stage and drives the UI.
"use strict";

const $ = (id) => document.getElementById(id);
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
};

// ---------------------------------------------------------------- parser
function parseStory(src) {
  const cmds = [], labels = {};
  let inChoice = false;
  for (const raw of src.split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("//")) continue;
    if (line.startsWith("# ")) { labels[line.slice(2).trim()] = cmds.length; inChoice = false; continue; }
    if (line.startsWith("* ")) {
      let body = line.slice(2), cond = null;
      const m = body.match(/^\[(.+?)\]\s*/);
      if (m) { cond = m[1]; body = body.slice(m[0].length); }
      const [main, ...fx] = body.split(";");
      const [text, jump] = main.split("->");
      const opt = { text: text.trim(), jump: jump ? jump.trim() : null, cond, effects: fx.join(" ").trim() };
      if (inChoice) cmds[cmds.length - 1].options.push(opt);
      else cmds.push({ op: "choice", options: [opt] });
      inChoice = true;
      continue;
    }
    inChoice = false;
    if (line.startsWith("@")) {
      const [op, ...args] = line.slice(1).split(/\s+/);
      cmds.push({ op, args, rest: line.slice(op.length + 2) });
      continue;
    }
    const m = line.match(/^([a-z]+):\s+(.*)$/);
    if (m && (CAST[m[1]] || m[1] === "me" || m[1] === "cuetip")) cmds.push({ op: "say", who: m[1], text: m[2] });
    else cmds.push({ op: "say", who: "", text: line });
  }
  for (const c of cmds) {
    for (const t of [c.op === "jump" ? c.args[0] : null, c.op === "if" ? c.rest.split("->")[1].trim() : null, ...(c.options || []).map((o) => o.jump)]) {
      if (t && !(t in labels)) console.error(`story: unknown label "${t}"`);
    }
  }
  return { cmds, labels };
}

function evalCond(expr, vars) {
  if (!/^[\w\s<>=!&|()+-]+$/.test(expr)) throw new Error(`bad condition: ${expr}`);
  const js = expr.replace(/\b([a-z_]+)\b/g, "(V.$1||0)");
  return !!new Function("V", `return (${js});`)(vars);
}

function applySet(str, vars) {
  for (const tok of str.split(/\s+/).filter(Boolean)) {
    const m = tok.match(/^([a-z_]+)(\+|-|=)(-?\d+)$/);
    if (!m) { console.error(`story: bad @set "${tok}"`); continue; }
    const [, k, op, n] = m, v = Number(n);
    vars[k] = op === "=" ? v : (vars[k] || 0) + (op === "+" ? v : -v);
  }
}

// ---------------------------------------------------------------- engine
const POS = { left: 80, center: 160, right: 240 };
const NAME_COLORS = { me: "#c8fbff", cuetip: "#4fa8ff" };

const Game = {
  story: parseStory(STORY),
  st: null,
  global: store.get("cuetip-global", { endings: [], settings: {} }),
  settings: null,
  typing: null, auto: false, skip: false, busy: null, autoTimer: 0,
  view: { bg: "black", prevBg: null, fade: 1, sprites: {}, shake: 0, flash: 0, red: 0, glitch: 0 },
  overlayStack: [],

  init() {
    this.settings = Object.assign({ speed: 45, auto: 1.4, music: 0.6, sfx: 0.8, fx: 1 }, this.global.settings);
    Sound.vol.music = this.settings.music; Sound.vol.sfx = this.settings.sfx;
    this.cv = $("stage"); this.g = this.cv.getContext("2d"); this.g.imageSmoothingEnabled = false;
    this.layout();
    window.addEventListener("resize", () => this.layout());
    this.bindUI();
    this.view.bg = "title";
    requestAnimationFrame((t) => this.frame(t));
    $("ui").style.display = "none";
    // Collection build: the main menu already asked the 18+ question.
    if (store.get("cuetip-18ok", false)) {
      document.addEventListener("pointerdown", () => Sound.unlock(), { once: true });
      document.addEventListener("keydown", () => Sound.unlock(), { once: true });
      this.toTitle();
    } else this.open("warning-screen");
    this.nativeReady();
  },

  newState() {
    return { pc: 0, vars: {}, name: "", aliases: {}, bg: "black", sprites: {}, music: null, amb: null, tint: "none", rain: false, speaker: null, log: [], chapter: "" };
  },

  // ---- layout: landscape overlays the text box on the stage; portrait puts it underneath ----
  layout() {
    const w = window.innerWidth, h = window.innerHeight, portrait = h > w * 1.05;
    document.body.classList.toggle("portrait", portrait);
    document.body.classList.toggle("landscape", !portrait);
    let sw, sh, sx, sy;
    if (portrait) {
      sw = w; sh = Math.round(w * 9 / 16); sx = 0;
      sy = Math.max(0, Math.min(h * 0.12, parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--safe-top")) || 0) + 48);
    } else {
      const s = Math.min(w / 320, h / 180); sw = Math.round(320 * s); sh = Math.round(180 * s); sx = Math.round((w - sw) / 2); sy = Math.round((h - sh) / 2);
    }
    const r = document.documentElement.style;
    r.setProperty("--sx", `${sx}px`); r.setProperty("--sy", `${sy}px`); r.setProperty("--sw", `${sw}px`); r.setProperty("--sh", `${sh}px`);
    const fs = portrait ? Math.max(15, Math.min(20, w * 0.045)) : Math.max(13, Math.min(28, sh * 0.042));
    r.setProperty("--fs", `${fs}px`);
  },

  // ---- overlays ----
  open(id) { $(id).classList.add("show"); this.overlayStack.push(id); },
  close(id) {
    id = id || this.overlayStack[this.overlayStack.length - 1];
    if (!id) return;
    $(id).classList.remove("show");
    this.overlayStack = this.overlayStack.filter((x) => x !== id);
  },
  overlayOpen() { return this.overlayStack.some((id) => id !== "chapter-card"); },

  bindUI() {
    $("warn-ok").onclick = () => { Sound.unlock(); store.set("cuetip-18ok", true); this.close("warning-screen"); this.toTitle(); };
    $("warn-no").onclick = () => { location.href = "../index.html"; };
    $("t-hub").onclick = () => { location.href = "../index.html"; };
    $("t-new").onclick = () => this.newGame();
    $("t-continue").onclick = () => { const s = this.latestSave(); if (s) this.loadState(s.state); };
    $("t-load").onclick = () => this.openSlots("load");
    $("t-endings").onclick = () => this.openEndings();
    $("t-settings").onclick = () => this.openSettings();
    $("t-credits").onclick = () => this.open("credits-screen");
    $("m-save").onclick = () => this.openSlots("save");
    $("m-load").onclick = () => this.openSlots("load");
    $("m-log").onclick = () => this.openLog();
    $("m-settings").onclick = () => this.openSettings();
    $("m-title").onclick = () => { this.close("menu-screen"); this.toTitle(); };
    $("ending-ok").onclick = () => { this.close("ending-screen"); this.toTitle(); };
    $("name-ok").onclick = () => this.submitName();
    $("name-input").addEventListener("keydown", (e) => { if (e.key === "Enter") this.submitName(); });
    document.querySelectorAll("[data-close]").forEach((b) => (b.onclick = () => this.close(b.closest(".screen").id)));
    $("chapter-card").onclick = () => this.finishBusy();
    $("b-pause").onclick = () => this.open("menu-screen");

    $("textbox").addEventListener("click", () => this.advance());
    this.cv.addEventListener("click", () => this.advance());
    $("quick").addEventListener("click", (e) => {
      const act = e.target.dataset && e.target.dataset.act;
      if (!act) return;
      Sound.sfx("select");
      if (act === "log") this.openLog();
      else if (act === "auto") { this.auto = !this.auto; this.skip = false; this.syncQuick(); }
      else if (act === "skip") { this.skip = !this.skip; this.auto = false; this.syncQuick(); }
      else if (act === "save") this.openSlots("save");
      else if (act === "load") this.openSlots("load");
      else if (act === "menu") this.open("menu-screen");
    });
    window.addEventListener("keydown", (e) => {
      Sound.unlock();
      if (e.key === "Escape") { if (this.overlayStack.length && !["title-screen", "warning-screen", "ending-screen"].includes(this.overlayStack.at(-1))) this.close(); else if (this.st && !this.overlayOpen()) this.open("menu-screen"); return; }
      if (this.overlayOpen() || !this.st) return;
      if (Battle.active) { if (Battle.key(e, true)) e.preventDefault(); return; }
      if (e.key === " " || e.key === "Enter") { e.preventDefault(); this.advance(); }
      else if (e.key === "Control") { this.skip = true; this.syncQuick(); }
      else if (/^[1-9]$/.test(e.key)) { const b = $("choices").querySelectorAll("button")[Number(e.key) - 1]; if (b) b.click(); }
    });
    window.addEventListener("keyup", (e) => {
      if (Battle.active) Battle.key(e, false); if (e.key === "Control") { this.skip = false; this.syncQuick(); } });
    $("textbox").addEventListener("wheel", (e) => { if (e.deltaY < 0) this.openLog(); }, { passive: true });
    document.addEventListener("visibilitychange", () => { if (document.hidden && this.st) this.autosave(); });

    const bindRange = (id, key, after) => {
      const el = $(id); el.value = this.settings[key];
      el.oninput = () => { this.settings[key] = Number(el.value); after && after(); this.saveGlobal(); };
    };
    bindRange("s-speed", "speed");
    bindRange("s-auto", "auto");
    bindRange("s-music", "music", () => { Sound.vol.music = this.settings.music; Sound.applyVolume(); });
    bindRange("s-sfx", "sfx", () => { Sound.vol.sfx = this.settings.sfx; Sound.applyVolume(); Sound.sfx("select"); });
    $("s-fx").value = String(this.settings.fx);
    $("s-fx").onchange = () => { this.settings.fx = Number($("s-fx").value); this.saveGlobal(); };
  },

  syncQuick() {
    document.querySelector('[data-act="auto"]').classList.toggle("on", this.auto);
    document.querySelector('[data-act="skip"]').classList.toggle("on", this.skip);
  },

  saveGlobal() { this.global.settings = this.settings; store.set("cuetip-global", this.global); },

  // ---- flow ----
  endBattle() {
    if (!Battle.active) return;
    Battle.active = false;
    $("battle-ui").classList.remove("show");
  },

  toTitle() {
    this.endBattle();
    this.st = null; this.auto = this.skip = false; this.syncQuick();
    this.busy = null; this.typing = null;
    $("ui").style.display = "none";
    this.view.bg = "title"; this.view.prevBg = null; this.view.sprites = {};
    Sound.playMusic("lull"); Sound.playAmb("train");
    $("t-continue").disabled = !this.latestSave();
    this.open("title-screen");
  },

  newGame() {
    Sound.unlock(); Sound.sfx("select");
    this.endBattle();
    for (const id of [...this.overlayStack]) this.close(id);
    this.st = this.newState();
    this.busy = null; this.typing = null; this.auto = this.skip = false; this.syncQuick();
    $("choices").style.display = "none";
    this.view.sprites = {};
    this.updateShards();
    $("ui").style.display = "";
    this.run();
  },

  loadState(state) {
    Sound.unlock();
    this.endBattle();
    for (const id of [...this.overlayStack]) this.close(id);
    this.st = JSON.parse(JSON.stringify(state));
    this.busy = null; this.typing = null;
    $("ui").style.display = "";
    this.view.bg = this.st.bg; this.view.prevBg = null; this.view.fade = 1;
    this.view.sprites = {};
    for (const [who, s] of Object.entries(this.st.sprites)) this.view.sprites[who] = { x: POS[s.pos], alpha: 1, target: 1 };
    Sound.playMusic(this.st.music); Sound.playAmb(this.st.amb);
    this.updateShards();
    this.run();
  },

  // Run commands until one needs the player
  run() {
    const { cmds, labels } = this.story;
    for (let guard = 0; guard < 10000; guard++) {
      if (!this.st) return;
      const c = cmds[this.st.pc];
      if (!c) { this.toTitle(); return; }
      const a = c.args || [];
      switch (c.op) {
        case "say": return this.say(c.who, c.text);
        case "choice": return this.choice(c.options);
        case "bg":
          this.view.prevBg = this.view.bg; this.view.bg = a[0]; this.view.fade = a[1] === "cut" || this.skip ? 1 : 0;
          this.st.bg = a[0]; break;
        case "show": {
          const [who, face = "neutral", pos = "center"] = a;
          const had = this.st.sprites[who];
          this.st.sprites[who] = { face, pos };
          const v = this.view.sprites[who];
          if (!v || !had) this.view.sprites[who] = { x: POS[pos], alpha: 0, target: 1 };
          else v.target = 1;
          break;
        }
        case "face": if (this.st.sprites[a[0]]) this.st.sprites[a[0]].face = a[1]; break;
        case "hide":
          for (const who of a[0] === "all" ? Object.keys(this.st.sprites) : [a[0]]) {
            delete this.st.sprites[who];
            if (this.view.sprites[who]) this.view.sprites[who].target = 0;
          }
          break;
        case "music": this.st.music = a[0] === "stop" ? null : a[0]; Sound.playMusic(this.st.music); break;
        case "amb": this.st.amb = a[0] === "stop" ? null : a[0]; Sound.playAmb(this.st.amb); break;
        case "sfx": if (!this.skip) Sound.sfx(a[0]); break;
        case "fx": if (!this.skip) this.fx(a[0]); break;
        case "tint": this.st.tint = a[0]; break;
        case "rain": this.st.rain = a[0] === "on"; break;
        case "set": applySet(c.rest, this.st.vars); break;
        case "jump": this.st.pc = labels[a[0]]; continue;
        case "if": {
          const [expr, target] = c.rest.split("->");
          if (evalCond(expr.trim(), this.st.vars)) { this.st.pc = labels[target.trim()]; continue; }
          break;
        }
        case "alias": this.st.aliases[a[0]] = c.rest.slice(a[0].length + 1); break;
        case "shard":
          this.st.vars.shards = (this.st.vars.shards || 0) + 1;
          this.updateShards(true);
          if (!this.skip) { Sound.sfx("shard"); this.fx("flash", 0.35); }
          try { if (window.Capacitor && Capacitor.Plugins.Haptics) Capacitor.Plugins.Haptics.impact({ style: "MEDIUM" }); } catch (e) {}
          break;
        case "wait":
          if (this.skip) break;
          this.busy = { kind: "wait", until: performance.now() + Number(a[0]) * 1000 };
          this.hideText();
          return;
        case "input": return this.askName();
        case "battle": return this.startBattle(a[0]);
        case "learn": if (!this.skip) { this.toast(`New technique: ${c.rest}`); Sound.sfx("shard"); } break;
        case "clue":
          this.st.vars.clues = (this.st.vars.clues || 0) + 1;
          this.updateShards();
          if (!this.skip) { this.toast(`Secret clue ${this.st.vars.clues} of 3 found`); Sound.sfx("glass"); }
          break;
        case "chapter": return this.chapter(c.rest);
        case "end": return this.ending(a[0]);
        default: console.error("story: unknown op", c.op);
      }
      this.st.pc++;
    }
  },

  startBattle(id) {
    this.busy = { kind: "battle" };
    this.typing = null;
    $("ui").style.display = "none";
    if (this.skip) { this.skip = false; this.syncQuick(); }
    Battle.start(id, this.st.vars, false, (result) => {
      $("ui").style.display = "";
      Sound.playMusic(this.st.music);
      this.busy = null;
      this.next();
      this.autosave();
    });
  },

  toast(text) {
    const el = $("toast");
    el.textContent = text;
    el.classList.remove("show"); void el.offsetWidth; el.classList.add("show");
  },

  next() { if (!this.st) return; this.st.pc++; this.busy = null; this.run(); },

  // ---- text ----
  interp(text) {
    const esc = (s) => s.replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));
    return esc(text.replace(/\{name\}/g, this.st.name || "you"));
  },

  say(who, text) {
    const st = this.st;
    st.speaker = who && who !== "me" ? who : null;
    const plate = $("nameplate");
    if (who) {
      const name = who === "me" ? (st.name || "You") : st.aliases[who] || (CAST[who] ? CAST[who].name : "Cuetip");
      plate.textContent = name;
      plate.style.color = NAME_COLORS[who] || (CAST[who] && CAST[who].color) || "#fff";
      plate.style.display = "block";
    } else plate.style.display = "none";
    if (who === "cuetip" && !this.skip) Sound.sfx("cuetip");
    const plain = this.interp(text);
    // wrap every visible character so the typewriter can reveal them without reflowing
    let html = "", count = 0, em = false;
    for (const ch of plain.replace(/&[a-z]+;/g, (e) => `\u0000${e}\u0001`).split(/(\u0000[^\u0001]*\u0001)/)) {
      if (ch.startsWith("\u0000")) { html += `<span class="c">${ch.slice(1, -1)}</span>`; count++; continue; }
      for (const c of ch) {
        if (c === "*") { html += em ? "</em>" : "<em>"; em = !em; continue; }
        html += `<span class="c">${c}</span>`; count++;
      }
    }
    if (em) html += "</em>";
    const box = $("text");
    box.innerHTML = html;
    box.className = who ? "" : "narration";
    $("textbox").style.visibility = "visible";
    $("next").style.display = "none";
    $("choices").style.display = "none";
    const spans = box.querySelectorAll(".c");
    this.typing = { spans, shown: 0, acc: 0, done: false, voiced: !!who };
    if (this.skip || this.settings.speed >= 120) this.completeText();
    st.log.push({ who: who ? plate.textContent : "", color: plate.style.color, text: plain.replace(/\*/g, "") });
    if (st.log.length > 200) st.log.shift();
    this.autoTimer = 0;
  },

  completeText() {
    const t = this.typing;
    if (!t) return;
    t.spans.forEach((s) => s.classList.add("on"));
    t.shown = t.spans.length; t.done = true;
    $("next").style.display = "block";
  },

  hideText() { $("textbox").style.visibility = "hidden"; },

  advance() {
    Sound.unlock();
    if (!this.st || this.overlayOpen()) return;
    if (this.busy) { if (this.busy.kind === "chapter") this.finishBusy(); return; }
    if (this.typing && !this.typing.done) { this.completeText(); return; }
    if (this.typing && this.typing.done) { this.typing = null; this.next(); }
  },

  // ---- choices ----
  choice(options) {
    const box = $("choices");
    box.innerHTML = "";
    $("next").style.display = "none";
    if (this.skip) { this.skip = false; this.syncQuick(); }
    const shown = options.filter((o) => !o.cond || evalCond(o.cond, this.st.vars));
    shown.forEach((o) => {
      const b = document.createElement("button");
      b.innerHTML = this.interp(o.text).replace(/\*([^*]+)\*/g, "<em>$1</em>");
      b.onclick = (e) => {
        e.stopPropagation();
        Sound.sfx("select");
        box.style.display = "none";
        if (o.effects) applySet(o.effects, this.st.vars);
        this.st.log.push({ who: "", choice: true, text: `> ${this.interp(o.text)}` });
        if (o.jump) { this.st.pc = this.story.labels[o.jump]; this.run(); } else this.next();
        this.autosave();
      };
      box.appendChild(b);
    });
    box.style.display = "flex";
    this.busy = { kind: "choice" };
    const first = box.querySelector("button");
    if (first && matchMedia("(hover: hover)").matches) first.focus({ preventScroll: true });
  },

  // ---- name input ----
  askName() {
    this.busy = { kind: "input" };
    this.hideText();
    $("name-input").value = this.st.name || "";
    this.open("name-screen");
    setTimeout(() => $("name-input").focus(), 50);
  },
  submitName() {
    const v = $("name-input").value.trim().replace(/[<>{}*]/g, "").slice(0, 14);
    if (!v) { $("name-input").focus(); return; }
    this.st.name = v;
    Sound.sfx("select");
    this.close("name-screen");
    this.busy = null;
    this.next();
  },

  // ---- chapter cards and endings ----
  chapter(rest) {
    const [title, sub = ""] = rest.split("|");
    this.st.chapter = title;
    $("chapter-title").textContent = title; $("chapter-sub").textContent = sub;
    this.hideText();
    this.open("chapter-card");
    this.busy = { kind: "chapter", until: performance.now() + (this.skip ? 300 : 2600) };
    this.autosave(1);
  },

  finishBusy() {
    if (!this.busy) return;
    const kind = this.busy.kind;
    if (kind === "chapter") this.close("chapter-card");
    if (kind === "chapter" || kind === "wait") { this.busy = null; this.next(); }
  },

  ending(id) {
    const e = ENDINGS[id];
    this.busy = { kind: "end" };
    this.hideText();
    if (!this.global.endings.includes(id)) this.global.endings.push(id);
    this.saveGlobal();
    $("ending-kind").textContent = e.kind.toUpperCase();
    $("ending-title").textContent = e.title;
    $("ending-count").textContent = `Endings found: ${this.global.endings.length} / ${Object.keys(ENDINGS).length}`;
    this.auto = this.skip = false; this.syncQuick();
    setTimeout(() => this.open("ending-screen"), this.skip ? 0 : 1200);
  },

  openEndings() {
    const list = $("ending-list");
    list.innerHTML = "";
    for (const [id, e] of Object.entries(ENDINGS)) {
      const got = this.global.endings.includes(id), d = document.createElement("div");
      d.className = "ending" + (got ? " got" : "");
      d.innerHTML = got ? `<b>${e.title}</b><br><span>${e.kind}</span>` : `<b>???</b><br><span>Hint: ${e.hint}</span>`;
      list.appendChild(d);
    }
    this.open("endings-screen");
  },

  openLog() {
    if (!this.st) return;
    const list = $("log-list");
    list.innerHTML = "";
    for (const l of this.st.log) {
      const d = document.createElement("div");
      if (l.choice) d.className = "choice";
      d.innerHTML = (l.who ? `<b style="color:${l.color}">${l.who}</b>` : "") + l.text;
      list.appendChild(d);
    }
    this.open("log-screen");
    list.parentElement.scrollTop = list.parentElement.scrollHeight;
  },

  openSettings() { this.open("settings-screen"); },

  // ---- saves ----
  SLOTS: ["auto", "1", "2", "3", "4", "5", "6"],
  snapshot() {
    const last = [...this.st.log].reverse().find((l) => !l.choice);
    return { state: JSON.parse(JSON.stringify(this.st)), time: Date.now(), chapter: this.st.chapter || "Prologue", preview: last ? last.text.slice(0, 70) : "" };
  },
  autosave() { if (this.st && !(this.busy && this.busy.kind === "end")) store.set("cuetip-save-auto", this.snapshot()); },
  latestSave() {
    return this.SLOTS.map((s) => store.get(`cuetip-save-${s}`, null)).filter(Boolean).sort((a, b) => b.time - a.time)[0] || null;
  },
  openSlots(mode) {
    $("slots-h").textContent = mode === "save" ? "Save" : "Load";
    const list = $("slot-list");
    list.innerHTML = "";
    for (const slot of this.SLOTS) {
      if (mode === "save" && slot === "auto") continue;
      const data = store.get(`cuetip-save-${slot}`, null), b = document.createElement("button");
      b.className = "slot";
      const label = slot === "auto" ? "Autosave" : `Slot ${slot}`;
      b.innerHTML = data
        ? `<b>${label} · ${data.chapter}</b><span>${new Date(data.time).toLocaleString()}</span><span>${data.preview}</span>`
        : `<b>${label}</b><span>Empty</span>`;
      b.disabled = mode === "load" && !data;
      b.onclick = () => {
        Sound.sfx("select");
        if (mode === "save") { if (!this.st) return; store.set(`cuetip-save-${slot}`, this.snapshot()); this.openSlots("save"); this.close("slots-screen"); }
        else if (data) this.loadState(data.state);
      };
      list.appendChild(b);
    }
    if (!this.overlayStack.includes("slots-screen")) this.open("slots-screen");
  },

  // ---- effects ----
  fx(kind, amount) {
    if (!this.settings.fx && kind !== "red") return;
    if (kind === "shake") this.view.shake = 0.5;
    else if (kind === "flash") this.view.flash = amount || 0.8;
    else if (kind === "red") this.view.red = 1.2;
    else if (kind === "glitch") this.view.glitch = 0.6;
  },

  updateShards(pulse) {
    const n = this.st ? this.st.vars.clues || 0 : 0;
    document.querySelectorAll(".shard").forEach((el, i) => el.classList.toggle("on", i < n));
  },

  // ---- render loop ----
  frame(now) {
    const t = now / 1000, dt = Math.min(0.05, t - (this.lastT || t));
    this.lastT = t;
    if (Battle.active) {
      Battle.paused = this.overlayOpen();
      Battle.update(dt);
      Battle.draw(this.g, t);
    } else {
      this.tick(dt, now);
      this.draw(t, dt);
    }
    requestAnimationFrame((n) => this.frame(n));
  },

  tick(dt, now) {
    const ty = this.typing;
    if (ty && !ty.done && !this.overlayOpen()) {
      ty.acc += dt * this.settings.speed;
      while (ty.acc >= 1 && ty.shown < ty.spans.length) {
        ty.spans[ty.shown++].classList.add("on"); ty.acc -= 1;
        if (ty.voiced && ty.shown % 3 === 0) Sound.sfx("blip");
      }
      if (ty.shown >= ty.spans.length) this.completeText();
    }
    if (this.busy && (this.busy.kind === "wait" || this.busy.kind === "chapter") && now >= this.busy.until) this.finishBusy();
    if (this.st && !this.overlayOpen() && !this.busy && ty && ty.done) {
      if (this.skip) { this.typing = null; this.next(); }
      else if (this.auto) {
        this.autoTimer += dt;
        if (this.autoTimer > this.settings.auto + ty.spans.length * 0.025) { this.typing = null; this.next(); }
      }
    }
  },

  draw(t, dt) {
    const g = this.g, v = this.view, st = this.st;
    g.save();
    if (v.shake > 0) { v.shake -= dt; g.translate(Math.round(Math.random() * 4 - 2), Math.round(Math.random() * 3 - 1.5)); }
    // background with crossfade
    v.fade = Math.min(1, v.fade + dt * 1.8);
    if (v.prevBg && v.fade < 1) { this.drawBg(v.prevBg, t); g.globalAlpha = v.fade; }
    this.drawBg(v.bg, t);
    g.globalAlpha = 1;
    // characters
    const speaker = st && st.speaker;
    for (const [who, sv] of Object.entries(v.sprites)) {
      const s = st && st.sprites[who];
      if (s) sv.x += (POS[s.pos] - sv.x) * Math.min(1, dt * 8);
      sv.alpha += (sv.target - sv.alpha) * Math.min(1, dt * 7);
      if (sv.target === 0 && sv.alpha < 0.02) { delete v.sprites[who]; continue; }
      const face = s ? s.face : sv.face || "neutral";
      sv.face = face;
      sv.blinkAt = sv.blinkAt || t + 2 + Math.random() * 3;
      const blink = t > sv.blinkAt && t < sv.blinkAt + 0.13;
      if (t > sv.blinkAt + 0.13) sv.blinkAt = t + 2 + Math.random() * 4;
      const dim = speaker && speaker !== who;
      const img = SpriteCache.get(who, face, blink, dim, who === "cuetip" ? (st ? (st.vars.hs || 0) / 100 : 0) : 0);
      const bob = Math.round(Math.sin(t * 1.6 + sv.x) * 0.6);
      g.globalAlpha = Math.max(0, Math.min(1, sv.alpha));
      g.drawImage(img, Math.round(sv.x - img.width / 2), 22 + bob);
      g.globalAlpha = 1;
    }
    // weather and grading
    if (st && st.rain) this.drawRain(t);
    if (st && st.tint === "memory") { g.fillStyle = "rgba(255,190,120,0.12)"; g.fillRect(0, 0, 320, 180); this.drawGrain(t); }
    if (st && st.tint === "red") { g.fillStyle = "rgba(170,10,25,0.22)"; g.fillRect(0, 0, 320, 180); }
    if (v.red > 0) { v.red -= dt; g.fillStyle = `rgba(200,0,20,${Math.min(0.5, v.red * 0.4)})`; g.fillRect(0, 0, 320, 180); }
    this.drawVignette();
    if (v.flash > 0) { v.flash -= dt * 1.6; g.fillStyle = `rgba(240,250,255,${Math.max(0, v.flash)})`; g.fillRect(0, 0, 320, 180); }
    g.restore();
  },

  drawBg(key, t) {
    const b = BACKGROUNDS[key] ? key : "black";
    this.g.drawImage(BgCache.get(b), 0, 0);
    BACKGROUNDS[b].draw(this.g, t);
  },

  drawRain(t) {
    const g = this.g;
    g.fillStyle = "rgba(170,190,230,0.45)";
    for (let i = 0; i < 90; i++) {
      const x = (i * 53 + t * 40) % 330 - 5, y = (i * 97 + t * 260) % 190 - 10;
      g.fillRect(Math.round(x), Math.round(y), 1, 4);
    }
  },

  drawGrain(t) {
    const g = this.g, seed = Math.floor(t * 12);
    g.fillStyle = "rgba(255,255,255,0.05)";
    for (let i = 0; i < 60; i++) g.fillRect((i * 131 + seed * 71) % 320, (i * 61 + seed * 37) % 180, 1, 1);
  },

  drawVignette() {
    if (!this.vignette) {
      const c = Px.canvas(320, 180), g = c.getContext("2d");
      const grd = g.createRadialGradient(160, 90, 60, 160, 90, 200);
      grd.addColorStop(0, "rgba(0,0,0,0)"); grd.addColorStop(1, "rgba(0,0,0,0.55)");
      g.fillStyle = grd; g.fillRect(0, 0, 320, 180);
      this.vignette = c;
    }
    this.g.drawImage(this.vignette, 0, 0);
  },

  nativeReady() {
    const p = window.Capacitor && window.Capacitor.Plugins;
    if (!p) return;
    try { p.StatusBar && p.StatusBar.hide(); } catch (e) {}
    try { p.SplashScreen && p.SplashScreen.hide(); } catch (e) {}
    try {
      p.App && p.App.addListener("backButton", () => {
        if (Battle.active && !this.overlayStack.length) { this.open("menu-screen"); return; }
        if (this.overlayStack.length && !["title-screen", "warning-screen"].includes(this.overlayStack.at(-1))) this.close();
        else if (this.st) this.open("menu-screen");
        else p.App.exitApp();
      });
    } catch (e) {}
  },
};

window.Game = Game;
Game.init();
