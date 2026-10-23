/* ==========================================================================
   BABI WEDDING — marketplace web
   Explorer, favoris et demandes de devis. Même source de données que le
   portail prestataire et le panel admin : ce qu'un prestataire publie
   apparaît ici immédiatement.
   ========================================================================== */
(function () {
  'use strict';

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var esc = function (s) { return BW.esc(s); };
  var ico = function (n, c) { return '<svg class="ico ' + (c || '') + '"><use href="#i-' + n + '"></use></svg>'; };

  var CLE_FAV = 'BW_FAVORIS';

  /* ---------- Favoris ---------- */
  function favoris() {
    try { return JSON.parse(localStorage.getItem(CLE_FAV) || '["villa-ebene","awa-beauty"]'); }
    catch (e) { return []; }
  }
  function estFavori(id) { return favoris().indexOf(id) > -1; }
  function basculerFavori(id) {
    var f = favoris();
    var i = f.indexOf(id);
    if (i > -1) f.splice(i, 1); else f.push(id);
    try { localStorage.setItem(CLE_FAV, JSON.stringify(f)); } catch (e) { /* ignoré */ }
    return i === -1;
  }

  /* ---------- Notification ---------- */
  var tmr = null;
  function toast(msg) {
    var el = $('#toast');
    $('span', el).textContent = msg;
    el.classList.add('show');
    clearTimeout(tmr);
    tmr = setTimeout(function () { el.classList.remove('show'); }, 2600);
  }

  /* ---------- Filtres courants ---------- */
  var filtres = { categorie: null, villes: [], budget: null, note: null, certifie: false };

  function resultats() {
    return BW.list('prestataires', { statut: 'valide' }).filter(function (p) {
      if (filtres.categorie && p.categorie !== filtres.categorie) return false;
      if (filtres.villes.length && filtres.villes.indexOf(p.commune) === -1) return false;
      if (filtres.certifie && !p.certifie) return false;
      if (filtres.note && p.note < filtres.note) return false;
      if (filtres.budget === 'eco' && p.prixMin > 200000) return false;
      if (filtres.budget === 'mid' && (p.prixMin < 200000 || p.prixMin > 500000)) return false;
      if (filtres.budget === 'high' && p.prixMin < 500000) return false;
      return true;
    }).sort(function (a, b) { return Number(b.sponsorise) - Number(a.sponsorise); });
  }

  function nbFiltresActifs() {
    return (filtres.villes.length ? 1 : 0) + (filtres.budget ? 1 : 0) +
           (filtres.note ? 1 : 0) + (filtres.certifie ? 1 : 0);
  }

  /* ================================================================
     Bandeau de catégories
     ================================================================ */
  function rendreCategories() {
    var el = $('#cats');
    var cats = BW.list('categories');
    el.innerHTML =
      '<button class="cat' + (filtres.categorie === null ? ' on' : '') + '" data-cat="">' +
        ico('grid') + '<span>Tous</span></button>' +
      cats.map(function (c) {
        var n = BW.list('prestataires', { categorie: c.id, statut: 'valide' }).length;
        if (!n) return '';
        return '<button class="cat' + (filtres.categorie === c.id ? ' on' : '') + '" data-cat="' + esc(c.id) + '">' +
          ico(c.icon.replace('i-', '')) + '<span>' + esc(c.label) + '</span></button>';
      }).join('');

    $$('#cats .cat').forEach(function (b) {
      b.addEventListener('click', function () {
        filtres.categorie = b.getAttribute('data-cat') || null;
        rendreCategories(); rendre();
      });
    });
  }

  /* ================================================================
     Carte prestataire
     ================================================================ */
  function tuile(p) {
    var fav = estFavori(p.id);
    return '<article class="tuile" data-id="' + esc(p.id) + '">' +
      '<div class="media">' +
        '<div class="piste">' + p.photos.map(function (u, i) {
          return '<img src="' + esc(u) + '" alt="' + esc(p.nom) + ', photo ' + (i + 1) + '" loading="lazy" width="600" height="600">';
        }).join('') + '</div>' +
        (p.sponsorise ? '<span class="badge spo">Sponsorisé</span>'
                      : (p.certifie ? '<span class="badge">' + ico('check') + ' Certifié Or</span>' : '')) +
        '<button class="coeur' + (fav ? ' on' : '') + '" data-fav="' + esc(p.id) + '" ' +
          'aria-label="' + (fav ? 'Retirer des favoris' : 'Ajouter aux favoris') + '">' + ico('heart') + '</button>' +
        (p.photos.length > 1 ?
          '<button class="fleche g" data-prec aria-label="Photo précédente">' + ico('chevron-left', 'ico-sm') + '</button>' +
          '<button class="fleche d" data-suiv aria-label="Photo suivante">' + ico('chevron-right', 'ico-sm') + '</button>' +
          '<div class="points">' + p.photos.map(function (_, i) {
            return '<i' + (i === 0 ? ' class="on"' : '') + '></i>'; }).join('') + '</div>' : '') +
      '</div>' +
      '<a href="prestataire.html?id=' + esc(p.id) + '" style="display:grid;gap:2px">' +
        '<span class="ligne1"><span class="nom">' + esc(p.nom) + '</span>' +
          (p.note ? '<span class="note">' + ico('star') + BW.note(p.note) +
            ' <span class="muet" style="font-weight:400">(' + p.avis + ')</span></span>' : '') + '</span>' +
        '<span class="sous">' + esc(BW.labelCategorie(p.categorie)) + ' · ' + esc(p.commune) + '</span>' +
        '<span class="sous">' + esc(p.accroche) + '</span>' +
        '<span class="prix"><b>À partir de ' + BW.fcfa(p.prixMin) + '</b> ' +
          '<span class="muet">· ' + esc(p.unite) + '</span></span>' +
      '</a>' +
    '</article>';
  }

  function activerTuiles() {
    $$('.tuile').forEach(function (t) {
      var piste = $('.piste', t);
      var points = $$('.points i', t);
      var n = $$('img', piste).length;
      var i = 0;
      function aller(k) {
        i = Math.max(0, Math.min(n - 1, k));
        piste.style.transform = 'translateX(-' + (i * 100) + '%)';
        points.forEach(function (d, j) { d.classList.toggle('on', j === i); });
        var g = $('[data-prec]', t), d = $('[data-suiv]', t);
        if (g) g.disabled = i === 0;
        if (d) d.disabled = i === n - 1;
      }
      var g = $('[data-prec]', t), d = $('[data-suiv]', t);
      if (g) g.addEventListener('click', function (e) { e.preventDefault(); aller(i - 1); });
      if (d) d.addEventListener('click', function (e) { e.preventDefault(); aller(i + 1); });
      aller(0);
    });

    $$('[data-fav]').forEach(function (b) {
      b.addEventListener('click', function (e) {
        e.preventDefault();
        var id = b.getAttribute('data-fav');
        var ajoute = basculerFavori(id);
        b.classList.toggle('on', ajoute);
        b.setAttribute('aria-label', ajoute ? 'Retirer des favoris' : 'Ajouter aux favoris');
        toast(ajoute ? 'Ajouté à vos favoris' : 'Retiré de vos favoris');
        majCompteurFavoris();
        if ((location.hash || '') === '#/favoris') rendre();
      });
    });
  }

  /* ================================================================
     Vue Explorer
     ================================================================ */
  function vueExplorer() {
    var liste = resultats();
    var n = nbFiltresActifs();

    return '' +
      '<div class="barre-outils">' +
        '<div class="fill"><b>' + liste.length + ' prestataire' + (liste.length > 1 ? 's' : '') + '</b>' +
          '<span class="muet"> · profils vérifiés, devis gratuits</span></div>' +
        '<button class="btn-filtres" id="ouvrir-filtres">' + ico('sliders', 'ico-sm') + ' Filtres' +
          (n ? '<span class="n">' + n + '</span>' : '') + '</button>' +
      '</div>' +

      '<div class="grille-cartes">' +
        (liste.length ? liste.map(tuile).join('')
          : '<div class="vide-etat"><span class="rond">' + ico('search') + '</span>' +
            '<b>Aucun prestataire ne correspond</b>' +
            '<p>Élargissez la zone géographique ou le budget pour voir plus de résultats.</p>' +
            '<button class="btn btn-neutre" id="vider-filtres">Réinitialiser les filtres</button></div>') +
      '</div>';
  }

  /* ================================================================
     Vue Favoris
     ================================================================ */
  function vueFavoris() {
    var ids = favoris();
    var liste = BW.list('prestataires').filter(function (p) { return ids.indexOf(p.id) > -1; });

    return '' +
      '<div class="barre-outils"><div class="fill">' +
        '<h1 style="font-size:28px">Favoris</h1>' +
        '<p>' + liste.length + ' prestataire' + (liste.length > 1 ? 's' : '') + ' enregistré' + (liste.length > 1 ? 's' : '') + '.</p>' +
      '</div></div>' +

      '<div class="grille-cartes">' +
        (liste.length ? liste.map(tuile).join('')
          : '<div class="vide-etat"><span class="rond">' + ico('heart') + '</span>' +
            '<b>Aucun favori pour l\'instant</b>' +
            '<p>Touchez le cœur sur un prestataire pour le retrouver ici et comparer vos coups de cœur.</p>' +
            '<a class="btn btn-primary" href="#/">Explorer les prestataires</a></div>') +
      '</div>';
  }

  /* ================================================================
     Feuille de filtres
     ================================================================ */
  function ouvrirFiltres() {
    var brouillon = JSON.parse(JSON.stringify(filtres));

    $('#feuille-corps').innerHTML =
      '<div class="bloc-filtre"><h4>Type de prestataire</h4><div class="chips" id="f-cat">' +
        '<button class="chip' + (!brouillon.categorie ? ' on' : '') + '" data-v="">Tous</button>' +
        BW.list('categories').map(function (c) {
          return '<button class="chip' + (brouillon.categorie === c.id ? ' on' : '') +
            '" data-v="' + esc(c.id) + '">' + esc(c.label) + '</button>';
        }).join('') + '</div></div>' +

      '<div class="bloc-filtre"><h4>Ville ou commune</h4><div class="chips" id="f-ville">' +
        BW.list('villes').map(function (v) {
          return '<button class="chip' + (brouillon.villes.indexOf(v) > -1 ? ' on' : '') +
            '" data-v="' + esc(v) + '">' + esc(v) + '</button>';
        }).join('') + '</div></div>' +

      '<div class="bloc-filtre"><h4>Budget de départ</h4><div class="chips" id="f-budget">' +
        [['eco', 'Moins de 200 000 FCFA'], ['mid', '200 000 à 500 000 FCFA'], ['high', 'Plus de 500 000 FCFA']]
          .map(function (b) {
            return '<button class="chip' + (brouillon.budget === b[0] ? ' on' : '') +
              '" data-v="' + b[0] + '">' + b[1] + '</button>';
          }).join('') + '</div></div>' +

      '<div class="bloc-filtre"><h4>Note minimale</h4><div class="chips" id="f-note">' +
        [4, 4.5, 4.8].map(function (x) {
          return '<button class="chip' + (brouillon.note === x ? ' on' : '') +
            '" data-v="' + x + '">' + BW.note(x) + ' et plus</button>';
        }).join('') + '</div></div>' +

      '<div class="bloc-filtre">' +
        '<label class="bascule"><input type="checkbox" id="f-certifie"' + (brouillon.certifie ? ' checked' : '') + '>' +
          '<span class="case">' + ico('check') + '</span>' +
          '<span><b>Prestataires Certifiés Or uniquement</b><br>' +
          '<span class="petit muet">Pièce d\'identité et portfolio vérifiés par notre équipe.</span></span></label>' +
      '</div>';

    function groupeUnique(sel, cle, numerique) {
      $$(sel + ' .chip').forEach(function (b) {
        b.addEventListener('click', function () {
          var v = b.getAttribute('data-v');
          var nouvelle = numerique ? parseFloat(v) : (v || null);
          brouillon[cle] = (brouillon[cle] === nouvelle) ? null : nouvelle;
          $$(sel + ' .chip').forEach(function (x) {
            var xv = x.getAttribute('data-v');
            var xval = numerique ? parseFloat(xv) : (xv || null);
            x.classList.toggle('on', brouillon[cle] === xval);
          });
          majBouton();
        });
      });
    }
    groupeUnique('#f-cat', 'categorie', false);
    groupeUnique('#f-budget', 'budget', false);
    groupeUnique('#f-note', 'note', true);

    $$('#f-ville .chip').forEach(function (b) {
      b.addEventListener('click', function () {
        var v = b.getAttribute('data-v');
        var i = brouillon.villes.indexOf(v);
        if (i > -1) brouillon.villes.splice(i, 1); else brouillon.villes.push(v);
        b.classList.toggle('on', i === -1);
        majBouton();
      });
    });
    $('#f-certifie').addEventListener('change', function () {
      brouillon.certifie = this.checked; majBouton();
    });

    function compter() {
      var sauve = filtres;
      filtres = brouillon;
      var n = resultats().length;
      filtres = sauve;
      return n;
    }
    function majBouton() {
      var n = compter();
      $('#appliquer').textContent = 'Afficher ' + n + ' prestataire' + (n > 1 ? 's' : '');
    }
    majBouton();

    $('#effacer').onclick = function () {
      brouillon = { categorie: null, villes: [], budget: null, note: null, certifie: false };
      ouvrirFiltres();
    };
    $('#appliquer').onclick = function () {
      filtres = brouillon;
      fermerFeuille();
      rendreCategories();
      rendre();
    };

    $('#feuille').classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function fermerFeuille() {
    $('#feuille').classList.remove('open');
    document.body.style.overflow = '';
  }

  /* ================================================================
     Pilule de recherche
     ================================================================ */
  function majPilule() {
    $('#pill-cat').textContent = filtres.categorie
      ? BW.categorie(filtres.categorie).label : 'Tous les prestataires';
    $('#pill-ville').textContent = filtres.villes.length
      ? filtres.villes.join(', ') : "Toute la Côte d'Ivoire";
  }

  function majCompteurFavoris() {
    var n = favoris().length;
    var lien = $('#lien-favoris');
    if (lien) lien.textContent = n ? 'Favoris (' + n + ')' : 'Favoris';
  }

  /* ================================================================
     Rendu
     ================================================================ */
  function rendre() {
    var vue = (location.hash || '#/').replace(/^#\/?/, '');
    $('#vue').innerHTML = vue === 'favoris' ? vueFavoris() : vueExplorer();
    activerTuiles();
    majPilule();
    majCompteurFavoris();

    var ouvrir = $('#ouvrir-filtres');
    if (ouvrir) ouvrir.addEventListener('click', ouvrirFiltres);
    var vider = $('#vider-filtres');
    if (vider) vider.addEventListener('click', function () {
      filtres = { categorie: null, villes: [], budget: null, note: null, certifie: false };
      rendreCategories(); rendre();
    });

    document.title = (vue === 'favoris' ? 'Favoris' : 'Prestataires de mariage en Côte d\'Ivoire') + ' — Babi Wedding';
  }

  /* ================================================================
     Démarrage
     ================================================================ */
  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-fermer-feuille]')) fermerFeuille();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') fermerFeuille();
  });
  $('#pill').addEventListener('click', ouvrirFiltres);
  window.addEventListener('hashchange', rendre);

  var annee = $('#annee');
  if (annee) annee.textContent = new Date().getFullYear();

  rendreCategories();
  rendre();
})();
