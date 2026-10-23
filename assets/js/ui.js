/* ==========================================================================
   BABI WEDDING — utilitaires d'interface partagés
   Routage par ancre, modale, notification, barre latérale, tableaux.
   Utilisé par le panel admin, le portail prestataire et la marketplace.
   ========================================================================== */
(function (global) {
  'use strict';

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var esc = function (s) { return global.BW ? BW.esc(s) : String(s == null ? '' : s); };

  /* ---------- Icône SVG ---------- */
  function ico(nom, classe) {
    return '<svg class="ico ' + (classe || '') + '"><use href="#i-' + nom + '"></use></svg>';
  }

  /* ---------- Pastille de statut ---------- */
  function tag(statut, libelles) {
    var texte = (libelles && libelles[statut]) || statut;
    var ton = global.BW ? BW.ton(statut) : '';
    return '<span class="tag ' + ton + '">' + esc(texte) + '</span>';
  }

  /* ---------- Notification ---------- */
  var toastTimer = null;
  function toast(message) {
    var el = $('#toast');
    if (!el) { return; }
    $('span', el).textContent = message;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('show'); }, 2800);
  }

  /* ---------- Modale ---------- */
  function modale(titre, corps, pied, large) {
    var m = $('#modale');
    if (!m) return;
    $('#modale-boite', m).className = 'modale-boite' + (large ? ' large' : '');
    $('#modale-boite', m).innerHTML =
      '<div class="modale-tete"><h3 id="modale-titre">' + esc(titre) + '</h3>' +
      '<button class="btn-ico" data-fermer aria-label="Fermer">' + ico('x') + '</button></div>' +
      '<div class="modale-corps">' + corps + '</div>' +
      (pied ? '<div class="modale-pied">' + pied + '</div>' : '');
    m.classList.add('open');
    document.body.style.overflow = 'hidden';
    var premier = m.querySelector('input, select, textarea, button:not([data-fermer])');
    if (premier) premier.focus();
  }

  function fermerModale() {
    var m = $('#modale');
    if (!m) return;
    m.classList.remove('open');
    document.body.style.overflow = '';
  }

  /* ---------- Confirmation ---------- */
  function confirmer(titre, texte, libelleAction, action, danger) {
    modale(titre,
      '<p style="color:var(--texte)">' + esc(texte) + '</p>',
      '<button class="btn btn-neutre" data-fermer>Annuler</button>' +
      '<button class="btn ' + (danger ? 'btn-rouge' : 'btn-primary') + '" id="confirmer-ok">' + esc(libelleAction) + '</button>'
    );
    var ok = $('#confirmer-ok');
    if (ok) ok.addEventListener('click', function () { fermerModale(); action(); });
  }

  /* ---------- État vide ---------- */
  function vide(icone, titre, texte) {
    return '<div class="vide">' + ico(icone) + '<b>' + esc(titre) + '</b>' +
           '<span class="petit">' + esc(texte) + '</span></div>';
  }

  /* ---------- Barre latérale mobile ---------- */
  function initSide() {
    var side = $('#side'), scrim = $('#scrim'), burger = $('#burger');
    if (!side || !burger) return;
    var basculer = function (ouvrir) {
      side.classList.toggle('open', ouvrir);
      if (scrim) scrim.classList.toggle('open', ouvrir);
      document.body.style.overflow = ouvrir ? 'hidden' : '';
    };
    burger.addEventListener('click', function () { basculer(!side.classList.contains('open')); });
    if (scrim) scrim.addEventListener('click', function () { basculer(false); });
    $$('#nav a').forEach(function (a) {
      a.addEventListener('click', function () {
        if (global.matchMedia('(max-width:1099px)').matches) basculer(false);
      });
    });
  }

  /* ---------- Routage par ancre ---------- */
  function routeur(vues, defaut) {
    function rendre() {
      var hash = (location.hash || '#/').replace(/^#\/?/, '');
      var parts = hash.split('/');
      var nom = parts[0] || defaut;
      var arg = parts[1] || null;
      var vue = vues[nom] || vues[defaut];

      $$('#nav a').forEach(function (a) {
        a.classList.toggle('on', a.getAttribute('data-vue') === nom);
      });

      var cible = $('#vue');
      if (cible) {
        cible.innerHTML = vue.html(arg);
        if (vue.apres) vue.apres(arg);
        cible.scrollTop = 0;
        global.scrollTo(0, 0);
      }
      var titre = $('#titre');
      if (titre) titre.textContent = vue.titre || '';
      document.title = (vue.titre ? vue.titre + ' — ' : '') + (global.BW_APP_NOM || 'Babi Wedding');
    }
    global.addEventListener('hashchange', rendre);
    rendre();
    return rendre;
  }

  /* ---------- Filtrage d'un tableau déjà rendu ---------- */
  function filtrerLignes(selecteurLignes, terme, compteurSel) {
    var t = (terme || '').trim().toLowerCase();
    var n = 0;
    $$(selecteurLignes).forEach(function (tr) {
      var visible = !t || tr.textContent.toLowerCase().indexOf(t) > -1;
      tr.classList.toggle('hide', !visible);
      if (visible) n++;
    });
    if (compteurSel) { var c = $(compteurSel); if (c) c.textContent = n; }
    return n;
  }

  /* ---------- Graphique en barres ---------- */
  function chart(donnees, cleValeur, cleLabel) {
    var max = Math.max.apply(null, donnees.map(function (d) { return d[cleValeur]; })) || 1;
    return '<div class="chart">' + donnees.map(function (d) {
      var h = Math.round((d[cleValeur] / max) * 100);
      return '<div class="col">' +
        '<b>' + Number(d[cleValeur]).toLocaleString('fr-FR') + '</b>' +
        '<div class="barre" style="height:' + h + '%"></div>' +
        '<span>' + esc(d[cleLabel]) + '</span>' +
        '</div>';
    }).join('') + '</div>';
  }

  /* ---------- Écoutes globales ---------- */
  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-fermer]')) { e.preventDefault(); fermerModale(); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') fermerModale();
  });

  global.UI = {
    $: $, $$: $$, esc: esc, ico: ico, tag: tag,
    toast: toast, modale: modale, fermerModale: fermerModale, confirmer: confirmer,
    vide: vide, initSide: initSide, routeur: routeur,
    filtrerLignes: filtrerLignes, chart: chart
  };
})(window);
