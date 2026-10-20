// Launches the desktop (Electron) build and checks the main menu and Last Stand load.
//   node tools/electron_smoke.mjs
import { createRequire } from "module";
const require = createRequire(`${process.env.HOME}/adventures-of-cuetip/node_modules/`);
const { _electron } = require("playwright-core");
const app = await _electron.launch({
  executablePath: `${process.env.HOME}/adventures-of-cuetip/node_modules/electron/dist/Electron.app/Contents/MacOS/Electron`,
  args: [new URL("..", import.meta.url).pathname],
});
const win = await app.firstWindow();
const errors = [];
win.on("pageerror", (e) => errors.push(e.message));
win.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
await win.waitForTimeout(800);
console.log("menu:", win.url(), await win.title());
await win.evaluate(() => localStorage.setItem("cuetip-18ok", "true"));
await win.goto("app://game/laststand/index.html");
await win.waitForTimeout(9000);
await win.screenshot({ path: new URL("./shots/electron_laststand.png", import.meta.url).pathname });
console.log(errors.length ? "ERRORS:\n" + errors.join("\n") : "no page errors");
await app.close();
