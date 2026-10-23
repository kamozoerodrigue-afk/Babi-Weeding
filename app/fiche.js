/* ==========================================================================
   BABI WEDDING — fiche prestataire de la marketplace
   Mise en page reprise de la page logement Airbnb : galerie en mosaïque,
   colonne de contenu à gauche, encadré de demande de devis collant à droite.
   ========================================================================== */
(function () {
  'use strict';

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var esc = function (s) { return BW.esc(s); };
  var ico = function (n, c) { return '<svg class="ico ' + (c || '') + '"><use href="#i-' + n + '"></use></svg>'; };

  var tmr = null;
  function toast(msg) {
    var el = $('#toast');
    $('span', el).textContent = msg;
    el.classList.add('show');
    clearTimeout(tmr);
    tmr = setTimeout(function () { el.classList.remove('show'); }, 3200);
  }

  var id = new URLSearchParams(location.search).get('id');
  var p = id ? BW.prestataire(id) : null;

  if (!p || p.statut !== 'valide') {
    $('#vue').innerHTML =
      '<div class="vide-etat" style="padding-top:80px"><span class="rond">' + ico('search') + '</span>' +
      '<b>' + (p ? 'Ce profil n\'est pas publié' : 'Prestataire introuvable') + '</b>' +
      '<p>' + (p ? 'Il est en cours de validation ou a été suspendu par notre équipe.'
                 : 'Le lien est peut-être incorrect ou le profil a été retiré.') + '</p>' +
      '<a class="btn btn-primary" href="index.html">Retour au catalogue</a></div>';
    document.title = 'Prestataire introuvable — Babi Wedding';
  } else {
    rendre();
  }

  function rendre() {
    var services = BW.servicesDe(p.id);
    var avis = BW.list('avis', { prestataire: p.id, statut: 'publie' });
    var cat = BW.categorie(p.categorie);
    var similaires = BW.list('prestataires', { categorie: p.categorie, statut: 'valide' })
      .filter(function (x) { return x.id !== p.id; }).slice(0, 4);
    var photos = p.photos.slice(0, 5);

    document.title = p.nom + ' — ' + BW.labelCategorie(p.categorie) + ' à ' + p.commune + ' | Babi Wedding';

    $('#vue').innerHTML = '' +
      '<nav class="fil" aria-label="Fil d\'Ariane">' +
        '<a href="index.html">Prestataires</a><span>/</span>' +
        '<a href="index.html">' + esc(cat ? cat.label : '') + '</a><span>/</span>' +
        '<span>' + esc(p.nom) + '</span>' +
      '</nav>' +

      '<div class="fiche-tete">' +
        '<div class="fill">' +
          '<h1>' + esc(p.nom) + '</h1>' +
          '<div class="fiche-meta">' +
            (p.note ? '<span class="note">' + ico('star') + BW.note(p.note) + '</span>' +
              '<span class="sep">·</span><u>' + p.avis + ' avis certifiés</u><span class="sep">·</span>' : '') +
            '<span>' + esc(BW.labelCategorie(p.categorie)) + '</span><span class="sep">·</span>' +
            '<span>' + esc(p.commune) + ', ' + esc(p.ville) + '</span>' +
            (p.certifie ? '<span class="badge-or">' + ico('check') + ' Certifié Or</span>' : '') +
          '</div>' +
        '</div>' +
        '<div style="display:flex;gap:8px">' +
          '<button class="btn btn-neutre btn-sm" id="partager">' + ico('share', 'ico-sm') + ' Partager</button>' +
          '<button class="btn btn-neutre btn-sm" id="favori">' + ico('heart', 'ico-sm') + ' <span>Enregistrer</span></button>' +
        '</div>' +
      '</div>' +

      '<div class="galerie">' + photos.map(function (u, i) {
        return '<img class="g' + (i + 1) + '" src="' + esc(u) + '" alt="' + esc(p.nom) + ', photo ' + (i + 1) + '" ' +
          (i === 0 ? '' : 'loading="lazy" ') + 'width="900" height="600">';
      }).join('') + '</div>' +

      '<div class="fiche-corps">' +
        '<div>' +
          '<section class="bloc">' +
            '<div class="hote">' +
              '<img src="' + esc(p.contact.avatar) + '" alt="" width="110" height="110" loading="lazy">' +
              '<div><b>Votre contact : ' + esc(p.contact.nom) + '</b><br>' +
                '<span>' + esc(p.contact.role) + ' · sur Babi Wedding depuis ' +
                new Date(p.inscritLe).getFullYear() + '</span></div>' +
            '</div>' +
          '</section>' +

          '<section class="bloc"><div class="atouts">' +
            atout('clock', p.delaiReponse || 'Délai de réponse non renseigné', 'Délai moyen constaté sur la plateforme') +
            atout('shield', 'Profil vérifié', 'Pièce d\'identité et portfolio contrôlés par notre équipe') +
            atout('lock', 'Acompte sécurisé', 'Conservé en séquestre via Paystack jusqu\'à la prestation') +
            (p.capacite ? atout('users', esc(p.capacite), 'Capacité d\'accueil') : '') +
          '</div></section>' +

          '<section class="bloc"><h2>À propos</h2><p>' + esc(p.description) + '</p></section>' +

          (services.length ? '<section class="bloc"><h2>Prestations et tarifs</h2>' +
            '<div class="services">' + services.map(function (s) {
              return '<div class="service">' +
                '<div class="haut"><div><h3>' + esc(s.nom) + '</h3>' +
                  '<p class="petit mt-8">' + esc(s.description) + '</p></div>' +
                  '<div class="tarif"><b>' + BW.fcfa(s.prix) + '</b>' +
                    '<span>/ ' + esc(s.unite) + (s.duree ? ' · ' + esc(s.duree) : '') + '</span></div></div>' +
                (s.inclus && s.inclus.length ? '<ul>' + s.inclus.map(function (i) {
                  return '<li>' + ico('check', 'ico-sm') + ' ' + esc(i) + '</li>'; }).join('') + '</ul>' : '') +
                '</div>';
            }).join('') + '</div></section>' : '') +

          '<section class="bloc"><h2>Moyens de paiement acceptés</h2>' +
            '<div style="display:flex;flex-wrap:wrap;gap:8px">' +
              ['Orange Money', 'MTN MoMo', 'Wave', 'Visa', 'Mastercard'].map(function (m) {
                return '<span style="border:1px solid var(--bordure);border-radius:var(--r-sm);' +
                  'padding:6px 12px;font-size:13px;color:var(--gris);font-weight:600">' + m + '</span>';
              }).join('') + '</div>' +
          '</section>' +

          (avis.length ? '<section class="bloc">' +
            '<h2><span class="note" style="display:inline-flex;align-items:center;gap:6px">' +
              ico('star') + BW.note(p.note) + '</span> · ' + avis.length + ' avis certifiés</h2>' +
            '<div class="avis-liste mt-16">' + avis.map(function (a) {
              var c = BW.couple(a.couple);
              return '<div class="avis-item">' +
                '<div class="qui"><img class="ico" style="width:42px;height:42px;border-radius:50%;background:var(--fond-gris)" ' +
                  'src="https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=100&q=72" alt="" width="84" height="84" loading="lazy">' +
                  '<div><b>' + esc(c ? c.noms : 'Couple vérifié') + '</b><br>' +
                  '<span>' + BW.date(a.date) + '</span></div></div>' +
                '<div class="etoiles">' + Array(Math.round(a.note) + 1).join(ico('star')) + '</div>' +
                '<p style="font-size:15px;color:#3A3A3A">« ' + esc(a.texte) + ' »</p>' +
                '</div>';
            }).join('') + '</div></section>' : '') +

          (similaires.length ? '<section class="bloc"><h2>Prestataires similaires</h2>' +
            '<div class="grille-cartes" style="padding-bottom:0;margin-top:16px">' +
            similaires.map(function (s) {
              return '<a class="tuile" href="prestataire.html?id=' + esc(s.id) + '">' +
                '<div class="media"><img src="' + esc(s.photos[0]) + '" alt="' + esc(s.nom) + '" ' +
                  'style="width:100%;height:100%;object-fit:cover" loading="lazy" width="500" height="500"></div>' +
                '<span class="ligne1"><span class="nom">' + esc(s.nom) + '</span>' +
                  (s.note ? '<span class="note">' + ico('star') + BW.note(s.note) + '</span>' : '') + '</span>' +
                '<span class="sous">' + esc(s.commune) + '</span>' +
                '<span class="prix"><b>À partir de ' + BW.fcfa(s.prixMin) + '</b></span></a>';
            }).join('') + '</div></section>' : '') +
        '</div>' +

        '<aside><form class="encadre" id="form-devis">' +
          '<div class="prix"><b>' + BW.fcfa(p.prixMin) + '</b><span>à partir de, ' + esc(p.unite) + '</span></div>' +

          '<div class="champ"><label for="d-date">Date du mariage</label>' +
            '<input class="inp" type="date" id="d-date" required></div>' +

          '<div class="champ"><label for="d-invites">Nombre d\'invités</label>' +
            '<select class="inp" id="d-invites">' +
              ['Moins de 100', '100 à 200', '200 à 400', 'Plus de 400'].map(function (g) {
                return '<option' + (g === '100 à 200' ? ' selected' : '') + '>' + g + '</option>';
              }).join('') + '</select></div>' +

          '<div class="champ"><label for="d-msg">Votre message</label>' +
            '<textarea class="inp" id="d-msg" placeholder="Précisez le déroulé de la journée, le lieu et vos attentes."></textarea></div>' +

          '<button type="submit" class="btn btn-primary btn-block">Demander un devis gratuit</button>' +
          '<p class="note-bas">Sans engagement. ' + esc(p.delaiReponse || '') + '</p>' +

          '<div class="rassure">' + ico('lock') +
            '<p>Vos coordonnées restent masquées. Les échanges passent par la messagerie sécurisée et ' +
            'l\'acompte est conservé en séquestre jusqu\'à confirmation de la prestation.</p></div>' +
        '</form></aside>' +
      '</div>';

    activer();
  }

  function atout(icone, titre, sous) {
    return '<div class="atout">' + ico(icone) +
      '<div><b>' + titre + '</b><span>' + esc(sous) + '</span></div></div>';
  }

  function activer() {
    var CLE_FAV = 'BW_FAVORIS';
    function favoris() {
      try { return JSON.parse(localStorage.getItem(CLE_FAV) || '[]'); } catch (e) { return []; }
    }

    var btnFav = $('#favori');
    function majFav() {
      var actif = favoris().indexOf(p.id) > -1;
      btnFav.classList.toggle('on', actif);
      $('span', btnFav).textContent = actif ? 'Enregistré' : 'Enregistrer';
      $('.ico', btnFav).style.fill = actif ? 'var(--corail)' : 'none';
      btnFav.style.color = actif ? 'var(--corail)' : '';
    }
    btnFav.addEventListener('click', function () {
      var f = favoris();
      var i = f.indexOf(p.id);
      if (i > -1) f.splice(i, 1); else f.push(p.id);
      try { localStorage.setItem(CLE_FAV, JSON.stringify(f)); } catch (e) { /* ignoré */ }
      majFav();
      toast(i === -1 ? 'Ajouté à vos favoris' : 'Retiré de vos favoris');
    });
    majFav();

    $('#partager').addEventListener('click', function () {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(location.href).then(function () {
          toast('Lien copié dans le presse-papiers');
        });
      }
    });

    $('#form-devis').addEventListener('submit', function (e) {
      e.preventDefault();
      var date = $('#d-date').value;
      if (!date) { toast('Indiquez la date de votre mariage'); return; }

      var tranche = $('#d-invites').value;
      var invites = { 'Moins de 100': 80, '100 à 200': 150, '200 à 400': 300, 'Plus de 400': 450 }[tranche] || 150;

      /* Le dossier du couple connecté s'il existe ; sinon la demande part
         sans dossier et l'administration la rattachera. */
      var monCouple = BW.auth && BW.auth.monCouple && BW.auth.monCouple();

      BW.create('devis', {
        couple: monCouple ? monCouple.id : null,
        prestataire: p.id,
        statut: 'attente',
        montant: null,
        envoyeLe: new Date().toISOString().slice(0, 10),
        dateEvenement: date,
        invites: invites,
        message: $('#d-msg').value.trim() || 'Demande envoyée depuis la marketplace.',
        contactNom: monCouple ? monCouple.noms : ($('#d-nom') ? $('#d-nom').value.trim() : ''),
        contactEmail: monCouple ? monCouple.email : ($('#d-mail') ? $('#d-mail').value.trim() : '')
      });

      toast('Demande envoyée — ' + p.nom + ' ' + (p.delaiReponse || 'vous répondra rapidement').toLowerCase());
      $('#form-devis').reset();
    });
  }

  var annee = $('#annee');
  if (annee) annee.textContent = new Date().getFullYear();
})();
