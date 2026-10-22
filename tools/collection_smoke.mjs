// Smoke test for the collection: main menu -> 18+ gate -> Soul Searching platformer + Last Stand (Godot web).
// Serves www/ over http (Godot's .wasm can't load from file://) and drives Chrome.
//   node tools/collection_smoke.mjs   (screenshots in tools/shots/)
import { createRequire } from "module";
import http from "http";
import { readFile, mkdir } from "fs/promises";
import path from "path";

const require = createRequire(`${process.env.HOME}/adventures-of-cuetip/node_modules/`);
const { chromium } = require("playwright-core");
const root = new URL("../www/", import.meta.url).pathname;
const shots = new URL("./shots/", import.meta.url).pathname;
await mkdir(shots, { recursive: true });
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".wasm": "application/wasm", ".png": "image/png", ".ttf": "font/ttf", ".pck": "application/octet-stream", ".json": "application/json", ".webmanifest": "application/manifest+json" };
const server = http.createServer(async (req, res) => {
  let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (p.endsWith("/")) p += "index.html";
  try { const b = await readFile(path.join(root, p)); res.writeHead(200, { "Content-Type": TYPES[path.extname(p)] || "application/octet-stream" }); res.end(b); }
  catch { res.writeHead(404); res.end(); }
}).listen(0);
const base = `http://127.0.0.1:${server.address().port}/`;

const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
const shot = (n) => page.screenshot({ path: `${shots}${n}.png` });
const wait = (ms) => page.waitForTimeout(ms);

await page.goto(base);
await wait(500); await shot("01_gate");
await page.click("#gate-ok"); await wait(300); await shot("02_menu");

await page.click('a[href*="mode=platformer"]');
await page.waitForSelector("canvas", { timeout: 20000 });
await wait(9000); await shot("03a_platformer_title");
await page.goto(base);
await page.click('a[href*="mode=laststand"]');
await page.waitForSelector("canvas", { timeout: 20000 });
await wait(9000); await shot("03_laststand_title");
// Godot draws its own UI: click "Campaign" (title buttons sit right of centre)
const box = await page.locator("canvas").boundingBox();
const at = (x, y) => page.mouse.click(box.x + box.width * x, box.y + box.height * y);
await at(0.62, 0.453); await wait(800); await shot("04_campaign_map");
await at(0.118, 0.672); await wait(800); await shot("05_select");
await at(0.229, 0.402); await wait(800); await shot("06_story");

console.log(errors.length ? "PAGE ERRORS:\n" + errors.join("\n") : "no page errors");
await browser.close(); server.close();
