// Plays Adventures of Cuetip, Vol. 2 start to finish in Chrome. A bot fights every battle with the real
// controls (strike, parry, dash, heavy, focus, ward, together, shots). Saves screenshots to test-results/.
// Run: npm test
import { chromium } from "playwright-core";
import { createServer } from "http";
import { readFile, mkdir } from "fs/promises";
import { extname, join } from "path";

const ROOT = new URL("../www/vol2/", import.meta.url).pathname;
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".png": "image/png", ".ttf": "font/ttf", ".webmanifest": "application/manifest+json" };
const server = createServer(async (req, res) => {
  const p = join(ROOT, decodeURIComponent(req.url.split("?")[0]).replace(/\/$/, "/index.html"));
  let body;
  try { body = await readFile(p); } catch { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { "content-type": TYPES[extname(p)] || "application/octet-stream" }); res.end(body);
}).listen(0);
const url = `http://localhost:${server.address().port}/`;
await mkdir("test-results", { recursive: true });

const browser = await chromium.launch({ channel: "chrome", headless: true });
const errors = [];
let failed = false;
const check = (ok, msg) => { console.log(`${ok ? "PASS" : "FAIL"}  ${msg}`); if (!ok) failed = true; };

// Runs inside the page: one bot decision per frame
const BOT = () => {
  window.botStep = () => {
    const B = Battle, p = B.p, e = B.e;
    if (e.state === "windup" && e.move) {
      const win = B.cfg.parryWindow || 0.24;
      if (e.move.unblockable) { if (e.timer <= 0.15 && p.cd.dash <= 0) { if (p.charging) B.release("heavy"); if (p.guarding) B.release("guard"); B.press("dash"); } }
      else if (e.move.reflectable && B.unlocked("ward") && p.cd.ward <= 0 && e.timer <= 0.3) B.press("ward");
      else if (e.move.interruptible && B.unlocked("dash") && p.cd.dash <= 0 && !p.charging) B.press("dash");
      else if (e.timer <= win * 0.6 && B.unlocked("guard") && !p.guarding) B.press("guard");
    } else if (p.guarding) B.release("guard");
    if (B.unlocked("together") && p.bond >= 100) B.press("together");
    if (e.state === "guard" && B.unlocked("heavy") && !p.charging && p.cd.heavy <= 0) B.press("heavy");
    if (p.charging && B.t - p.charging.at > 0.65) B.release("heavy");
    if (p.hs > 65 && p.shots > 0) B.press("shot");
    if (B.unlocked("focus") && p.cd.focus <= 0 && (p.hp < 60 || B.id === "moss") && e.state !== "windup") B.press("focus");
    if (e.state !== "guard" && !p.charging && !p.guarding) B.press("strike");
  };
  window.botFight = (frames = 60 * 150) => {
    for (let i = 0; i < frames && !Battle.result; i++) { botStep(); Battle.update(1 / 60); }
    return { id: Battle.id, result: Battle.result, t: Math.round(Battle.t), hp: Math.round(Battle.p.hp), hs: Math.round(Battle.p.hs), shots: Battle.p.shots };
  };
};

async function advanceUntil(page, cond, max = 3000, arg) {
  for (let i = 0; i < max; i++) {
    const done = await page.evaluate(cond, arg);
    if (done) return true;
    await page.evaluate(() => {
      const G = Game;
      if (Battle.active) return;
      if (G.busy && (G.busy.kind === "chapter" || G.busy.kind === "wait")) { G.finishBusy(); return; }
      const btns = document.querySelectorAll("#choices button");
      if (document.getElementById("choices").style.display === "flex" && btns.length) { btns[0].click(); return; }
      if (G.typing) { G.completeText(); G.typing = null; G.next(); }
    });
  }
  return false;
}

