// Desktop build (itch.io / Steam / Mac / Windows): a 16:9 window around the same www/ game.
const { app, BrowserWindow, Menu } = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 1280, height: 720, minWidth: 640, minHeight: 360,
    backgroundColor: "#07040f", title: "Adventures of Cuetip",
    icon: path.join(__dirname, "icon.png"),
    webPreferences: { contextIsolation: true, sandbox: true },
  });
  Menu.setApplicationMenu(null);
  win.loadFile(path.join(__dirname, "..", "www", "index.html"));
  win.webContents.on("before-input-event", (e, input) => {
    if (input.type === "keyDown" && input.key === "F11") win.setFullScreen(!win.isFullScreen());
  });
}

app.whenReady().then(createWindow);
app.on("window-all-closed", () => app.quit());
