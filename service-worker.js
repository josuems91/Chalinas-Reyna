// Service worker mínimo: solo existe para que el celular permita "Instalar app".
// No guarda en caché el contenido de la app (eso vive en Apps Script y siempre
// debe verse actualizado); solo deja pasar las peticiones de red normalmente.
const CACHE = "reyna-shell-v1";
const SHELL = ["./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(SHELL).catch(function () {});
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", function (event) {
  // El cascarón (este mismo sitio) se sirve rápido desde caché si ya se descargó;
  // todo lo demás (la app real en Apps Script) siempre va directo a la red.
  const url = event.request.url;
  const esCascaron = SHELL.some(function (s) { return url.indexOf(s.replace("./", "")) >= 0; });
  if (esCascaron) {
    event.respondWith(
      caches.match(event.request).then(function (r) {
        return r || fetch(event.request);
      })
    );
  }
});
