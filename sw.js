// Service worker: maakt de app installeerbaar en snel.
// Verhoog VERSION bij elke update zodat telefoons de nieuwe versie ophalen.
const VERSION = "voltage-v5";
const SHELL = ["./", "index.html", "styles.css", "app.js", "oefeningen.js", "manifest.webmanifest",
  "icon-192.png", "icon-512.png", "icon-maskable-512.png", "apple-touch-icon.png", "favicon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== "GET") return;
  // Oefeningfoto's (vaste versie op CDN/GitHub): eerst uit cache, ze veranderen nooit
  if (/(cdn\.jsdelivr\.net|raw\.githubusercontent\.com)$/.test(url.hostname) && url.pathname.includes("free-exercise-db")) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
      const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); return res;
    }).catch(() => Response.error())));
    return;
  }
  if (url.origin !== self.location.origin) return; // API en fonts altijd rechtstreeks
  // App-bestanden: eerst netwerk (altijd nieuwste versie), cache als je offline bent
  e.respondWith(fetch(req).then(res => {
    const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); return res;
  }).catch(() => caches.match(req).then(r => r || caches.match("index.html"))));
});
