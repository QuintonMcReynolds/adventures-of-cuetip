import AppKit
import WebKit

// Serves the bundled www/ folder at game://app/ so the game gets a stable
// origin (localStorage saves survive relaunches inside the sandbox).
final class Files: NSObject, WKURLSchemeHandler {
    let root = Bundle.main.resourceURL!.appendingPathComponent("www")
    func webView(_ w: WKWebView, start task: WKURLSchemeTask) {
        var path = task.request.url?.path ?? "/"
        if path == "/" || path.isEmpty { path = "/index.html" }
        let file = root.appendingPathComponent(String(path.dropFirst())).standardizedFileURL
        guard file.path.hasPrefix(root.standardizedFileURL.path), let data = try? Data(contentsOf: file) else {
            task.didFailWithError(URLError(.fileDoesNotExist)); return
        }
        let types = ["html": "text/html", "js": "text/javascript", "css": "text/css", "png": "image/png",
                     "ttf": "font/ttf", "json": "application/json", "webmanifest": "application/manifest+json", "txt": "text/plain"]
        let mime = types[file.pathExtension.lowercased()] ?? "application/octet-stream"
        task.didReceive(HTTPURLResponse(url: task.request.url!, statusCode: 200, httpVersion: "HTTP/1.1",
                                        headerFields: ["Content-Type": mime, "Content-Length": "\(data.count)"])!)
        task.didReceive(data)
        task.didFinish()
    }
    func webView(_ w: WKWebView, stop task: WKURLSchemeTask) {}
}

final class AppDelegate: NSObject, NSApplicationDelegate {
    var window: NSWindow!
    let files = Files()

    func applicationDidFinishLaunching(_ n: Notification) {
        let cfg = WKWebViewConfiguration()
        cfg.setURLSchemeHandler(files, forURLScheme: "game")
        cfg.mediaTypesRequiringUserActionForPlayback = []
        let web = WKWebView(frame: .zero, configuration: cfg)
        web.setValue(false, forKey: "drawsBackground")
        window = NSWindow(contentRect: NSRect(x: 0, y: 0, width: 1280, height: 800),
                          styleMask: [.titled, .closable, .miniaturizable, .resizable], backing: .buffered, defer: false)
        window.title = Bundle.main.object(forInfoDictionaryKey: "CFBundleDisplayName") as? String ?? "Game"
        window.backgroundColor = .black
        window.contentMinSize = NSSize(width: 800, height: 500)
        window.collectionBehavior = [.fullScreenPrimary]
        window.contentView = web
        window.setFrameAutosaveName("GameWindow")
        window.center()
        window.makeKeyAndOrderFront(nil)
        web.load(URLRequest(url: URL(string: "game://app/index.html")!))
        NSApp.activate(ignoringOtherApps: true)
        #if DEBUG
        // Test hook: GAME_SNAPSHOT=1 saves what the window shows after 6 s.
        if ProcessInfo.processInfo.environment["GAME_SNAPSHOT"] != nil {
            DispatchQueue.main.asyncAfter(deadline: .now() + 6) {
                web.takeSnapshot(with: nil) { img, _ in
                    guard let img, let tiff = img.tiffRepresentation,
                          let png = NSBitmapImageRep(data: tiff)?.representation(using: .png, properties: [:]) else { return }
                    try? png.write(to: FileManager.default.temporaryDirectory.appendingPathComponent("snapshot.png"))
                }
            }
        }
        #endif
    }
    func applicationShouldTerminateAfterLastWindowClosed(_ a: NSApplication) -> Bool { true }
}

let app = NSApplication.shared
let menu = NSMenu()
let appItem = NSMenuItem(); menu.addItem(appItem)
let appMenu = NSMenu()
let title = Bundle.main.object(forInfoDictionaryKey: "CFBundleDisplayName") as? String ?? "Game"
appMenu.addItem(withTitle: "Hide \(title)", action: #selector(NSApplication.hide(_:)), keyEquivalent: "h")
appMenu.addItem(.separator())
appMenu.addItem(withTitle: "Quit \(title)", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q")
appItem.submenu = appMenu
let viewItem = NSMenuItem(); menu.addItem(viewItem)
let viewMenu = NSMenu(title: "View")
let fs = viewMenu.addItem(withTitle: "Enter Full Screen", action: #selector(NSWindow.toggleFullScreen(_:)), keyEquivalent: "f")
fs.keyEquivalentModifierMask = [.command, .control]
viewItem.submenu = viewMenu
let winItem = NSMenuItem(); menu.addItem(winItem)
let winMenu = NSMenu(title: "Window")
winMenu.addItem(withTitle: "Minimize", action: #selector(NSWindow.performMiniaturize(_:)), keyEquivalent: "m")
winMenu.addItem(withTitle: "Close", action: #selector(NSWindow.performClose(_:)), keyEquivalent: "w")
winItem.submenu = winMenu
app.mainMenu = menu
let delegate = AppDelegate()
app.delegate = delegate
app.setActivationPolicy(.regular)
app.run()
