#!/usr/bin/env python3
"""Generate a native macOS WKWebView shell (mac/) for a web game repo.
usage: make_mac.py <repo> <bundle-id> <display name> <icon 1024 png>"""
import sys, os, json, subprocess, hashlib
repo, bid, name, icon = sys.argv[1:5]
m = os.path.join(repo, 'mac'); os.makedirs(m + '/Game/Assets.xcassets/AppIcon.appiconset', exist_ok=True)
def uid(s): return hashlib.md5((bid + s).encode()).hexdigest()[:24].upper()

open(m + '/Game/main.swift', 'w').write('''import AppKit
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
                                        headerFields: ["Content-Type": mime, "Content-Length": "\\(data.count)"])!)
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
appMenu.addItem(withTitle: "Hide \\(title)", action: #selector(NSApplication.hide(_:)), keyEquivalent: "h")
appMenu.addItem(.separator())
appMenu.addItem(withTitle: "Quit \\(title)", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q")
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
''')

open(m + '/Game/Game.entitlements', 'w').write('''<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>com.apple.security.app-sandbox</key>
	<true/>
</dict>
</plist>
''')

ai = m + '/Game/Assets.xcassets/AppIcon.appiconset'
imgs = []
for s in (16, 32, 128, 256, 512):
    for sc in (1, 2):
        f = f'icon-{s}@{sc}x.png'
        subprocess.run(['sips', '-z', str(s*sc), str(s*sc), icon, '--out', f'{ai}/{f}'], check=True, capture_output=True)
        imgs.append({'idiom': 'mac', 'size': f'{s}x{s}', 'scale': f'{sc}x', 'filename': f})
json.dump({'images': imgs, 'info': {'author': 'xcode', 'version': 1}}, open(ai + '/Contents.json', 'w'), indent=2)
json.dump({'info': {'author': 'xcode', 'version': 1}}, open(m + '/Game/Assets.xcassets/Contents.json', 'w'), indent=2)

I = {k: uid(k) for k in 'proj main group src prod app target srcphase resphase fwphase main.swift main.build assets assets.build www www.build ent cfglist_p cfglist_t dbg_p rel_p dbg_t rel_t'.split()}
common = f'''CODE_SIGN_ENTITLEMENTS = Game/Game.entitlements;
				CODE_SIGN_STYLE = Automatic;
				COMBINE_HIDPI_IMAGES = YES;
				CURRENT_PROJECT_VERSION = 1;
				DEVELOPMENT_TEAM = FHP95MJ996;
				ENABLE_HARDENED_RUNTIME = YES;
				GENERATE_INFOPLIST_FILE = YES;
				INFOPLIST_KEY_CFBundleDisplayName = "{name}";
				INFOPLIST_KEY_LSApplicationCategoryType = "public.app-category.adventure-games";
				INFOPLIST_KEY_NSHumanReadableCopyright = "© 2026 CuetipLLC";
				ASSETCATALOG_COMPILER_APPICON_NAME = AppIcon;
				MACOSX_DEPLOYMENT_TARGET = 12.0;
				MARKETING_VERSION = 1.0;
				PRODUCT_BUNDLE_IDENTIFIER = {bid};
				PRODUCT_NAME = "{name}";
				SDKROOT = macosx;
				SWIFT_VERSION = 5.0;'''
pcommon = '''ALWAYS_SEARCH_USER_PATHS = NO;
				CLANG_ENABLE_MODULES = YES;
				SDKROOT = macosx;
				MACOSX_DEPLOYMENT_TARGET = 12.0;'''
