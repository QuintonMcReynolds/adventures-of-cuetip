// Offline cache for the web/PWA build. Bump VERSION on every release so players get the update.
const VERSION = "adventures-of-cuetip-1.0.0";
const FILES = ["./", "index.html", "cuetip.js", "pixel.js", "cast.js", "scenes.js", "audio.js", "battle.js", "story.js", "engine.js", "manifest.webmanifest",
  "fonts/PixelifySans.ttf", "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request)));
});
