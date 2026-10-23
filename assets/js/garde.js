/* ==========================================================================
   BABI WEDDING — garde d'accès

   Placé en tête de BW.boot sur les pages réservées, ce script renvoie vers
   l'écran de connexion quand le rôle du compte ne correspond pas.
   Le rôle attendu se déclare sur la balise <body> :  data-bw-role="admin".

   En mode démonstration hors ligne, la garde laisse passer : le projet
   reste ouvrable par double-clic, sans base ni compte.
   ========================================================================== */
(function () {
  'use strict';

  var attendu = document.body && document.body.dataset.bwRole;
  if (!attendu) return;
  if (BW.mode !== 'supabase') return;

  var racine = location.pathname.indexOf('/admin/') > -1 ||
               location.pathname.indexOf('/pro/') > -1 ||
               location.pathname.indexOf('/app/') > -1 ? '../' : '';

  var role = BW.auth.role();
  var autorise = role === attendu || role === 'admin';

  if (!autorise) {
    location.replace(racine + 'connexion.html?role=' + encodeURIComponent(attendu) +
      '&retour=' + encodeURIComponent(location.pathname + location.search));
    /* On stoppe le rendu de la page le temps de la redirection. */
    throw new Error('Redirection vers la connexion');
  }

  /* Identité affichée dans le pied de la barre latérale. */
  var profil = BW.auth.profil || {};
  var nom = document.getElementById('user-nom');
  var fonction = document.getElementById('user-role');
  var LIBELLES = { admin: 'Administrateur', prestataire: 'Prestataire', couple: 'Compte couple' };
  if (nom) nom.textContent = profil.nom_complet || (BW.auth.utilisateur || {}).email || '—';
  if (fonction) fonction.textContent = LIBELLES[profil.role] || profil.role || '—';

  /* Bouton de déconnexion présent dans les gabarits applicatifs. */
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-bw-deconnexion]');
    if (!b) return;
    e.preventDefault();
    BW.auth.deconnexion().then(function () {
      location.replace(racine + 'connexion.html');
    });
  });
})();