for (const vp of [{ name: "desktop", width: 1280, height: 720 }, { name: "phone", width: 390, height: 844, mobile: true }]) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 2, hasTouch: !!vp.mobile, isMobile: !!vp.mobile });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(`${vp.name}: ${e.message}`));
  page.on("console", (m) => { if (m.type() === "error") errors.push(`${vp.name}: ${m.text()}`); });
  await page.goto(url);
  await page.waitForFunction(() => window.Game && document.fonts.status === "loaded");
  await page.evaluate(BOT);
  await page.click("#warn-ok");
  await page.waitForTimeout(400);
  await page.screenshot({ path: `test-results/${vp.name}-01-title.png` });
  await page.click("#t-new");

  // Anniversary: she gives him the braid
  await advanceUntil(page, () => Game.st.vars.braid && Game.st.speaker === "bride");
  await page.evaluate(() => Game.completeText()); await page.waitForTimeout(600);
  await page.screenshot({ path: `test-results/${vp.name}-02-home.png` });

  const results = [];
  let shotTaken = false;
  for (let n = 0; n < 12; n++) {
    const reached = await advanceUntil(page, () => Battle.active || (Game.busy && Game.busy.kind === "end"));
    if (!reached) break;
    if (await page.evaluate(() => Game.busy && Game.busy.kind === "end")) break;
    const id = await page.evaluate(() => Battle.id);
    // take a live screenshot a few seconds into some fights
    if (["rook", "knights", "final"].includes(id) && !(vp.name === "phone" && id !== "final")) {
      await page.evaluate(() => { for (let i = 0; i < 60 * 3; i++) { botStep(); Battle.update(1 / 60); } Battle.tipTimer && clearTimeout(Battle.tipTimer); });
      await page.waitForTimeout(250);
      await page.screenshot({ path: `test-results/${vp.name}-battle-${id}.png` });
    }
    const r = await page.evaluate(() => botFight());
    if (r.id === "thistle") shotTaken = true;
    results.push(r);
    check(r.result === "win", `${vp.name}: battle "${r.id}" won by bot (${r.t}s, hp ${r.hp}, hs ${r.hs}, shots left ${r.shots})`);
    if (r.id === "final") { await page.waitForTimeout(200); await page.screenshot({ path: `test-results/${vp.name}-battle-result.png` }); }
    await page.evaluate(() => Battle.end(Battle.result === "win" ? "win" : "skip"));
    // story screenshots between fights
    const shot = { hounds: ["nightshade", "03-nightshade"], rook: ["pip", "04-pip"], knights: ["quill", "05-quill"] }[id];
    if (shot) {
      await advanceUntil(page, (who) => Game.st.speaker === who, 3000, shot[0]);
      await page.evaluate(() => Game.completeText()); await page.waitForTimeout(600);
      await page.screenshot({ path: `test-results/${vp.name}-${shot[1]}.png` });
    }
  }
  check(results.length === 9, `${vp.name}: all 9 battles reached (${results.map((r) => r.id).join(", ")})`);
  check(shotTaken, `${vp.name}: Thistledown battle reached`);
  check(await page.evaluate(() => Game.st.vars.clues === 3 && Game.st.vars.ward === 1 && Game.st.vars.together === 1), `${vp.name}: 3 star seeds, Ward and Together all earned`);

  // Homecoming, then the ending
  await advanceUntil(page, () => Game.st.sprites.bride && Game.st.sprites.bride.face === "reach");
  await page.evaluate(() => Game.completeText()); await page.waitForTimeout(600);
  await page.screenshot({ path: `test-results/${vp.name}-06-homecoming.png` });
  const ended = await advanceUntil(page, () => Game.busy && Game.busy.kind === "end");
  check(ended && (await page.evaluate(() => Game.global.endings.includes("home"))), `${vp.name}: reached "Home"`);
  await page.waitForTimeout(1400);
  await page.screenshot({ path: `test-results/${vp.name}-07-ending.png` });

  // The bad ending: give in to Nightshade at the Moon Throne
  await page.evaluate(() => { Game.close("ending-screen"); Game.newGame(); Game.st.pc = Game.story.labels.throne; Game.busy = null; Game.typing = null; Game.run(); });
  await advanceUntil(page, () => document.getElementById("choices").style.display === "flex");
  await page.evaluate(() => document.querySelectorAll("#choices button")[1].click());
  await advanceUntil(page, () => document.getElementById("choices").style.display === "flex");
  await page.evaluate(() => document.querySelectorAll("#choices button")[1].click());
  const bad = await advanceUntil(page, () => Game.busy && Game.busy.kind === "end");
  check(bad && (await page.evaluate(() => Game.global.endings.includes("thorned"))), `${vp.name}: bad ending "The Easy Way" reachable`);
  await page.evaluate(() => Game.close("ending-screen"));

  // Mechanics: ward reflects a bolt, a snare goes through guard, together calls a friend
  const mech = await page.evaluate(() => {
    const out = {};
    Battle.start("bloom", { guard: 1, ward: 1, together: 1 }, false, () => {});
    const e = Battle.e, hp0 = e.hp;
    Battle.press("ward"); e.state = "windup"; e.move = { ...ATTACKS.bolt, key: "bolt", hitsLeft: 1 }; e.timer = 0;
    for (let i = 0; i < 20; i++) Battle.update(1 / 60);
    out.reflect = Battle.ev.reflect === 1 && e.hp < hp0;
    Battle.p.cd.dash = 0; Battle.press("guard"); Battle.p.guardAt = Battle.t; const php = Battle.p.hp;
    e.state = "windup"; e.move = { ...ATTACKS.snare, key: "snare", hitsLeft: 1 }; e.timer = 0; Battle.update(1 / 60);
    out.snare = Battle.p.hp < php;
    Battle.release("guard"); Battle.p.lock = 0; Battle.p.bond = 100; const ehp = e.hp; e.state = "idle"; e.timer = 9;
    Battle.press("together"); for (let i = 0; i < 60; i++) Battle.update(1 / 60);
    out.together = Battle.p.bond === 0 && e.hp < ehp;
    Battle.end("skip");
    return out;
  });
  check(mech.reflect, `${vp.name}: WARD reflects a curse bolt`);
  check(mech.snare, `${vp.name}: thorn SNARE goes through guard`);
  check(mech.together, `${vp.name}: TOGETHER calls a friend in`);

  // A losing fight offers retry / easier / skip
  await page.evaluate(() => { Battle.start("quill", { guard: 1 }, false, () => {}); Battle.p.hp = 1; Battle.p.hs = 0; Battle.e.state = "windup"; Battle.e.move = { ...ATTACKS.slam, key: "slam", hitsLeft: 1 }; Battle.e.timer = 0; Battle.update(1 / 60); });
  const lose = await page.evaluate(() => [...document.querySelectorAll("#b-result-btns button")].map((b) => b.textContent));
  check(lose.join("|") === "Retry|Retry (easier)|Skip fight", `${vp.name}: losing offers ${lose.join(" / ")}`);
  await page.evaluate(() => Battle.end("skip"));
  await ctx.close();
}

check(errors.length === 0, `no page errors${errors.length ? ": " + errors.slice(0, 5).join(" | ") : ""}`);
await browser.close();
server.close();
process.exit(failed ? 1 : 0);
