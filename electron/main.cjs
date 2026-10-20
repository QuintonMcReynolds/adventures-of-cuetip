// Desktop build (itch.io / Steam / Mac / Windows): a 16:9 window around the same www/ game.
const { app, BrowserWindow, Menu, protocol, net } = require("electron");
const path = require("path");
const { pathToFileURL } = require("url");

// Serve www/ from app://game/ instead of file://, because Last Stand's Godot engine loads
// its .wasm with fetch(), which file:// pages can't do.
const WWW = path.join(__dirname, "..", "www");
protocol.registerSchemesAsPrivileged([{ scheme: "app", privileges: { standard: true, secure: true, supportFetchAPI: true } }]);

function createWindow() {
  const win = new BrowserWindow({
    width: 1280, height: 720, minWidth: 640, minHeight: 360,
    backgroundColor: "#07040f", title: "Adventures of Cuetip",
    icon: path.join(__dirname, "icon.png"),
    webPreferences: { contextIsolation: true, sandbox: true },
  });
  Menu.setApplicationMenu(null);
  win.loadURL("app://game/index.html");
  win.webContents.on("before-input-event", (e, input) => {
    if (input.type === "keyDown" && input.key === "F11") win.setFullScreen(!win.isFullScreen());
  });
}

app.whenReady().then(() => {
  protocol.handle("app", (req) => {
    let p = decodeURIComponent(new URL(req.url).pathname);
    if (p.endsWith("/")) p += "index.html";
    const file = path.normalize(path.join(WWW, p));
    if (!file.startsWith(WWW)) return new Response("", { status: 403 });
    return net.fetch(pathToFileURL(file).toString());
  });
  createWindow();
});
app.on("window-all-closed", () => app.quit());
