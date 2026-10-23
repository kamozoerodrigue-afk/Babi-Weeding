/* ==========================================================================
   BABI WEDDING — écran de connexion et de création de compte
   ========================================================================== */
(function () {
  'use strict';

  var $ = function (s) { return document.querySelector(s); };
  var params = new URLSearchParams(location.search);
  var retour = params.get('retour');
  var roleDemande = params.get('role');

  var msg = $('#msg');
  function dire(texte, ton) {
    msg.textContent = texte;
    msg.className = 'auth-msg ' + (ton || 'info');
  }
  function taire() { msg.className = 'auth-msg'; msg.textContent = ''; }

  /* ---------- Mode démonstration : aucun compte n'est nécessaire ---------- */
  if (BW.mode !== 'supabase') {
    dire('La base de données n’est pas encore configurée : les pages fonctionnent ' +
         'en démonstration hors ligne, sans compte. Renseignez assets/js/config.js ' +
         'pour activer les comptes.', 'info');
    $('#f-connexion').querySelectorAll('input, button').forEach(function (n) { n.disabled = true; });
    $('#f-inscription').querySelectorAll('input, button').forEach(function (n) { n.disabled = true; });
    return;
  }

  if (roleDemande === 'admin') $('#sous').textContent = 'Espace réservé à l’équipe Babi Wedding.';
  if (roleDemande === 'prestataire') $('#sous').textContent = 'Espace réservé aux professionnels.';

  /* ---------- Bascule connexion / inscription ---------- */
  var ongC = $('#ong-connexion'), ongI = $('#ong-inscription');
  function onglet(vers) {
    taire();
    var inscription = vers === 'inscription';
    ongC.classList.toggle('on', !inscription);
    ongI.classList.toggle('on', inscription);
    $('#f-connexion').hidden = inscription;
    $('#f-inscription').hidden = !inscription;
  }
  ongC.addEventListener('click', function () { onglet('connexion'); });
  ongI.addEventListener('click', function () { onglet('inscription'); });

  if (roleDemande === 'prestataire') {
    var r = document.querySelector('input[name="role"][value="prestataire"]');
    if (r) r.checked = true;
  }

  /* ---------- Destination après connexion ---------- */
  function destination(role) {
    if (retour) return retour;
    if (role === 'admin') return 'admin/index.html';
    if (role === 'prestataire') return 'pro/index.html';
    return 'app/index.html';
  }

  function traduire(e) {
    var m = (e && e.message) || '';
    if (/Invalid login credentials/i.test(m)) return 'Adresse ou mot de passe incorrect.';
    if (/Email not confirmed/i.test(m))       return 'Votre adresse n’est pas encore confirmée. Vérifiez votre boîte de réception.';
    if (/User already registered/i.test(m))   return 'Un compte existe déjà avec cette adresse.';
    if (/Password should be/i.test(m))        return 'Le mot de passe doit compter au moins 8 caractères.';
    if (/rate limit|Too many/i.test(m))       return 'Trop de tentatives. Réessayez dans quelques minutes.';
    return m || 'Une erreur est survenue.';
  }

  /* ---------- Connexion ---------- */
  $('#f-connexion').addEventListener('submit', function (e) {
    e.preventDefault();
    var bouton = $('#c-envoi');
    var mail = $('#c-mail').value.trim(), mdp = $('#c-mdp').value;
    if (!mail || !mdp) return dire('Renseignez votre adresse et votre mot de passe.', 'err');
    bouton.disabled = true; bouton.textContent = 'Connexion…';
    taire();
    BW.auth.connexion(mail, mdp).then(function () {
      var role = BW.auth.role();
      if (roleDemande && role !== roleDemande && role !== 'admin') {
        throw new Error('Ce compte n’a pas accès à cet espace.');
      }
      location.replace(destination(role));
    }).catch(function (err) {
      dire(traduire(err), 'err');
      bouton.disabled = false; bouton.textContent = 'Se connecter';
    });
  });

  /* ---------- Création de compte ---------- */
  $('#f-inscription').addEventListener('submit', function (e) {
    e.preventDefault();
    var bouton = $('#i-envoi');
    var nom = $('#i-nom').value.trim();
    var mail = $('#i-mail').value.trim();
    var mdp = $('#i-mdp').value;
    var role = (document.querySelector('input[name="role"]:checked') || {}).value || 'couple';
    if (!nom || !mail || mdp.length < 8) {
      return dire('Nom, adresse et mot de passe de 8 caractères minimum sont requis.', 'err');
    }
    bouton.disabled = true; bouton.textContent = 'Création…';
    taire();
    BW.auth.inscription(mail, mdp, { nom: nom, role: role }).then(function (donnees) {
      /* Selon les réglages du projet, Supabase peut exiger une confirmation
         par courriel avant d'ouvrir la session. */
      if (!donnees.session) {
        dire('Compte créé. Ouvrez le courriel de confirmation que nous venons ' +
             'de vous envoyer, puis revenez vous connecter.', 'ok');
        bouton.disabled = false; bouton.textContent = 'Créer mon compte';
        return;
      }
      if (role === 'couple') {
        BW.create('couples', { profil: donnees.user.id, noms: nom, email: mail, statut: 'actif' });
      }
      return BW.ecrituresTerminees().then(function () {
        location.replace(destination(role));
      });
    }).catch(function (err) {
      dire(traduire(err), 'err');
      bouton.disabled = false; bouton.textContent = 'Créer mon compte';
    });
  });

  /* ---------- Mot de passe oublié ---------- */
  $('#oubli').addEventListener('click', function (e) {
    e.preventDefault();
    var mail = $('#c-mail').value.trim();
    if (!mail) return dire('Saisissez d’abord votre adresse électronique.', 'err');
    BW.auth.motDePasseOublie(mail).then(function () {
      dire('Un lien de réinitialisation vient de vous être envoyé.', 'ok');
    }).catch(function (err) { dire(traduire(err), 'err'); });
  });
})();
