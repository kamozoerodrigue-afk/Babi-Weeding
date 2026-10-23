/* ==========================================================================
   BABI WEDDING — hydratation du site vitrine

   Le site public était écrit en dur. Il est désormais entièrement produit à
   partir de la base : ce que l'administration modifie dans le panel se voit
   ici, immédiatement.

   Deux moments :
     — au chargement, avant main.js, pour que ses filtres, son tri et ses
       carrousels se branchent sur les cartes réellement affichées ;
     — à chaque évènement « bw:change », émis quand la base bouge, y compris
       depuis un autre onglet ou un autre poste (temps réel Supabase).
   ========================================================================== */
(function () {
  'use strict';

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var esc = BW.esc;

  /* ---------------------------------------------------------------------
     Outils communs
     --------------------------------------------------------------------- */

  /* Tranche de budget utilisée par les filtres de main.js. */
  function tranche(prix) {
    if (!prix) return 'eco';
    if (prix < 200000) return 'eco';
    if (prix <= 400000) return 'medium';
    return 'premium';
  }

  function image(p, largeur) {
    var url = (p.photos && p.photos[0]) || '';
    return url.replace(/w=\d+/, 'w=' + (largeur || 700));
  }

  /* Depuis la racine du site, la fiche vit dans app/ ; depuis app/, à côté. */
  var RACINE = location.pathname.indexOf('/app/') > -1 ? '' : 'app/';
  function lienFiche(p) { return RACINE + 'prestataire.html?id=' + encodeURIComponent(p.id); }
  function lienCategorie(id) { return 'catalogue.html?categorie=' + encodeURIComponent(id); }

  function icone(cat) {
    return (cat && cat.icon) || 'i-agence';
  }

  /* Catégories triées, avec le nombre de fiches validées de chacune. */
  function categories() {
    var valides = BW.list('prestataires', { statut: 'valide' });
    /* La colonne « ordre » fixe la présentation voulue par l'administration.
       Quand elle manque, l'ordre d'arrivée fait foi. */
    return BW.list('categories').map(function (c, rang) {
      return {
        id: c.id, label: c.label, singulier: c.singulier, icon: c.icon,
        ordre: c.ordre === undefined || c.ordre === null ? rang : c.ordre,
        nb: valides.filter(function (p) { return p.categorie === c.id; }).length
      };
    }).sort(function (a, b) { return a.ordre - b.ordre; });
  }

  /* Carte prestataire, au gabarit du catalogue. */
  function carteTuile(p, options) {
    options = options || {};
    var services = BW.servicesDe(p.id).slice(0, 3)
      .map(function (s) { return esc(s.nom); }).join(' · ');
    var ligneBasse = options.categorie
      ? '<p class="ligne"><svg class="ico"><use href="#' + esc(icone(BW.categorie(p.categorie))) + '"></use></svg> ' +
        esc(BW.labelCategorie(p.categorie)) + '</p>'
      : (services
          ? '<p class="ligne"><svg class="ico"><use href="#i-tag"></use></svg> ' + services + '</p>'
          : (p.capacite
              ? '<p class="ligne"><svg class="ico"><use href="#i-users"></use></svg> ' + esc(p.capacite) + '</p>'
              : ''));

    return '' +
    '<article class="tile" data-provider data-ville="' + esc(p.commune) + '"' +
      ' data-budget="' + tranche(p.prixMin) + '" data-note="' + (p.note || 0) + '"' +
      ' data-prix="' + (p.prixMin || 0) + '" data-avis="' + (p.avis || 0) + '">' +
      '<div class="media">' +
        '<img src="' + esc(image(p)) + '" alt="' +
          esc(p.nom + ', ' + BW.labelCategorie(p.categorie) + ' à ' + p.commune) + '"' +
          ' loading="lazy" width="700" height="467">' +
        (p.sponsorise ? '<span class="tag tag--spo">Sponsorisé</span>' : '') +
        (p.certifie ? '<span class="tag tag--or"><svg class="ico"><use href="#i-check"></use></svg> Certifié Or</span>' : '') +
      '</div>' +
      '<div class="body">' +
        '<a href="' + lienFiche(p) + '" class="titre">' + esc(p.nom) + '</a>' +
        '<p class="note"><svg class="ico"><use href="#i-star"></use></svg> <b>' + BW.note(p.note) + '</b>' +
          ' (' + (p.avis || 0) + ') · ' + esc(p.commune + ', ' + p.ville) + '</p>' +
        '<p class="ligne"><svg class="ico"><use href="#i-money"></use></svg> À partir de ' +
          BW.fcfa(p.prixMin) + (p.unite ? ' <span class="muet">' + esc(p.unite) + '</span>' : '') + '</p>' +
        ligneBasse +
        '<a href="' + lienFiche(p) + '" class="btn ' + (options.bouton || 'btn-primary') + ' btn-block mt-16"' +
          ' data-ga-label="' + esc(options.libelle || 'Demander un devis') + '"' +
          ' data-ga-location="' + esc(options.zone || 'catalogue') + '">' +
          esc(options.libelle || 'Demander un devis gratuit') + '</a>' +
      '</div>' +
    '</article>';
  }

  /* Carte d'article de blog. */
  function carteArticle(a, suffixeLecture) {
    var url = 'article.html?slug=' + encodeURIComponent(a.slug || a.id);
    var img = a.image || 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=70';
    return '' +
    '<article class="post" data-article-cat="' + esc(String(a.categorie || '').toLowerCase()) + '">' +
      '<a href="' + url + '" class="media"><img src="' + esc(img) + '" alt="' + esc(a.titre) + '"' +
        ' loading="lazy" width="800" height="450"></a>' +
      '<div class="body">' +
        '<span class="rubrique">' + esc(a.categorie) + '</span>' +
        '<h3><a href="' + url + '">' + esc(a.titre) + '</a></h3>' +
        '<p>' + esc(a.chapo || a.metaDesc || '') + '</p>' +
        '<div class="pied"><span><svg class="ico"><use href="#i-clock"></use></svg> ' +
          (a.minutes || 5) + ' min' + (suffixeLecture ? ' de lecture' : '') + '</span>' +
          '<a href="' + url + '" class="lien">Lire</a></div>' +
      '</div>' +
    '</article>';
  }

  /* =====================================================================
     1. PAGE D'ACCUEIL
     ===================================================================== */

  /* --- Listes déroulantes de la recherche ---------------------------- */
  function rechercheAccueil() {
    var selCat = $('#f-cat');
    if (selCat) {
      var garde = selCat.value;
      selCat.innerHTML = '<option value="">Quel prestataire cherchez-vous ?</option>' +
        categories().map(function (c) {
          return '<option value="' + esc(c.id) + '">' + esc(c.label) + '</option>';
        }).join('');
      selCat.value = garde;
    }

    var selVille = $('#f-ville');
    if (selVille) {
      var gardeV = selVille.value;
      /* Les communes réellement représentées d'abord, puis le reste du pays. */
      var villes = BW.list('villes');
      var communes = {};
      BW.list('prestataires', { statut: 'valide' }).forEach(function (p) {
        if (p.commune) communes[p.commune] = true;
      });
      var abidjan = villes.filter(function (v) { return communes[v]; });
      var ailleurs = villes.filter(function (v) { return !communes[v]; });
      selVille.innerHTML = '<option value="">Où ?</option>' +
        (abidjan.length
          ? '<optgroup label="Où nous avons des prestataires">' +
            abidjan.map(function (v) { return '<option value="' + esc(v) + '">' + esc(v) + '</option>'; }).join('') +
            '</optgroup>' : '') +
        (ailleurs.length
          ? '<optgroup label="Ailleurs en Côte d’Ivoire">' +
            ailleurs.map(function (v) { return '<option value="' + esc(v) + '">' + esc(v) + '</option>'; }).join('') +
            '</optgroup>' : '');
      selVille.value = gardeV;
    }

    /* Raccourcis : les cinq catégories les mieux pourvues. */
    var chips = $('#chips-rapides');
    if (chips) {
      chips.innerHTML = categories()
        .slice().sort(function (a, b) { return b.nb - a.nb; }).slice(0, 5)
        .map(function (c) {
          return '<a class="chip" href="' + lienCategorie(c.id) + '">' +
            '<svg class="ico"><use href="#' + esc(icone(c)) + '"></use></svg> ' +
            esc(c.singulier || c.label) + '</a>';
        }).join('');
    }
  }

  /* --- Compteurs de confiance ----------------------------------------- */
  function compteurs() {
    var bloc = $('#stats-accueil');
    if (!bloc) return;
    var s = BW.statsPubliques();
    $$('[data-bw-stat]', bloc).forEach(function (n) {
      var v = s[n.dataset.bwStat];
      if (v === undefined || v === null) return;
      n.dataset.count = v;
      /* Le « + » ne se justifie qu'à partir d'un volume réel. */
      n.dataset.suffix = v >= 50 ? '+' : '';
      n.textContent = '0';
    });
  }

  /* --- Grille des catégories ------------------------------------------ */
  function grilleCategories() {
    var grille = $('#grille-categories');
    if (!grille) return;
    var cats = categories();
    grille.innerHTML = cats.map(function (c) {
      return '<a class="cat" href="' + lienCategorie(c.id) + '">' +
        '<svg class="ico"><use href="#' + esc(icone(c)) + '"></use></svg>' +
        '<span class="nom">' + esc(c.label) + '</span>' +
        '<span class="nb">' + c.nb + ' pro' + (c.nb > 1 ? 's' : '') + '</span></a>';
    }).join('');
    var nb = $('[data-bw-texte="nb-categories"]');
    if (nb) nb.textContent = cats.length;
  }

  /* --- Prestataires vedettes ------------------------------------------ */
  function vedettes() {
    var rail = $('#rail-vedettes');
    if (!rail) return;
    var liste = BW.list('prestataires', { statut: 'valide' })
      .filter(function (p) { return p.sponsorise || p.certifie; })
      .sort(function (a, b) {
        if (a.sponsorise !== b.sponsorise) return a.sponsorise ? -1 : 1;
        return (b.note || 0) - (a.note || 0);
      })
      .slice(0, 8);

    /* À défaut de fiche mise en avant, on montre les mieux notées. */
    if (!liste.length) {
      liste = BW.list('prestataires', { statut: 'valide' })
        .sort(function (a, b) { return (b.note || 0) - (a.note || 0); }).slice(0, 8);
    }

    rail.innerHTML = liste.map(function (p) {
      return carteTuile(p, { categorie: true, bouton: 'btn-outline',
                             libelle: 'Voir le profil', zone: 'vedettes' });
    }).join('');
  }

  /* --- Témoignages ----------------------------------------------------- */
  function temoignages() {
    var rail = $('#rail-avis');
    if (!rail) return;
    var liste = BW.list('avis', { statut: 'publie' })
      .filter(function (a) { return a.note >= 4 && a.texte; })
      .sort(function (a, b) { return new Date(b.date) - new Date(a.date); })
      .slice(0, 8);

    if (!liste.length) { rail.innerHTML = ''; return; }

    rail.innerHTML = liste.map(function (a) {
      var couple = BW.couple(a.couple);
      var qui = (couple && couple.noms) || a.coupleNoms || 'Un couple Babi Wedding';
      var presta = BW.prestataire(a.prestataire);
      var ou = couple && couple.ville ? 'Mariés à ' + couple.ville
             : (presta ? 'À propos de ' + presta.nom : '');
      var etoiles = '';
      for (var i = 0; i < Math.round(a.note); i++) {
        etoiles += '<svg class="ico"><use href="#i-star"></use></svg>';
      }
      var portrait = (presta && presta.contact && presta.contact.avatar) ||
        'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=120&q=70';

      return '<article class="avis">' +
        '<div class="etoiles" aria-label="Note : ' + Math.round(a.note) + ' sur 5">' + etoiles + '</div>' +
        '<p class="txt">« ' + esc(a.texte) + ' »</p>' +
        '<div class="qui">' +
          '<img src="' + esc(portrait) + '" alt="" loading="lazy" width="120" height="120">' +
          '<div><b>' + esc(qui) + '</b><span>' + esc(ou) + '</span></div>' +
        '</div>' +
      '</article>';
    }).join('');
  }

  /* --- Articles à la une ----------------------------------------------- */
  function blogAccueil() {
    var rail = $('#blog-accueil');
    if (!rail) return;
    rail.innerHTML = BW.list('articles', { statut: 'publie' })
      .sort(function (a, b) { return new Date(b.date) - new Date(a.date); })
      .slice(0, 6)
      .map(function (a) { return carteArticle(a, true); }).join('');
  }

  /* =====================================================================
     2. CATALOGUE
     ===================================================================== */
  function catalogue() {
    var liste = $('#plist');
    if (!liste) return;

    var params = new URLSearchParams(location.search);
    var catId = params.get('categorie') || liste.dataset.categorie || 'photographes';
    var commune = params.get('ville');
    var cat = BW.categorie(catId);

    var tous = BW.list('prestataires', { statut: 'valide' })
      .filter(function (p) { return p.categorie === catId; })
      .sort(function (a, b) {
        if (a.sponsorise !== b.sponsorise) return a.sponsorise ? -1 : 1;
        return (b.note || 0) - (a.note || 0);
      });

    liste.innerHTML = tous.map(function (p) { return carteTuile(p, {}); }).join('') ||
      '<p class="muet" style="padding:30px 0">Aucun prestataire validé dans cette catégorie ' +
      'pour le moment. Revenez bientôt.</p>';

    /* --- Titre, fil d'Ariane et chapô ---------------------------------- */
    var label = cat ? cat.label : catId;
    var singulier = cat ? cat.singulier : catId;
    var titre = $('[data-bw-cat="titre"]');
    if (titre) titre.textContent = singulier + 's de mariage à Abidjan';
    var fil = $('[data-bw-cat="fil"]');
    if (fil) fil.textContent = label + ' mariage Abidjan';
    var chapo = $('[data-bw-cat="chapo"]');
    if (chapo) {
      chapo.textContent = tous.length + ' ' + (tous.length > 1 ? singulier.toLowerCase() + 's' : singulier.toLowerCase()) +
        ' vérifié' + (tous.length > 1 ? 's' : '') + ' par notre équipe. Comparez les portfolios, ' +
        'les avis certifiés et demandez jusqu’à 5 devis gratuits en une seule fois.';
    }
    document.title = label + ' mariage Abidjan 2026 — Babi Wedding';

    /* --- Communes proposées en raccourci ------------------------------- */
    var compte = {};
    tous.forEach(function (p) { compte[p.commune] = (compte[p.commune] || 0) + 1; });
    var communes = Object.keys(compte).sort(function (a, b) { return compte[b] - compte[a]; });

    var raccourcis = $('[data-bw-cat="communes"]');
    if (raccourcis) {
      raccourcis.innerHTML = communes.slice(0, 8).map(function (v) {
        return '<a class="chip' + (commune === v ? ' on' : '') + '" href="catalogue.html?categorie=' +
          encodeURIComponent(catId) + '&ville=' + encodeURIComponent(v) + '">' + esc(v) + '</a>';
      }).join('');
    }

    /* --- Filtre « Ville / Commune » ------------------------------------ */
    var bloc = $('#filtres');
    if (bloc) {
      var titreFiltre = bloc.querySelector('h4');
      if (titreFiltre) {
        var n = titreFiltre.nextElementSibling;
        while (n && n.classList.contains('chk')) { var suiv = n.nextElementSibling; n.remove(); n = suiv; }
        titreFiltre.insertAdjacentHTML('afterend', communes.slice().sort().map(function (v) {
          return '<label class="chk"><input type="checkbox" name="ville" value="' + esc(v) + '"' +
            (commune === v ? ' checked' : '') + '> ' + esc(v) +
            ' <span class="n">' + compte[v] + '</span></label>';
        }).join(''));
      }
    }

    /* --- Décompte des résultats ---------------------------------------- */
    var nb = $('#result-count');
    if (nb && nb.parentNode) {
      nb.parentNode.innerHTML = '<strong id="result-count">' + tous.length + '</strong> ' +
        esc(label.toLowerCase()) + (tous.length > 1 ? ' correspondent' : ' correspond') +
        ' à votre recherche';
    }
  }

  /* =====================================================================
     3. BLOG
     ===================================================================== */
  function blog() {
    var grille = $('#blog-liste');
    if (!grille) return;
    var articles = BW.list('articles', { statut: 'publie' })
      .sort(function (a, b) { return new Date(b.date) - new Date(a.date); });
    grille.innerHTML = articles.map(function (a) { return carteArticle(a, false); }).join('') ||
      '<p class="muet">Aucun article publié pour le moment.</p>';
  }

  /* =====================================================================
     4. PAGE ARTICLE
     Le gabarit du HTML sert de secours : on ne remplace une zone que si
     la base a réellement quelque chose à y mettre.
     ===================================================================== */
  var vuesComptees = false;

  function article() {
    var slug = new URLSearchParams(location.search).get('slug');
    if (!slug) return;
    var a = BW.list('articles').filter(function (x) {
      return x.slug === slug || x.id === slug;
    })[0];
    if (!a) return;

    function poser(zone, valeur, html) {
      if (valeur === undefined || valeur === null || valeur === '') return;
      $$('[data-bw-article="' + zone + '"]').forEach(function (n) {
        if (n.tagName === 'IMG') n.src = valeur;
        else if (html) n.innerHTML = valeur;
        else n.textContent = valeur;
      });
    }

    poser('titre', a.titre);
    poser('titre-court', a.titre.length > 46 ? a.titre.slice(0, 44) + '…' : a.titre);
    poser('categorie', a.categorie);
    poser('auteur', a.auteur);
    poser('date', BW.date(a.date));
    poser('image', a.image);
    poser('contenu', a.contenu, true);

    document.title = a.titre + ' — Babi Wedding';
    var meta = document.querySelector('meta[name="description"]');
    if (meta && a.metaDesc) meta.setAttribute('content', a.metaDesc);

    /* Une vue comptée une fois par ouverture de page. */
    if (!vuesComptees && BW.mode === 'supabase' && BW.base && a.slug) {
      vuesComptees = true;
      BW.base.rpc('incrementer_vues', { article_slug: a.slug });
    }
  }

  /* =====================================================================
     5. ORCHESTRATION
     ===================================================================== */
  var blocs = [rechercheAccueil, compteurs, grilleCategories, vedettes,
               temoignages, blogAccueil, catalogue, blog, article];

  function rendre() {
    blocs.forEach(function (fn) {
      try { fn(); } catch (e) {
        if (window.console) console.warn('[Babi Wedding] Rendu ' + fn.name, e);
      }
    });
  }

  rendre();

  /* --- Mise à jour en direct ------------------------------------------
     « bw:change » part à chaque écriture, locale ou distante. On regroupe
     les rafales — la validation d'un profil touche plusieurs tables — puis
     on rejoue le rendu et on rebranche les comportements de main.js.
     -------------------------------------------------------------------- */
  /* Les totaux viennent d'une fonction SQL : la base les renvoie un instant
     après la modification, on rafraîchit alors les seuls compteurs. */
  window.addEventListener('bw:totaux', function () {
    try {
      compteurs();
      if (window.BW_MAIN) window.BW_MAIN.compteurs();
    } catch (e) { /* sans conséquence sur le reste de la page */ }
  });

  var minuteur = null;
  window.addEventListener('bw:change', function () {
    clearTimeout(minuteur);
    minuteur = setTimeout(function () {
      rendre();
      var M = window.BW_MAIN;
      if (!M) return;
      try {
        M.images();
        M.carousel();
        M.compteurs();
        M.apparition();
        M.catalogue();
        M.blog();
      } catch (e) {
        if (window.console) console.warn('[Babi Wedding] Rebranchement', e);
      }
    }, 220);
  });
})();