pbx = f'''// !$*UTF8*$!
{{
	archiveVersion = 1;
	classes = {{
	}};
	objectVersion = 56;
	objects = {{
		{I['main.build']} = {{isa = PBXBuildFile; fileRef = {I['main.swift']}; }};
		{I['assets.build']} = {{isa = PBXBuildFile; fileRef = {I['assets']}; }};
		{I['www.build']} = {{isa = PBXBuildFile; fileRef = {I['www']}; }};
		{I['main.swift']} = {{isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = main.swift; sourceTree = "<group>"; }};
		{I['assets']} = {{isa = PBXFileReference; lastKnownFileType = folder.assetcatalog; path = Assets.xcassets; sourceTree = "<group>"; }};
		{I['ent']} = {{isa = PBXFileReference; lastKnownFileType = text.plist.entitlements; path = Game.entitlements; sourceTree = "<group>"; }};
		{I['www']} = {{isa = PBXFileReference; lastKnownFileType = folder; name = www; path = ../www; sourceTree = SOURCE_ROOT; }};
		{I['app']} = {{isa = PBXFileReference; explicitFileType = wrapper.application; includeInIndex = 0; path = "{name}.app"; sourceTree = BUILT_PRODUCTS_DIR; }};
		{I['fwphase']} = {{isa = PBXFrameworksBuildPhase; buildActionMask = 2147483647; files = (); runOnlyForDeploymentPostprocessing = 0; }};
		{I['main']} = {{isa = PBXGroup; children = ({I['src']}, {I['www']}, {I['prod']}, ); sourceTree = "<group>"; }};
		{I['src']} = {{isa = PBXGroup; children = ({I['main.swift']}, {I['assets']}, {I['ent']}, ); path = Game; sourceTree = "<group>"; }};
		{I['prod']} = {{isa = PBXGroup; children = ({I['app']}, ); name = Products; sourceTree = "<group>"; }};
		{I['target']} = {{
			isa = PBXNativeTarget;
			buildConfigurationList = {I['cfglist_t']};
			buildPhases = ({I['srcphase']}, {I['fwphase']}, {I['resphase']}, );
			buildRules = ();
			dependencies = ();
			name = Game;
			productName = Game;
			productReference = {I['app']};
			productType = "com.apple.product-type.application";
		}};
		{I['proj']} = {{
			isa = PBXProject;
			attributes = {{ BuildIndependentTargetsInParallel = 1; LastSwiftUpdateCheck = 1500; LastUpgradeCheck = 1500; }};
			buildConfigurationList = {I['cfglist_p']};
			compatibilityVersion = "Xcode 14.0";
			developmentRegion = en;
			hasScannedForEncodings = 0;
			knownRegions = (en, Base, );
			mainGroup = {I['main']};
			productRefGroup = {I['prod']};
			projectDirPath = "";
			projectRoot = "";
			targets = ({I['target']}, );
		}};
		{I['resphase']} = {{isa = PBXResourcesBuildPhase; buildActionMask = 2147483647; files = ({I['assets.build']}, {I['www.build']}, ); runOnlyForDeploymentPostprocessing = 0; }};
		{I['srcphase']} = {{isa = PBXSourcesBuildPhase; buildActionMask = 2147483647; files = ({I['main.build']}, ); runOnlyForDeploymentPostprocessing = 0; }};
		{I['dbg_p']} = {{isa = XCBuildConfiguration; buildSettings = {{
				{pcommon}
				DEBUG_INFORMATION_FORMAT = dwarf;
				ONLY_ACTIVE_ARCH = YES;
				SWIFT_OPTIMIZATION_LEVEL = "-Onone";
			}}; name = Debug; }};
		{I['rel_p']} = {{isa = XCBuildConfiguration; buildSettings = {{
				{pcommon}
				DEBUG_INFORMATION_FORMAT = "dwarf-with-dsym";
				SWIFT_COMPILATION_MODE = wholemodule;
			}}; name = Release; }};
		{I['dbg_t']} = {{isa = XCBuildConfiguration; buildSettings = {{
				{common}
			}}; name = Debug; }};
		{I['rel_t']} = {{isa = XCBuildConfiguration; buildSettings = {{
				{common}
			}}; name = Release; }};
		{I['cfglist_p']} = {{isa = XCConfigurationList; buildConfigurations = ({I['dbg_p']}, {I['rel_p']}, ); defaultConfigurationIsVisible = 0; defaultConfigurationName = Release; }};
		{I['cfglist_t']} = {{isa = XCConfigurationList; buildConfigurations = ({I['dbg_t']}, {I['rel_t']}, ); defaultConfigurationIsVisible = 0; defaultConfigurationName = Release; }};
	}};
	rootObject = {I['proj']};
}}
'''
os.makedirs(m + '/Game.xcodeproj', exist_ok=True)
open(m + '/Game.xcodeproj/project.pbxproj', 'w').write(pbx)
print('wrote', m)
