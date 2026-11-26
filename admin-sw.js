/* FinanceOS Command Center: lets the admin page install as an app.
   It only looks after admin.html and its own files. It never stores customer data:
   everything from Supabase always comes live from the network. */
const CACHE = 'fos-admin-v2';
const SHELL = ['admin.html', 'admin.webmanifest', 'admin-icon-192.png', 'admin-icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n.startsWith('fos-admin-') && n !== CACHE).map(n => caches.delete(n)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;           // Supabase, fonts and scripts: straight to the network
  const name = u.pathname.split('/').pop();
  if (!SHELL.includes(name)) return;
  // newest version first, the saved copy only when offline
  e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); return r; })
    .catch(() => caches.match(e.request, { ignoreSearch: true })));
});
