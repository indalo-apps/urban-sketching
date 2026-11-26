// © 2026 Carlos Moreno Otto. Todos los derechos reservados.
// Service worker de Urban Sketching: permite usarla sin conexión.
// Al subir una versión nueva, cambia el nombre de la caché y se borra la anterior.
const CACHE = "urban-sketching-1.5";
const PRECACHE = ["./", "index.html", "manifest.webmanifest", "icon.svg", "apple-touch-icon.png", "icon-192.png", "icon-512.png", "icon-152.png", "icon-167.png", "icon-maskable-512.png", "favicon-32.png",
  "fonts/inter-latin-400-normal.woff2", "fonts/inter-latin-500-normal.woff2", "fonts/inter-latin-600-normal.woff2", "fonts/inter-latin-700-normal.woff2",
  "fonts/cormorant-garamond-latin-600-normal.woff2", "fonts/cormorant-garamond-latin-500-italic.woff2"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(PRECACHE.map(u => c.add(new Request(u, { mode: "same-origin" })).catch(() => {})))));
  self.skipWaiting();
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith("urban-sketching-") && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== location.origin) return;
  // Comprobación de versión nueva: siempre a la red
  if (url.searchParams.has("v")) return;
  // La página: primero la red (lo último) y, sin conexión, la copia guardada (solo se guarda si ha llegado bien)
  if (req.mode === "navigate") {
    e.respondWith(fetch(req, { cache: "no-store" }).then(r => { if (r.ok) { const cp = r.clone(); caches.open(CACHE).then(c => c.put("index.html", cp)); } return r; })
      .catch(() => caches.match("index.html").then(r => r || caches.match("./"))));
    return;
  }
  // Lo demás (letras, iconos): primero la copia guardada y, si no está, la red
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req).then(r => {
    if (r && r.ok) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(req, cp)); }
    return r;
  })));
});
