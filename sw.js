/* Service worker — keeps the handbook readable with no signal.
 *
 * The previous version was cache-first with a fixed cache name, on the
 * assumption that content never changes between deploys. That is true of a
 * book published once and false of one being written, and the effect was that
 * a returning reader kept the very first copy of every file forever.
 *
 * So: network-first for the document and the code, which must always be
 * current when there is a connection; cache-first only for images, which are
 * immutable once drawn and are what actually needs to survive offline. The
 * cache name carries the build, so every deploy retires the previous one.
 */

const VERSION = '__BUILD__';
const CACHE = 'drrm-' + VERSION;

const CORE = ['./', 'index.html', 'style.css', 'app.js', 'icon.svg', 'manifest.webmanifest'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(CORE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* Images never change once published, so serve them from the cache — that is
   what makes the figures available with no signal. */
function isImmutable(url) {
  return /\/img\//.test(url.pathname) || /\.(png|jpe?g|webp)$/i.test(url.pathname);
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  if (isImmutable(url)) {
    e.respondWith(
      caches.match(req).then(hit => hit || fetch(req).then(res => {
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return res;
      }))
    );
    return;
  }

  /* Everything else — the page, the stylesheet, the script — comes from the
     network when there is one, and falls back to the cache when there is not. */
  e.respondWith(
    fetch(req)
      .then(res => {
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req).then(hit => hit || caches.match('index.html')))
  );
});
