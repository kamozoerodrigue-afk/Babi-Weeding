/* ==========================================================================
   BABI WEDDING — main.js
   Header, drawer, compteurs, carrousels, FAQ, formulaires, tracking GA4
   ========================================================================== */
(function () {
  'use strict';

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- 1. Fallback images (aucune image cassée) ---------- */
  function imgFallback() {
    $$('img').forEach(function (img) {
      img.addEventListener('error', function () {
        if (img.dataset.fb) return;
        img.dataset.fb = '1';
        var w = img.getAttribute('width') || 800, h = img.getAttribute('height') || 600;
        var label = (img.alt || 'Babi Wedding').substring(0, 42);
        var svg =
          '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '" viewBox="0 0 800 600">' +
          '<rect width="800" height="600" fill="#F7F7F7"/>' +
          '<g fill="none" stroke="#D9D9D9" stroke-width="14" stroke-linecap="round" stroke-linejoin="round">' +
          '<path d="M360 250h80l-24 42 44 70-22 18 36 88H326l36-88-22-18 44-70z"/></g>' +
          '<text x="400" y="520" font-family="Arial,Helvetica,sans-serif" font-size="22" fill="#8E8E8E" text-anchor="middle">' +
          label.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</text></svg>';
        img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
      }, { once: true });
    });
  }

  /* ---------- 2. Bandeau annonce (cookie 7 jours) ---------- */
  function announce() {
    var bar = $('#announce');
    if (!bar) return;
    if (document.cookie.indexOf('bw_ann=1') > -1) { bar.remove(); return; }
    var btn = $('.x', bar);
    if (btn) btn.addEventListener('click', function () {
      bar.remove();
      var d = new Date(); d.setTime(d.getTime() + 7 * 864e5);
      document.cookie = 'bw_ann=1;expires=' + d.toUTCString() + ';path=/;SameSite=Lax';
    });
  }

  /* ---------- 3. Header sticky + drawer mobile ---------- */
  function header() {
    var hdr = $('#hdr');
    if (hdr) {
      var onScroll = function () { hdr.classList.toggle('scrolled', window.scrollY > 8); };
      window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
    }
    var burger = $('#burger'), drawer = $('#drawer'), scrim = $('#scrim');
    if (!burger || !drawer) return;
    var toggle = function (open) {
      burger.classList.toggle('open', open);
      drawer.classList.toggle('open', open);
      if (scrim) scrim.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    };
    burger.addEventListener('click', function () { toggle(!drawer.classList.contains('open')); });
    if (scrim) scrim.addEventListener('click', function () { toggle(false); });
    $$('#drawer a, #drawer .close').forEach(function (a) {
      a.addEventListener('click', function () { toggle(false); });
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') toggle(false); });
  }

  /* ---------- 4. Compteurs animés (count-up au scroll) ---------- */
  function counters() {
    var els = $$('[data-count]');
    if (!els.length || !('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.textContent = el.dataset.count + (el.dataset.suffix || ''); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target, target = parseInt(el.dataset.count, 10), suffix = el.dataset.suffix || '';
        var start = null, dur = 1600;
        var step = function (ts) {
          if (!start) start = ts;
          var p = Math.min((ts - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased).toLocaleString('fr-FR') + (p === 1 ? suffix : '');
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        io.unobserve(el);
      });
    }, { threshold: 0.4 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- 5. Apparition au scroll ---------- */
  function reveal() {
    var els = $$('.reveal');
    if (!els.length || !('IntersectionObserver' in window)) {
      els.forEach(function (e) { e.classList.add('in'); }); return;
    }
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px' });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ---------- 6. Onglets "Comment ça marche" ---------- */
  function tabs() {
    $$('[data-tabs]').forEach(function (group) {
      var btns = $$('.tab', group);
      btns.forEach(function (b) {
        b.addEventListener('click', function () {
          btns.forEach(function (x) { x.classList.remove('on'); x.setAttribute('aria-selected', 'false'); });
          b.classList.add('on'); b.setAttribute('aria-selected', 'true');
          $$('[data-panel]').forEach(function (p) {
            p.classList.toggle('hide', p.dataset.panel !== b.dataset.tab);
          });
        });
      });
    });
  }

  /* ---------- 7. Carrousel témoignages (auto-play 5s + swipe natif) ---------- */
  function carousel() {
    $$('[data-carousel]').forEach(function (rail) {
      var dotsWrap = $('[data-dots="' + rail.dataset.carousel + '"]');
      var slides = Array.prototype.slice.call(rail.children);
      if (!slides.length) return;
      var i = 0, timer = null;

      /* Le contenu du rail peut être remplacé en direct quand la base change.
         On repart alors de zéro : ancien minuteur arrêté, anciennes pastilles
         retirées, flèches branchées une seule fois. */
      if (rail._bwArret) rail._bwArret();
      rail._bwArret = function () { clearInterval(timer); };

      if (dotsWrap) {
        dotsWrap.innerHTML = '';
        slides.forEach(function (_, n) {
          var b = document.createElement('button');
          b.type = 'button';
          b.setAttribute('aria-label', 'Témoignage ' + (n + 1));
          if (n === 0) b.classList.add('on');
          b.addEventListener('click', function () { go(n, true); });
          dotsWrap.appendChild(b);
        });
      }
      function sync() {
        if (!dotsWrap) return;
        $$('button', dotsWrap).forEach(function (b, n) { b.classList.toggle('on', n === i); });
      }
      function go(n, user) {
        i = (n + slides.length) % slides.length;
        rail.scrollTo({ left: slides[i].offsetLeft - rail.offsetLeft, behavior: 'smooth' });
        sync();
        if (user) restart();
      }
      function restart() { clearInterval(timer); timer = setInterval(function () { go(i + 1); }, 5000); }
      rail.addEventListener('scroll', function () {
        var n = Math.round(rail.scrollLeft / (slides[0].offsetWidth + 16));
        if (n !== i) { i = Math.min(n, slides.length - 1); sync(); }
      }, { passive: true });
      rail.addEventListener('pointerenter', function () { clearInterval(timer); });
      rail.addEventListener('pointerleave', restart);

      /* flèches desktop (façon Mariages.net) */
      var navWrap = $('[data-rail-nav="' + rail.dataset.carousel + '"]');
      if (navWrap) {
        var btns = $$('button', navWrap);
        /* Les flèches survivent au remplacement du contenu : on les branche
           sur la fonction courante plutôt que d'empiler les écouteurs. */
        rail._bwAller = go;
        rail._bwIndex = function () { return i; };
        if (!navWrap.dataset.bwPret) {
          navWrap.dataset.bwPret = '1';
          if (btns[0]) btns[0].addEventListener('click', function () { rail._bwAller(rail._bwIndex() - 1, true); });
          if (btns[1]) btns[1].addEventListener('click', function () { rail._bwAller(rail._bwIndex() + 1, true); });
        }
      }
      if (window.matchMedia('(max-width:1023px)').matches) restart();
    });
  }

  /* ---------- 8. FAQ accordéon (un seul ouvert) ---------- */
  function faq() {
    $$('.faq').forEach(function (group) {
      var items = $$('details.acc', group);
      items.forEach(function (d) {
        d.addEventListener('toggle', function () {
          if (d.open) items.forEach(function (o) { if (o !== d) o.open = false; });
        });
      });
    });
  }

  /* ---------- 9. Formulaires (honeypot + validation + Brevo/GA4) ---------- */
  function forms() {
    $$('form[data-form]').forEach(function (f) {
      f.addEventListener('submit', function (e) {
        e.preventDefault();
        if (f.querySelector('.hp') && f.querySelector('.hp').value) return; // bot
        var type = f.dataset.form;
        var email = (f.querySelector('input[type="email"]') || {}).value || '';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
          alert('Merci de saisir une adresse email valide.'); return;
        }
        track(type === 'lead-magnet' ? 'lead_magnet_download' : 'newsletter_subscribe', {
          magnet_type: f.dataset.magnet || '',
          user_type: f.dataset.userType || 'couple',
          source_block: f.dataset.block || ''
        });
        /* Intégration réelle : POST vers l'API Brevo / Mailchimp
           fetch('/api/subscribe', {method:'POST', body: new FormData(f)}) */
        var btn = f.querySelector('button[type="submit"]');
        if (btn) { btn.disabled = true; btn.textContent = 'C\'est envoyé, merci !'; }
        f.querySelectorAll('.input').forEach(function (i) { i.value = ''; });
        setTimeout(function () {
          if (btn) { btn.disabled = false; btn.textContent = btn.dataset.label || 'Envoyer'; }
        }, 3500);
      });
    });

    var search = $('#search-form');
    if (search) search.addEventListener('submit', function (e) {
      e.preventDefault();
      var cat = $('#f-cat').value, ville = $('#f-ville').value;
      track('search_submit', { category: cat, city: ville });
      window.location.href = 'catalogue.html?categorie=' + encodeURIComponent(cat) + '&ville=' + encodeURIComponent(ville);
    });
  }

  /* ---------- 10. Tracking GA4 ---------- */
  function track(name, params) {
    if (typeof window.gtag === 'function') window.gtag('event', name, params || {});
    if (window.dataLayer) window.dataLayer.push(Object.assign({ event: name }, params || {}));
    if (window.BW_DEBUG) console.log('[GA4]', name, params);
  }
  window.bwTrack = track;

  function ctaTracking() {
    $$('[data-ga-label]').forEach(function (el) {
      el.addEventListener('click', function () {
        track('cta_click', {
          cta_text: el.dataset.gaLabel,
          cta_location: el.dataset.gaLocation || '',
          user_type: el.dataset.gaUser || ''
        });
      });
    });
  }

  /* ---------- 11. Scroll depth 25/50/75/100 ---------- */
  function scrollDepth() {
    var marks = [25, 50, 75, 100], hit = {};
    window.addEventListener('scroll', function () {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      if (h <= 0) return;
      var pct = (window.scrollY / h) * 100;
      marks.forEach(function (m) {
        if (pct >= m && !hit[m]) { hit[m] = 1; track('scroll_depth', { percent: m }); }
      });
    }, { passive: true });
  }

  /* ---------- 12. CTA flottant mobile ---------- */
  function stickyCta() {
    var el = $('#sticky-cta');
    if (!el) return;
    window.addEventListener('scroll', function () {
      el.classList.toggle('show', window.scrollY > 700);
    }, { passive: true });
  }

  /* ---------- 13. Sommaire article (TOC) + surlignage ---------- */
  function toc() {
    var box = $('#toc'), prose = $('.prose');
    if (!box || !prose) return;
    var hs = $$('h2', prose);
    hs.forEach(function (h, n) {
      if (!h.id) h.id = 'sec-' + (n + 1);
      var a = document.createElement('a');
      a.href = '#' + h.id; a.textContent = h.textContent;
      box.appendChild(a);
    });
    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) {
        if (!e.isIntersecting) return;
        $$('a', box).forEach(function (a) {
          a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id);
        });
      });
    }, { rootMargin: '-90px 0px -70% 0px' });
    hs.forEach(function (h) { io.observe(h); });
  }

  /* ---------- 14. Temps de lecture + progression article ---------- */
  function readingTime() {
    var prose = $('.prose'), out = $('[data-reading-time]');
    if (!prose || !out) return;
    var words = prose.textContent.trim().split(/\s+/).length;
    out.textContent = Math.max(1, Math.round(words / 200)) + ' min de lecture';
    var fired = false;
    window.addEventListener('scroll', function () {
      var r = prose.getBoundingClientRect();
      var read = (window.innerHeight - r.top) / r.height;
      if (read > 0.75 && !fired) {
        fired = true;
        track('blog_article_read', {
          article_title: document.title,
          article_category: document.body.dataset.category || ''
        });
      }
    }, { passive: true });
  }

  /* ---------- 15. Partage ---------- */
  function share() {
    var copy = $('#copy-link');
    if (copy) copy.addEventListener('click', function () {
      navigator.clipboard.writeText(window.location.href).then(function () {
        var t = copy.innerHTML; copy.textContent = 'Lien copié';
        setTimeout(function () { copy.innerHTML = t; }, 2000);
      });
    });
    $$('[data-share-wa]').forEach(function (a) {
      a.href = 'https://wa.me/?text=' + encodeURIComponent(document.title + ' — ' + window.location.href);
    });
    $$('[data-share-fb]').forEach(function (a) {
      a.href = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(window.location.href);
    });
  }

  /* ---------- 16. Filtres catalogue ---------- */
  function catalogue() {
    var toggle = $('#filters-toggle'), panel = $('#filters');
    if (toggle && panel) toggle.addEventListener('click', function () {
      panel.classList.toggle('hide');
    });

    var cards = $$('[data-provider]');
    if (!cards.length) return;
    function apply() {
      var villes = $$('input[name="ville"]:checked').map(function (i) { return i.value; });
      var budgets = $$('input[name="budget"]:checked').map(function (i) { return i.value; });
      var notes = $$('input[name="note"]:checked').map(function (i) { return parseFloat(i.value); });
      var n = 0;
      cards.forEach(function (c) {
        var okV = !villes.length || villes.indexOf(c.dataset.ville) > -1;
        var okB = !budgets.length || budgets.indexOf(c.dataset.budget) > -1;
        var okN = !notes.length || notes.some(function (x) { return parseFloat(c.dataset.note) >= x; });
        var show = okV && okB && okN;
        c.classList.toggle('hide', !show);
        if (show) n++;
      });
      var out = $('#result-count'); if (out) out.textContent = n;
    }
    $$('#filters input[type="checkbox"]').forEach(function (i) { i.addEventListener('change', apply); });
    var reset = $('#filters-reset');
    if (reset) reset.addEventListener('click', function () {
      $$('#filters input[type="checkbox"]').forEach(function (i) { i.checked = false; }); apply();
    });

    var sort = $('#sort');
    if (sort) sort.addEventListener('change', function () {
      var list = $('#plist');
      var arr = cards.slice().sort(function (a, b) {
        if (sort.value === 'note') return parseFloat(b.dataset.note) - parseFloat(a.dataset.note);
        if (sort.value === 'prix-asc') return parseInt(a.dataset.prix, 10) - parseInt(b.dataset.prix, 10);
        if (sort.value === 'prix-desc') return parseInt(b.dataset.prix, 10) - parseInt(a.dataset.prix, 10);
        return parseInt(b.dataset.avis, 10) - parseInt(a.dataset.avis, 10);
      });
      arr.forEach(function (c) { list.appendChild(c); });
    });

    /* pré-remplissage depuis l'URL */
    var p = new URLSearchParams(window.location.search);
    var ville = p.get('ville');
    if (ville) {
      var box = $$('input[name="ville"]').filter(function (i) { return i.value === ville; })[0];
      if (box) { box.checked = true; apply(); }
    }
  }

  /* ---------- 17. Blog : filtres catégories ---------- */
  function blogFilter() {
    var btns = $$('[data-blog-cat]');
    if (!btns.length) return;
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        btns.forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on');
        var c = b.dataset.blogCat;
        $$('[data-article-cat]').forEach(function (a) {
          a.classList.toggle('hide', c !== 'all' && a.dataset.articleCat !== c);
        });
      });
    });
  }

  /* ---------- 18. PWA : Service Worker (mode offline basique) ---------- */
  function pwa() {
    if (!('serviceWorker' in navigator)) return;
    if (location.protocol === 'file:') return;  // nécessite http(s)

    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').then(function (reg) {
        /* Une version plus récente du site prend la main d'elle-même : sans
           cela, le navigateur peut continuer d'exécuter l'ancien code tant
           que tous les onglets ne sont pas fermés. */
        function surveiller(sw) {
          if (!sw) return;
          sw.addEventListener('statechange', function () {
            if (sw.state === 'installed' && navigator.serviceWorker.controller) {
              sw.postMessage('bw:maintenant');
            }
          });
        }
        surveiller(reg.installing);
        surveiller(reg.waiting);
        reg.addEventListener('updatefound', function () { surveiller(reg.installing); });
        reg.update();
      }).catch(function () { /* silencieux */ });

      /* Le nouveau service worker a pris la main : on recharge une fois pour
         repartir sur du code à jour. */
      var rechargé = false;
      navigator.serviceWorker.addEventListener('controllerchange', function () {
        if (rechargé) return;
        rechargé = true;
        location.reload();
      });
    });
  }

  /* ---------- INIT ---------- */
  function demarrer() {
    imgFallback(); announce(); header(); counters(); reveal(); tabs(); carousel();
    faq(); forms(); ctaTracking(); scrollDepth(); stickyCta(); toc();
    readingTime(); share(); catalogue(); blogFilter(); pwa();
    var y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();
  }

  /* Rendus rejouables après une mise à jour du contenu depuis la base.
     vitrine.js les rappelle quand l'administration modifie quelque chose. */
  window.BW_MAIN = {
    carousel: carousel,
    compteurs: counters,
    apparition: reveal,
    catalogue: catalogue,
    blog: blogFilter,
    images: imgFallback
  };

  /* main.js peut être injecté après le chargement du document, une fois la
     base de données prête : on démarre alors immédiatement. */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', demarrer);
  } else {
    demarrer();
  }
})();
