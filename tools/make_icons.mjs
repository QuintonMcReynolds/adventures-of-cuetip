// Renders the app icon with the game's own pixel-art code (www/art.js) and saves every size.
// Run: npm run icons
import { chromium } from "playwright-core";
import { writeFile, mkdir } from "fs/promises";
import { pathToFileURL } from "url";

const page = await (await chromium.launch({ channel: "chrome" })).newPage();
await page.goto(pathToFileURL(new URL("../www/index.html", import.meta.url).pathname).href);
await page.waitForFunction(() => window.Game);
const out = await page.evaluate(() => {
  const icon = (pad) => {
    const c = Px.canvas(96, 96), g = c.getContext("2d");
    g.drawImage(BgCache.get("startree"), 112, 14, 96, 96, 0, 0, 96, 96);
    const cue = SpriteCache.get("cuetip", "smile", false, false, 0);
    g.drawImage(cue, 4, 10, 96, 96, 0, 8, 96, 96);
    const size = 1024, big = Px.canvas(size, size), bg = big.getContext("2d");
    bg.imageSmoothingEnabled = false;
    bg.fillStyle = "#07040f"; bg.fillRect(0, 0, size, size);
    const inner = Math.round(size * (1 - pad * 2));
    bg.drawImage(c, (size - inner) / 2, (size - inner) / 2, inner, inner);
    return big;
  };
  const scaled = (src, n) => { const c = Px.canvas(n, n), g = c.getContext("2d"); g.imageSmoothingEnabled = n < src.width; g.drawImage(src, 0, 0, n, n); return c.toDataURL("image/png"); };
  const full = icon(0), mask = icon(0.12);
  const sp = Px.canvas(2732, 2732), sg = sp.getContext("2d");
  sg.imageSmoothingEnabled = false; sg.fillStyle = "#07040f"; sg.fillRect(0, 0, 2732, 2732);
  sg.drawImage(full, 1366 - 320, 1366 - 320, 640, 640);
  const bgf = Px.canvas(1024, 1024), bgg = bgf.getContext("2d"); bgg.fillStyle = "#07040f"; bgg.fillRect(0, 0, 1024, 1024);
  return { bgfill: bgf.toDataURL("image/png"), splash: sp.toDataURL("image/png"), 1024: scaled(full, 1024), 512: scaled(full, 512), 256: scaled(full, 256), 192: scaled(full, 192), 180: scaled(full, 180), mask: scaled(mask, 512), maskfg: scaled(icon(0.22), 1024) };
});
const save = (p, d) => writeFile(p, Buffer.from(d.split(",")[1], "base64"));
await mkdir("www/icons", { recursive: true }); await mkdir("assets", { recursive: true }); await mkdir("electron", { recursive: true });
await save("www/icons/icon-512.png", out[512]);
await save("www/icons/icon-192.png", out[192]);
await save("www/icons/apple-touch-icon.png", out[180]);
await save("www/icons/icon-maskable-512.png", out.mask);
await save("assets/icon-only.png", out[1024]);
await save("assets/icon-foreground.png", out.maskfg);
await save("electron/icon.png", out[256]);
await save("assets/splash.png", out.splash);
await save("assets/splash-dark.png", out.splash);
await save("assets/icon-background.png", out.bgfill);
console.log("icons written");
process.exit(0);
