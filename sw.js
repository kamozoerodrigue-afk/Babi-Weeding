/* ==========================================================================
   BABI WEDDING — Service Worker

   Rôle : garder le site consultable quand le réseau flanche, sans jamais
   servir un script périmé.

   La version précédente appliquait « cache d'abord » à tous les fichiers,
   scripts compris. Résultat : une mise à jour du code pouvait rester
   invisible indéfiniment, le navigateur continuant d'exécuter l'ancienne
   version. C'est corrigé ici :

     — le code (JS, CSS) part toujours au réseau en premier, le cache ne
       sert que de filet de secours hors ligne ;
     — les pages HTML, de même ;
     — seules les ressources vraiment stables (images, polices, icônes)
       sont servies depuis le cache, puis rafraîchies en arrière-plan ;
     — la configuration et les appels à la base ne sont jamais mis en cache.

   Le numéro de version ci-dessous purge l'ancien cache à chaque montée.
   ========================================================================== */

const VERSION = 'babi-wedding-v3';

const CORE = ['/', '/index.html', '/catalogue.html', '/blog.html', '/article.html',
              '/assets/css/style.css'];

/* --- Installation : on précharge le strict nécessaire ------------------- */
self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(VERSION)
      .then(function (c) { return c.addAll(CORE).catch(function () { /* hors ligne */ }); })
      .then(function () { return self.skipWaiting(); })
  );
});

/* --- Activation : tout cache d'une version antérieure disparaît --------- */
self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (cles) {
        return Promise.all(cles.filter(function (k) { return k !== VERSION; })
                               .map(function (k) { return caches.delete(k); }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

/* --- Message : permet à la page de forcer la reprise -------------------- */
self.addEventListener('message', function (e) {
  if (e.data === 'bw:maintenant') self.skipWaiting();
});

/* --- Interception ------------------------------------------------------ */
self.addEventListener('fetch', function (e) {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  /* Rien de ce qui sort du site ne passe par ici : la base de données, le
     SDK Supabase et les images distantes gèrent leur propre cache. */
  if (url.origin !== self.location.origin) return;

  /* La configuration doit toujours être lue telle qu'elle est sur le disque. */
  if (url.pathname.indexOf('/assets/js/config.js') > -1) return;

  const estCode = /\.(js|css)$/.test(url.pathname);
  const estPage = req.mode === 'navigate';

  /* ---- Code et pages : réseau d'abord, cache en secours ---------------- */
  if (estCode || estPage) {
    e.respondWith(
      fetch(req).then(function (res) {
        if (res && res.ok) {
          const copie = res.clone();
          caches.open(VERSION).then(function (c) { c.put(req, copie); });
        }
        return res;
      }).catch(function () {
        return caches.match(req).then(function (r) {
          return r || (estPage ? caches.match('/index.html') : undefined);
        });
      })
    );
    return;
  }

  /* ---- Le reste : cache d'abord, rafraîchi en arrière-plan ------------- */
  e.respondWith(
    caches.match(req).then(function (cache) {
      const reseau = fetch(req).then(function (res) {
        if (res && res.ok) {
          const copie = res.clone();
          caches.open(VERSION).then(function (c) { c.put(req, copie); });
        }
        return res;
      }).catch(function () { return cache; });
      return cache || reseau;
    })
  );
});
