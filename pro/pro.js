/* ==========================================================================
   BABI WEDDING — portail prestataire
   Le prestataire gère ici son offre. Tout ce qu'il enregistre alimente
   la marketplace web et l'application mobile, qui lisent la même source.
   ========================================================================== */
(function () {
  'use strict';

  var $ = UI.$, $$ = UI.$$, esc = UI.esc, ico = UI.ico, tag = UI.tag;
  window.BW_APP_NOM = 'Espace Prestataire Babi Wedding';

  var rendre;
  var CLE_SESSION = 'BW_PRO_ID';

  /* ---------- Prestataire connecté ---------- */
  function moiId() {
    /* 1. La fiche rattachée au compte connecté fait foi. */
    var u = BW.auth && BW.auth.utilisateur;
    if (u) {
      var mienne = BW.list('prestataires').filter(function (x) {
        return x.proprietaire === u.id;
      })[0];
      if (mienne) return mienne.id;
    }
    /* 2. Sinon, la fiche choisie lors d'une session précédente. */
    var id;
    try { id = localStorage.getItem(CLE_SESSION); } catch (e) { id = null; }
    if (id && BW.prestataire(id)) return id;
    /* 3. Sinon, la première fiche visible (mode démonstration). */
    var premier = BW.list('prestataires', { statut: 'valide' })[0];
    return premier ? premier.id : null;
  }
  function moi() { return BW.prestataire(moiId()); }
  function setMoi(id) {
    try { localStorage.setItem(CLE_SESSION, id); } catch (e) { /* ignoré */ }
  }

  function kpi(icone, ton, libelle, valeur, variation) {
    return '<div class="kpi">' +
      '<div class="haut"><span class="rond ' + ton + '">' + ico(icone) + '</span>' +
      '<span class="lbl">' + esc(libelle) + '</span></div>' +
      '<div class="val">' + valeur + '</div>' +
      (variation ? '<div class="var ' + variation.sens + '">' +
        ico(variation.sens === 'up' ? 'arrow-up' : 'arrow-down') + esc(variation.texte) + '</div>' : '') +
      '</div>';
  }

  function etoiles(note, avis) {
    if (!note) return '<span class="muet petit">Aucun avis</span>';
    return '<span class="note-etoile">' + ico('star') + BW.note(note) +
      (avis ? ' <span>(' + avis + ')</span>' : '') + '</span>';
  }

  /* ================================================================
     1. TABLEAU DE BORD
     ================================================================ */
  var tableau = {
    titre: 'Tableau de bord',
    html: function () {
      var p = moi();
      if (!p) return UI.vide('briefcase', 'Aucun prestataire', 'Créez un profil depuis le panel administrateur.');

      var demandes = BW.list('devis', { prestataire: p.id });
      var attente = demandes.filter(function (q) { return q.statut === 'attente'; });
      var acceptes = demandes.filter(function (q) { return q.statut === 'accepte'; });
      var services = BW.servicesDe(p.id, true);
      var avis = BW.list('avis', { prestataire: p.id, statut: 'publie' });
      var ca = acceptes.reduce(function (s, q) { return s + (q.montant || 0); }, 0);
      var offre = BW.get('offres', p.abonnement);

      var tauxReponse = demandes.length
        ? Math.round(((demandes.length - attente.length) / demandes.length) * 100) : 100;

      return '' +
        '<div class="page-head"><div class="fill">' +
          '<h2>Bonjour ' + esc(p.contact.nom.split(' ')[0]) + '</h2>' +
          '<p>Voici l\'activité de <b>' + esc(p.nom) + '</b> sur la plateforme.</p>' +
        '</div>' +
        '<a class="btn btn-neutre" href="../app/prestataire.html?id=' + esc(p.id) + '" target="_blank" rel="noopener">' +
          ico('external') + ' Voir mon profil public</a></div>' +

        (p.statut === 'attente' ? '<div class="encart ambre" style="margin-bottom:20px">' + ico('clock') +
          '<p><b>Profil en cours de validation.</b> Notre équipe contrôle votre dossier sous 48 h. ' +
          'Vous pouvez déjà préparer vos services et votre portfolio, ils seront publiés dès la validation.</p></div>' : '') +

        (attente.length ? '<div class="encart" style="margin-bottom:20px">' + ico('inbox') +
          '<p><b>' + attente.length + ' demande' + (attente.length > 1 ? 's' : '') + ' sans réponse.</b> ' +
          'Les couples reçoivent en moyenne 5 devis : répondre vite double vos chances d\'être retenu. ' +
          '<a class="lien" href="#/demandes">Répondre maintenant</a></p></div>' : '') +

        '<div class="grille g4">' +
          kpi('inbox', '', 'Demandes reçues', demandes.length,
              attente.length ? { sens: 'down', texte: attente.length + ' sans réponse' } : null) +
          kpi('check-circle', 'vert', 'Devis acceptés', acceptes.length) +
          kpi('star', 'ambre', 'Note moyenne', BW.note(p.note) + (p.avis ? ' <span class="petit muet">(' + p.avis + ')</span>' : '')) +
          kpi('money', 'bleu', 'Chiffre d\'affaires signé', BW.fcfa(ca)) +
        '</div>' +

        '<div class="grille g-2-1 mt-16">' +
          '<div class="carte">' +
            '<div class="carte-tete"><h3>Dernières demandes</h3>' +
              '<a href="#/demandes" class="lien petit">Tout voir</a></div>' +
            (demandes.length ? '<div class="tbl-wrap"><table class="data" style="min-width:0"><thead><tr>' +
              '<th>Couple</th><th>Événement</th><th class="num">Montant</th><th>Statut</th><th class="actions"></th>' +
              '</tr></thead><tbody>' + demandes.slice(0, 5).map(function (q) {
                var c = BW.couple(q.couple);
                return '<tr><td><b>' + esc(c ? c.noms : '—') + '</b><br><span class="petit muet">' + esc(c ? c.ville : '') + '</span></td>' +
                  '<td class="petit">' + BW.dateCourte(q.dateEvenement) + '<br><span class="muet">' + q.invites + ' invités</span></td>' +
                  '<td class="num">' + BW.fcfa(q.montant) + '</td>' +
                  '<td>' + tag(q.statut, BW.STATUT_DEVIS) + '</td>' +
                  '<td class="actions">' + (q.statut === 'attente'
                    ? '<a class="btn btn-sm btn-primary" href="#/demandes">Répondre</a>' : '') + '</td></tr>';
              }).join('') + '</tbody></table></div>'
              : UI.vide('inbox', 'Aucune demande pour l\'instant', 'Complétez votre profil pour gagner en visibilité.')) +
          '</div>' +

          '<div>' +
            '<div class="carte">' +
              '<div class="carte-tete"><h3>Qualité du profil</h3></div>' +
              qualiteProfil(p, services, avis) +
            '</div>' +

            '<div class="carte">' +
              '<div class="carte-tete"><h3>Mon abonnement</h3></div>' +
              (offre ? '<div class="entre"><span class="tag or">' + esc(offre.nom) + '</span>' +
                '<b>' + BW.fcfa(offre.prix) + ' / mois</b></div>' +
                '<p class="petit mt-8">Prochain prélèvement le 1er septembre 2026.</p>' +
                '<a class="btn btn-neutre btn-sm btn-block mt-16" href="#/abonnement">Gérer mon abonnement</a>'
                : '<p class="petit">Aucun abonnement actif. Souscrivez pour recevoir des demandes.</p>' +
                  '<a class="btn btn-primary btn-sm btn-block mt-16" href="#/abonnement">Voir les offres</a>') +
            '</div>' +

            '<div class="carte">' +
              '<div class="carte-tete"><h3>Taux de réponse</h3></div>' +
              '<div class="entre"><span class="petit muet">Demandes traitées</span><b style="font-size:20px">' + tauxReponse + ' %</b></div>' +
              '<div class="jauge mt-8"><i style="width:' + tauxReponse + '%"></i></div>' +
              '<p class="petit mt-8">Affiché sur votre fiche publique : « ' + esc(p.delaiReponse) + ' ».</p>' +
            '</div>' +
          '</div>' +
        '</div>';
    }
  };

  function qualiteProfil(p, services, avis) {
    var criteres = [
      { ok: !!p.accroche, texte: 'Accroche renseignée' },
      { ok: (p.description || '').length > 120, texte: 'Description détaillée' },
      { ok: p.photos.length >= 3, texte: 'Au moins 3 photos au portfolio' },
      { ok: services.length >= 2, texte: 'Au moins 2 services décrits' },
      { ok: services.some(function (s) { return s.actif; }), texte: 'Un service actif' },
      { ok: avis.length > 0, texte: 'Au moins un avis publié' },
      { ok: p.certifie, texte: 'Badge Certifié Or obtenu' }
    ];
    var faits = criteres.filter(function (c) { return c.ok; }).length;
    var pct = Math.round((faits / criteres.length) * 100);
    return '<div class="entre"><span class="petit muet">Complétude</span>' +
      '<b style="font-size:20px">' + pct + ' %</b></div>' +
      '<div class="jauge mt-8"><i style="width:' + pct + '%"></i></div>' +
      '<ul class="pile-v petit mt-16">' + criteres.map(function (c) {
        return '<li style="display:flex;gap:8px;align-items:flex-start;color:' +
          (c.ok ? 'var(--gris)' : 'var(--texte)') + '">' +
          ico(c.ok ? 'check-circle' : 'x-circle', 'ico-sm') +
          '<span>' + esc(c.texte) + '</span></li>';
      }).join('') + '</ul>';
  }

  /* ================================================================
     2. MES SERVICES
     ================================================================ */
  var services = {
    titre: 'Mes services',
    html: function () {
      var p = moi();
      var liste = BW.servicesDe(p.id, true);
      return '' +
        '<div class="page-head"><div class="fill">' +
          '<h2>' + liste.length + ' service' + (liste.length > 1 ? 's' : '') + '</h2>' +
          '<p>Ce que vous décrivez ici s\'affiche sur votre fiche, sur la marketplace et dans l\'application mobile.</p>' +
        '</div>' +
        '<button class="btn btn-primary" id="add-svc">' + ico('plus') + ' Ajouter un service</button></div>' +

        '<div class="encart info" style="margin-bottom:20px">' + ico('bulb') +
          '<p><b>Conseil.</b> Un tarif de départ visible augmente le nombre de demandes. Les couples filtrent par budget : ' +
          'un profil sans prix apparaît rarement dans leurs résultats.</p></div>' +

        (liste.length ? '<div class="grille g2">' + liste.map(carteService).join('') + '</div>'
          : '<div class="plat">' + UI.vide('list', 'Aucun service', 'Décrivez vos prestations pour apparaître dans les recherches.') + '</div>');
    },
    apres: function () {
      $('#add-svc').addEventListener('click', function () { formulaireService(null); });
      $$('[data-edit-svc]').forEach(function (b) {
        b.addEventListener('click', function () {
          formulaireService(BW.get('services', b.getAttribute('data-edit-svc')));
        });
      });
      $$('[data-toggle-svc]').forEach(function (b) {
        b.addEventListener('click', function () {
          var s = BW.get('services', b.getAttribute('data-toggle-svc'));
          BW.update('services', s.id, { actif: !s.actif });
          UI.toast(s.actif ? 'Service masqué du catalogue' : 'Service publié'); rendre();
        });
      });
      $$('[data-del-svc]').forEach(function (b) {
        b.addEventListener('click', function () {
          UI.confirmer('Supprimer ce service', 'Il disparaîtra de votre fiche publique.', 'Supprimer', function () {
            BW.remove('services', b.getAttribute('data-del-svc'));
            UI.toast('Service supprimé'); rendre();
          }, true);
        });
      });
    }
  };

  function carteService(s) {
    return '<div class="carte">' +
      '<div class="entre" style="align-items:flex-start">' +
        '<div style="flex:1"><h3>' + esc(s.nom) + '</h3>' +
          '<p class="petit mt-8">' + esc(s.description) + '</p></div>' +
        (s.actif ? '<span class="tag ok">Actif</span>' : '<span class="tag">Masqué</span>') +
      '</div>' +
      '<div class="sep"></div>' +
      '<div class="entre">' +
        '<div><div class="petit muet">Tarif</div>' +
          '<b style="font-size:18px">' + BW.fcfa(s.prix) + '</b> <span class="petit muet">/ ' + esc(s.unite) + '</span></div>' +
        (s.duree ? '<div class="droite"><div class="petit muet">Durée</div><b>' + esc(s.duree) + '</b></div>' : '') +
      '</div>' +
      (s.inclus && s.inclus.length ? '<ul class="pile-v petit mt-16">' + s.inclus.map(function (i) {
        return '<li>' + ico('check', 'ico-sm') + ' ' + esc(i) + '</li>';
      }).join('') + '</ul>' : '') +
      '<div class="pile mt-16">' +
        '<button class="btn btn-neutre btn-sm" data-edit-svc="' + esc(s.id) + '">' + ico('edit') + ' Modifier</button>' +
        '<button class="btn btn-neutre btn-sm" data-toggle-svc="' + esc(s.id) + '">' +
          ico(s.actif ? 'eye-off' : 'eye') + (s.actif ? ' Masquer' : ' Publier') + '</button>' +
        '<button class="btn-ico danger" data-del-svc="' + esc(s.id) + '" aria-label="Supprimer">' + ico('trash') + '</button>' +
      '</div></div>';
  }

  function formulaireService(s) {
    UI.modale(s ? 'Modifier le service' : 'Nouveau service',
      '<div class="champ"><label for="sv-nom">Nom du service</label>' +
        '<input class="inp" id="sv-nom" value="' + esc(s ? s.nom : '') + '" placeholder="Forfait journée complète"></div>' +
      '<div class="champ"><label for="sv-desc">Description</label>' +
        '<textarea class="inp" id="sv-desc" placeholder="Ce que comprend la prestation, en une ou deux phrases.">' + esc(s ? s.description : '') + '</textarea></div>' +
      '<div class="rangee d3">' +
        '<div class="champ"><label for="sv-prix">Prix en FCFA</label>' +
          '<input class="inp" id="sv-prix" type="number" min="0" step="1000" value="' + (s ? s.prix : '') + '" placeholder="320000"></div>' +
        '<div class="champ"><label for="sv-unite">Unité</label>' +
          '<select class="inp" id="sv-unite">' +
            ['forfait', 'couvert', 'journée', 'séance', 'heure', 'personne', 'option'].map(function (u) {
              return '<option' + (s && s.unite === u ? ' selected' : '') + '>' + u + '</option>';
            }).join('') + '</select></div>' +
        '<div class="champ"><label for="sv-duree">Durée</label>' +
          '<input class="inp" id="sv-duree" value="' + esc(s ? s.duree : '') + '" placeholder="12 h"></div>' +
      '</div>' +
      '<div class="champ"><label for="sv-inclus">Prestations incluses</label>' +
        '<textarea class="inp" id="sv-inclus" placeholder="Une par ligne : Second photographe&#10;Album imprimé&#10;Galerie en ligne">' +
        esc(s && s.inclus ? s.inclus.join('\n') : '') + '</textarea>' +
        '<span class="aide">Une prestation par ligne. Elles apparaissent en liste à puces sur votre fiche.</span></div>' +
      '<label class="coche"><input type="checkbox" id="sv-actif"' + (!s || s.actif ? ' checked' : '') + '> ' +
        '<span>Publier ce service immédiatement</span></label>',
      '<button class="btn btn-neutre" data-fermer>Annuler</button>' +
      '<button class="btn btn-primary" id="sv-ok">Enregistrer</button>');

    $('#sv-ok').addEventListener('click', function () {
      var nom = $('#sv-nom').value.trim();
      var prix = parseInt($('#sv-prix').value, 10);
      if (!nom) { UI.toast('Le nom du service est obligatoire'); return; }
      if (!prix || prix < 0) { UI.toast('Indiquez un prix valide'); return; }

      var donnees = {
        nom: nom,
        description: $('#sv-desc').value.trim(),
        prix: prix,
        unite: $('#sv-unite').value,
        duree: $('#sv-duree').value.trim(),
        inclus: $('#sv-inclus').value.split('\n').map(function (l) { return l.trim(); })
          .filter(function (l) { return l; }),
        actif: $('#sv-actif').checked
      };

      if (s) {
        BW.update('services', s.id, donnees);
      } else {
        donnees.prestataire = moiId();
        BW.create('services', donnees);
      }

      /* Le tarif de départ de la fiche suit le service actif le moins cher. */
      var actifs = BW.servicesDe(moiId()).map(function (x) { return x.prix; });
      if (actifs.length) BW.update('prestataires', moiId(), { prixMin: Math.min.apply(null, actifs) });

      UI.fermerModale();
      UI.toast('Service enregistré, visible sur la marketplace et l\'application');
      rendre();
    });
  }

  /* ================================================================
     3. PORTFOLIO
     ================================================================ */
  var portfolio = {
    titre: 'Portfolio',
    html: function () {
      var p = moi();
      return '' +
        '<div class="page-head"><div class="fill">' +
          '<h2>' + p.photos.length + ' photo' + (p.photos.length > 1 ? 's' : '') + '</h2>' +
          '<p>La première image sert de couverture sur les cartes de la marketplace et de l\'application.</p>' +
        '</div>' +
        '<button class="btn btn-primary" id="add-photo">' + ico('upload') + ' Ajouter une photo</button></div>' +

        '<div class="encart ambre" style="margin-bottom:20px">' + ico('shield') +
          '<p><b>Contrôle qualité.</b> Les photos doivent provenir de vos propres prestations. ' +
          'Un portfolio composé d\'images trouvées en ligne entraîne le refus du profil.</p></div>' +

        '<div class="grille g3">' + p.photos.map(function (url, i) {
          return '<div class="carte" style="padding:0;overflow:hidden">' +
            '<img src="' + esc(url) + '" alt="Photo ' + (i + 1) + ' du portfolio" style="width:100%;aspect-ratio:4/3;object-fit:cover" loading="lazy">' +
            '<div class="entre" style="padding:12px 14px">' +
              (i === 0 ? '<span class="tag corail">Photo de couverture</span>'
                       : '<button class="btn btn-sm btn-neutre" data-couv="' + i + '">Définir en couverture</button>') +
              '<button class="btn-ico danger" data-del-photo="' + i + '" aria-label="Supprimer">' + ico('trash') + '</button>' +
            '</div></div>';
        }).join('') + '</div>';
    },
    apres: function () {
      $('#add-photo').addEventListener('click', function () {
        UI.modale('Ajouter une photo',
          '<div class="champ"><label for="ph-url">Adresse de l\'image</label>' +
            '<input class="inp" id="ph-url" placeholder="https://…"></div>' +
          '<div class="encart info">' + ico('bulb') +
            '<p>En production, ce champ sera remplacé par un téléversement direct vers le stockage Supabase, ' +
            'avec compression automatique en WebP sous 100 ko.</p></div>',
          '<button class="btn btn-neutre" data-fermer>Annuler</button>' +
          '<button class="btn btn-primary" id="ph-ok">Ajouter</button>');

        $('#ph-ok').addEventListener('click', function () {
          var url = $('#ph-url').value.trim();
          if (!/^https?:\/\//.test(url)) { UI.toast('Indiquez une adresse valide'); return; }
          var p = moi();
          BW.update('prestataires', p.id, { photos: p.photos.concat([url]) });
          UI.fermerModale(); UI.toast('Photo ajoutée'); rendre();
        });
      });

      $$('[data-couv]').forEach(function (b) {
        b.addEventListener('click', function () {
          var i = parseInt(b.getAttribute('data-couv'), 10);
          var p = moi(); var photos = p.photos.slice();
          var choisie = photos.splice(i, 1)[0];
          BW.update('prestataires', p.id, { photos: [choisie].concat(photos) });
          UI.toast('Photo de couverture mise à jour'); rendre();
        });
      });

      $$('[data-del-photo]').forEach(function (b) {
        b.addEventListener('click', function () {
          var p = moi();
          if (p.photos.length <= 1) { UI.toast('Gardez au moins une photo'); return; }
          UI.confirmer('Supprimer la photo', 'Elle sera retirée de votre fiche publique.', 'Supprimer', function () {
            var i = parseInt(b.getAttribute('data-del-photo'), 10);
            var photos = p.photos.slice(); photos.splice(i, 1);
            BW.update('prestataires', p.id, { photos: photos });
            UI.toast('Photo supprimée'); rendre();
          }, true);
        });
      });
    }
  };

  /* ================================================================
     4. PROFIL PUBLIC
     ================================================================ */
  var profil = {
    titre: 'Profil public',
    html: function () {
      var p = moi();
      return '' +
        '<div class="page-head"><div class="fill">' +
          '<h2>Ce que voient les couples</h2>' +
          '<p>Ces informations alimentent votre fiche sur les trois surfaces : site, marketplace et application.</p>' +
        '</div>' +
        '<a class="btn btn-neutre" href="../app/prestataire.html?id=' + esc(p.id) + '" target="_blank" rel="noopener">' +
          ico('external') + ' Aperçu public</a></div>' +

        '<div class="grille g-2-1">' +
          '<div>' +
            '<div class="carte">' +
              '<div class="carte-tete"><h3>Présentation</h3></div>' +
              '<div class="champ"><label for="pf-nom">Nom commercial</label>' +
                '<input class="inp" id="pf-nom" value="' + esc(p.nom) + '"></div>' +
              '<div class="champ"><label for="pf-accroche">Accroche</label>' +
                '<input class="inp" id="pf-accroche" value="' + esc(p.accroche) + '" maxlength="90">' +
                '<span class="aide">Une ligne, affichée sous votre nom sur les cartes. 90 caractères maximum.</span></div>' +
              '<div class="champ"><label for="pf-desc">Description</label>' +
                '<textarea class="inp" id="pf-desc" style="min-height:140px">' + esc(p.description) + '</textarea>' +
                '<span class="aide">Expliquez votre méthode, ce qui est inclus et vos délais de livraison.</span></div>' +
            '</div>' +

            '<div class="carte">' +
              '<div class="carte-tete"><h3>Localisation et catégorie</h3></div>' +
              '<div class="rangee d2">' +
                '<div class="champ"><label for="pf-cat">Catégorie</label><select class="inp" id="pf-cat">' +
                  BW.list('categories').map(function (c) {
                    return '<option value="' + c.id + '"' + (c.id === p.categorie ? ' selected' : '') + '>' + esc(c.label) + '</option>';
                  }).join('') + '</select></div>' +
                '<div class="champ"><label for="pf-commune">Commune ou ville</label><select class="inp" id="pf-commune">' +
                  BW.list('villes').map(function (v) {
                    return '<option' + (v === p.commune ? ' selected' : '') + '>' + esc(v) + '</option>';
                  }).join('') + '</select></div>' +
              '</div>' +
              '<div class="rangee d2">' +
                '<div class="champ"><label for="pf-capacite">Capacité d\'accueil</label>' +
                  '<input class="inp" id="pf-capacite" value="' + esc(p.capacite || '') + '" placeholder="80 à 500 invités">' +
                  '<span class="aide">Laissez vide si cela ne s\'applique pas à votre métier.</span></div>' +
                '<div class="champ"><label for="pf-delai">Délai de réponse annoncé</label><select class="inp" id="pf-delai">' +
                  ['Répond en moins de 1 h', 'Répond en moins de 2 h', 'Répond en moins de 3 h',
                   'Répond en moins de 6 h', 'Répond en moins de 12 h', 'Répond en moins de 24 h'].map(function (d) {
                    return '<option' + (d === p.delaiReponse ? ' selected' : '') + '>' + esc(d) + '</option>';
                  }).join('') + '</select></div>' +
              '</div>' +
            '</div>' +

            '<div class="carte">' +
              '<div class="carte-tete"><h3>Contact</h3></div>' +
              '<div class="encart info" style="margin-bottom:16px">' + ico('lock') +
                '<p>Ces coordonnées restent masquées pour les couples. Les échanges passent par la messagerie ' +
                'sécurisée jusqu\'à l\'acceptation du devis.</p></div>' +
              '<div class="rangee d2">' +
                '<div class="champ"><label for="pf-cnom">Interlocuteur</label>' +
                  '<input class="inp" id="pf-cnom" value="' + esc(p.contact.nom) + '"></div>' +
                '<div class="champ"><label for="pf-crole">Fonction</label>' +
                  '<input class="inp" id="pf-crole" value="' + esc(p.contact.role) + '"></div>' +
              '</div>' +
              '<div class="rangee d2">' +
                '<div class="champ"><label for="pf-cmail">Courriel</label>' +
                  '<input class="inp" id="pf-cmail" type="email" value="' + esc(p.contact.email) + '"></div>' +
                '<div class="champ"><label for="pf-ctel">Téléphone</label>' +
                  '<input class="inp" id="pf-ctel" value="' + esc(p.contact.tel) + '"></div>' +
              '</div>' +
            '</div>' +

            '<div class="pile mt-16"><button class="btn btn-primary" id="pf-save">Enregistrer les modifications</button></div>' +
          '</div>' +

          '<div>' +
            '<div class="carte">' +
              '<div class="carte-tete"><h3>Aperçu de la carte</h3></div>' +
              '<div style="border:1px solid var(--bordure-pale);border-radius:var(--r-lg);overflow:hidden">' +
                '<div style="position:relative"><img src="' + esc(p.photos[0]) + '" alt="" style="width:100%;aspect-ratio:3/2;object-fit:cover">' +
                  (p.certifie ? '<span class="tag or" style="position:absolute;bottom:10px;left:10px">' + ico('check') + ' Certifié Or</span>' : '') +
                '</div>' +
                '<div style="padding:14px">' +
                  '<b style="font-size:16px">' + esc(p.nom) + '</b>' +
                  '<div class="mt-8">' + etoiles(p.note, p.avis) + '</div>' +
                  '<p class="petit mt-8">' + esc(BW.labelCategorie(p.categorie)) + ' · ' + esc(p.commune) + '</p>' +
                  '<p class="petit gras mt-8">À partir de ' + BW.fcfa(p.prixMin) + '</p>' +
                '</div></div>' +
              '<p class="petit muet mt-16">Cet aperçu correspond exactement au rendu de la marketplace et de l\'application mobile.</p>' +
            '</div>' +

            '<div class="carte">' +
              '<div class="carte-tete"><h3>Statut du profil</h3></div>' +
              '<div class="pile-v">' +
                '<div class="entre"><span class="petit">Publication</span>' + tag(p.statut, BW.STATUT_PRESTATAIRE) + '</div>' +
                '<div class="entre"><span class="petit">Badge Certifié Or</span>' +
                  (p.certifie ? '<span class="tag ok">Obtenu</span>' : '<span class="tag">Non attribué</span>') + '</div>' +
                '<div class="entre"><span class="petit">Mise en avant</span>' +
                  (p.sponsorise ? '<span class="tag corail">Active</span>' : '<span class="tag">Inactive</span>') + '</div>' +
                '<div class="entre"><span class="petit">Inscrit depuis</span><b class="petit">' + BW.date(p.inscritLe) + '</b></div>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>';
    },
    apres: function () {
      $('#pf-save').addEventListener('click', function () {
        var p = moi();
        var nom = $('#pf-nom').value.trim();
        if (!nom) { UI.toast('Le nom commercial est obligatoire'); return; }
        BW.update('prestataires', p.id, {
          nom: nom,
          accroche: $('#pf-accroche').value.trim(),
          description: $('#pf-desc').value.trim(),
          categorie: $('#pf-cat').value,
          commune: $('#pf-commune').value,
          capacite: $('#pf-capacite').value.trim(),
          delaiReponse: $('#pf-delai').value,
          contact: {
            nom: $('#pf-cnom').value.trim(),
            role: $('#pf-crole').value.trim(),
            email: $('#pf-cmail').value.trim(),
            tel: $('#pf-ctel').value.trim(),
            avatar: p.contact.avatar
          }
        });
        UI.toast('Profil mis à jour sur les trois surfaces');
        rendre(); majEntete();
      });
    }
  };

  /* ================================================================
     5. DEMANDES DE DEVIS
     ================================================================ */
  var demandes = {
    titre: 'Demandes de devis',
    html: function () {
      var p = moi();
      var liste = BW.list('devis', { prestataire: p.id });
      var attente = liste.filter(function (q) { return q.statut === 'attente'; });

      return '' +
        '<div class="page-head"><div class="fill">' +
          '<h2>' + liste.length + ' demande' + (liste.length > 1 ? 's' : '') + '</h2>' +
          '<p>' + attente.length + ' en attente de votre réponse.</p>' +
        '</div></div>' +

        (liste.length ? '<div class="pile-v" style="gap:16px">' + liste.map(carteDemande).join('') + '</div>'
          : '<div class="plat">' + UI.vide('inbox', 'Aucune demande', 'Complétez vos services et votre portfolio pour gagner en visibilité.') + '</div>');
    },
    apres: function () {
      $$('[data-repondre]').forEach(function (b) {
        b.addEventListener('click', function () { formulaireReponse(b.getAttribute('data-repondre')); });
      });
      $$('[data-refuser-q]').forEach(function (b) {
        b.addEventListener('click', function () {
          UI.confirmer('Décliner la demande',
            'Le couple sera informé que vous n\'êtes pas disponible. Vous restez libre de refuser sans justification.',
            'Décliner', function () {
              BW.update('devis', b.getAttribute('data-refuser-q'), { statut: 'refuse' });
              UI.toast('Demande déclinée'); rendre();
            }, true);
        });
      });
    }
  };

  function carteDemande(q) {
    var c = BW.couple(q.couple);
    return '<div class="carte">' +
      '<div class="entre" style="align-items:flex-start;flex-wrap:wrap;gap:12px">' +
        '<div style="flex:1;min-width:220px">' +
          '<div class="pile">' + tag(q.statut, BW.STATUT_DEVIS) +
            '<span class="petit muet">Reçue le ' + BW.date(q.envoyeLe) + '</span></div>' +
          '<h3 class="mt-8">' + esc(c ? c.noms : 'Couple') + '</h3>' +
          '<p class="petit">' + esc(c ? c.ville : '') + (c && c.diaspora ? ' · organise depuis l\'étranger' : '') + '</p>' +
        '</div>' +
        '<div class="droite">' +
          '<div class="petit muet">Date de l\'événement</div>' +
          '<b>' + BW.date(q.dateEvenement) + '</b>' +
          '<div class="petit muet mt-8">' + q.invites + ' invités</div>' +
        '</div>' +
      '</div>' +
      '<div class="encart mt-16" style="background:var(--fond-gris)">' + ico('message') +
        '<p>« ' + esc(q.message) + ' »</p></div>' +
      (q.montant ? '<div class="entre mt-16"><span class="petit muet">Devis transmis</span>' +
        '<b style="font-size:18px">' + BW.fcfa(q.montant) + '</b></div>' : '') +
      (q.statut === 'attente' ? '<div class="pile mt-16">' +
        '<button class="btn btn-primary btn-sm" data-repondre="' + esc(q.id) + '">' + ico('send') + ' Envoyer un devis</button>' +
        '<button class="btn btn-neutre btn-sm" data-refuser-q="' + esc(q.id) + '">Décliner</button>' +
        '</div>' : '') +
    '</div>';
  }

  function formulaireReponse(id) {
    var q = BW.get('devis', id);
    var c = BW.couple(q.couple);
    var mesServices = BW.servicesDe(moiId());

    UI.modale('Devis pour ' + (c ? c.noms : 'ce couple'),
      '<div class="encart info" style="margin-bottom:16px">' + ico('calendar') +
        '<p><b>' + BW.date(q.dateEvenement) + '</b> · ' + q.invites + ' invités · ' + esc(c ? c.ville : '') + '</p></div>' +
      (mesServices.length ? '<div class="champ"><label for="d-svc">Partir d\'un service existant</label>' +
        '<select class="inp" id="d-svc"><option value="">Devis libre</option>' +
        mesServices.map(function (s) {
          return '<option value="' + esc(s.id) + '" data-prix="' + s.prix + '">' +
            esc(s.nom) + ' — ' + BW.fcfa(s.prix) + ' / ' + esc(s.unite) + '</option>';
        }).join('') + '</select></div>' : '') +
      '<div class="champ"><label for="d-montant">Montant total en FCFA</label>' +
        '<input class="inp" id="d-montant" type="number" min="0" step="1000" placeholder="320000"></div>' +
      '<div class="champ"><label for="d-msg">Message au couple</label>' +
        '<textarea class="inp" id="d-msg" placeholder="Détaillez ce que comprend le devis et vos conditions.">Bonjour, je vous remercie pour votre demande. Voici ma proposition pour votre journée.</textarea></div>' +
      '<div class="encart ambre">' + ico('lock') +
        '<p>Un acompte de 30 % sera demandé à l\'acceptation et conservé en séquestre par Paystack ' +
        'jusqu\'à confirmation de la prestation.</p></div>',
      '<button class="btn btn-neutre" data-fermer>Annuler</button>' +
      '<button class="btn btn-primary" id="d-ok">Envoyer le devis</button>');

    var sel = $('#d-svc');
    if (sel) sel.addEventListener('change', function () {
      var opt = sel.options[sel.selectedIndex];
      var prix = opt.getAttribute('data-prix');
      if (prix) {
        /* Les tarifs au couvert se multiplient par le nombre d'invités. */
        var s = BW.get('services', sel.value);
        $('#d-montant').value = s && (s.unite === 'couvert' || s.unite === 'personne')
          ? Number(prix) * q.invites : prix;
      }
    });

    $('#d-ok').addEventListener('click', function () {
      var montant = parseInt($('#d-montant').value, 10);
      if (!montant || montant <= 0) { UI.toast('Indiquez un montant'); return; }
      BW.update('devis', id, { statut: 'recu', montant: montant });
      UI.fermerModale();
      UI.toast('Devis envoyé, le couple est notifié');
      rendre();
    });
  }

  /* ================================================================
     6. AGENDA
     ================================================================ */
  var agenda = {
    titre: 'Agenda',
    html: function () {
      var p = moi();
      var reserves = BW.list('devis', { prestataire: p.id, statut: 'accepte' });
      var options = BW.list('devis', { prestataire: p.id, statut: 'recu' });

      var evenements = reserves.map(function (q) { return { q: q, type: 'reserve' }; })
        .concat(options.map(function (q) { return { q: q, type: 'option' }; }))
        .sort(function (a, b) { return new Date(a.q.dateEvenement) - new Date(b.q.dateEvenement); });

      return '' +
        '<div class="page-head"><div class="fill">' +
          '<h2>' + reserves.length + ' date' + (reserves.length > 1 ? 's' : '') + ' réservée' + (reserves.length > 1 ? 's' : '') + '</h2>' +
          '<p>' + options.length + ' devis en attente de réponse du couple, à considérer comme des options.</p>' +
        '</div></div>' +

        '<div class="grille g-2-1">' +
          '<div class="carte">' +
            '<div class="carte-tete"><h3>Prochaines dates</h3></div>' +
            (evenements.length ? '<ul class="flux">' + evenements.map(function (e) {
              var c = BW.couple(e.q.couple);
              return '<li><span class="rond ' + (e.type === 'reserve' ? 'ok' : 'wait') + '">' + ico('calendar') + '</span>' +
                '<div style="flex:1"><b>' + BW.date(e.q.dateEvenement) + '</b>' +
                '<small>' + esc(c ? c.noms : '—') + ' · ' + e.q.invites + ' invités · ' + esc(c ? c.ville : '') + '</small></div>' +
                (e.type === 'reserve' ? '<span class="tag ok">Confirmé</span>' : '<span class="tag wait">Option</span>') +
                '</li>';
            }).join('') + '</ul>'
            : UI.vide('calendar', 'Agenda vide', 'Vos dates confirmées apparaîtront ici.')) +
          '</div>' +

          '<div>' +
            '<div class="carte">' +
              '<div class="carte-tete"><h3>Saisonnalité</h3></div>' +
              '<p class="petit">Décembre à février concentre les retours de la diaspora. Les meilleures dates ' +
                'partent 8 à 12 mois à l\'avance.</p>' +
              '<div class="sep"></div>' +
              '<div class="pile-v petit">' +
                '<div class="entre"><span>Haute saison</span><b>Déc. – Fév.</b></div>' +
                '<div class="entre"><span>Saison moyenne</span><b>Mars – Avr.</b></div>' +
                '<div class="entre"><span>Basse saison</span><b>Mai – Sept.</b></div>' +
              '</div>' +
            '</div>' +

            '<div class="carte">' +
              '<div class="carte-tete"><h3>Bloquer une date</h3></div>' +
              '<div class="champ"><label for="ag-date">Date indisponible</label>' +
                '<input class="inp" id="ag-date" type="date"></div>' +
              '<div class="champ"><label for="ag-motif">Motif</label>' +
                '<input class="inp" id="ag-motif" placeholder="Congés, autre engagement…"></div>' +
              '<button class="btn btn-neutre btn-block" id="ag-ok">Bloquer cette date</button>' +
            '</div>' +
          '</div>' +
        '</div>';
    },
    apres: function () {
      $('#ag-ok').addEventListener('click', function () {
        if (!$('#ag-date').value) { UI.toast('Choisissez une date'); return; }
        UI.toast('Date bloquée, vous n\'apparaîtrez plus dans les recherches ce jour-là');
        $('#ag-date').value = ''; $('#ag-motif').value = '';
      });
    }
  };

  /* ================================================================
     7. MES AVIS
     ================================================================ */
  var avis = {
    titre: 'Mes avis',
    html: function () {
      var p = moi();
      var liste = BW.list('avis', { prestataire: p.id });
      var publies = liste.filter(function (a) { return a.statut === 'publie'; });
      var repartition = [5, 4, 3, 2, 1].map(function (n) {
        return { n: n, count: publies.filter(function (a) { return Math.round(a.note) === n; }).length };
      });
      var max = Math.max.apply(null, repartition.map(function (r) { return r.count; })) || 1;

      return '' +
        '<div class="page-head"><div class="fill">' +
          '<h2>' + BW.note(p.note) + ' sur 5</h2>' +
          '<p>Moyenne calculée sur ' + publies.length + ' avis publiés.</p>' +
        '</div></div>' +

        '<div class="grille g-1-2">' +
          '<div class="carte">' +
            '<div class="carte-tete"><h3>Répartition</h3></div>' +
            '<div class="pile-v">' + repartition.map(function (r) {
              return '<div class="pile"><span class="petit" style="width:44px">' + r.n + ' ' + ico('star', 'ico-sm') + '</span>' +
                '<div class="jauge" style="flex:1"><i style="width:' + Math.round((r.count / max) * 100) + '%"></i></div>' +
                '<b class="petit" style="width:24px;text-align:right">' + r.count + '</b></div>';
            }).join('') + '</div>' +
            '<div class="encart info mt-16">' + ico('bulb') +
              '<p>Répondre aux avis, même critiques, améliore la perception de votre profil.</p></div>' +
          '</div>' +

          '<div class="carte">' +
            '<div class="carte-tete"><h3>Tous les avis</h3></div>' +
            (liste.length ? '<div class="pile-v" style="gap:16px">' + liste.map(function (a) {
              var c = BW.couple(a.couple);
              return '<div style="border:1px solid var(--bordure-pale);border-radius:var(--r);padding:14px">' +
                '<div class="entre"><div class="pile">' + etoiles(a.note) +
                  '<span class="petit muet">' + BW.date(a.date) + '</span></div>' +
                  tag(a.statut, BW.STATUT_AVIS) + '</div>' +
                '<p class="mt-8" style="color:var(--texte)">« ' + esc(a.texte) + ' »</p>' +
                '<p class="petit muet mt-8">' + esc(c ? c.noms : '—') + '</p>' +
                (a.statut === 'publie' && a.note <= 3
                  ? '<button class="btn btn-neutre btn-sm mt-8" data-signaler="' + esc(a.id) + '">' +
                    ico('alert') + ' Signaler cet avis</button>' : '') +
                '</div>';
            }).join('') + '</div>'
            : UI.vide('star', 'Aucun avis', 'Les couples pourront vous noter après leur mariage.')) +
          '</div>' +
        '</div>';
    },
    apres: function () {
      $$('[data-signaler]').forEach(function (b) {
        b.addEventListener('click', function () {
          var id = b.getAttribute('data-signaler');
          UI.modale('Signaler cet avis',
            '<div class="champ"><label for="sg-motif">Motif du signalement</label>' +
              '<textarea class="inp" id="sg-motif" placeholder="Expliquez pourquoi cet avis vous semble injustifié."></textarea>' +
              '<span class="aide">Un administrateur examinera le signalement. L\'avis reste visible pendant l\'examen.</span></div>',
            '<button class="btn btn-neutre" data-fermer>Annuler</button>' +
            '<button class="btn btn-primary" id="sg-ok">Envoyer le signalement</button>');

          $('#sg-ok').addEventListener('click', function () {
            var motif = $('#sg-motif').value.trim();
            if (!motif) { UI.toast('Expliquez le motif'); return; }
            BW.update('avis', id, { statut: 'signale', signalePar: moiId(), motifSignalement: motif });
            UI.fermerModale(); UI.toast('Signalement transmis à la modération'); rendre();
          });
        });
      });
    }
  };

  /* ================================================================
     8. ABONNEMENT
     ================================================================ */
  var abonnement = {
    titre: 'Abonnement',
    html: function () {
      var p = moi();
      var actuelle = p.abonnement;
      var offres = BW.list('offres');
      var paiements = BW.list('paiements', { prestataire: p.id, type: 'abonnement' });

      return '' +
        '<div class="page-head"><div class="fill">' +
          '<h2>Mon abonnement</h2>' +
          '<p>Trois mois offerts au lancement, sans carte bancaire ni engagement.</p>' +
        '</div></div>' +

        '<div class="grille g3">' + offres.map(function (o) {
          var courante = o.id === actuelle;
          return '<div class="carte" style="' + (courante ? 'border-color:var(--corail);border-width:2px' : '') + '">' +
            '<div class="entre"><h3>' + esc(o.nom) + '</h3>' +
              (courante ? '<span class="tag corail">Offre actuelle</span>' : '') + '</div>' +
            '<div class="mt-8"><b style="font-family:var(--serif);font-size:24px">' + BW.fcfa(o.prix) + '</b>' +
              '<span class="petit muet"> / ' + esc(o.periode) + '</span></div>' +
            '<ul class="pile-v petit mt-16" style="min-height:120px">' + o.avantages.map(function (a) {
              return '<li>' + ico('check', 'ico-sm') + ' ' + esc(a) + '</li>';
            }).join('') + '</ul>' +
            (courante ? '<button class="btn btn-neutre btn-block mt-16" disabled>Offre en cours</button>'
                      : '<button class="btn btn-primary btn-block mt-16" data-choisir="' + esc(o.id) + '">Choisir ' + esc(o.nom) + '</button>') +
            '</div>';
        }).join('') + '</div>' +

        '<div class="grille g2 mt-16">' +
          '<div class="carte">' +
            '<div class="carte-tete"><h3>Moyen de paiement</h3></div>' +
            '<div class="pile-v">' +
              '<label class="coche"><input type="radio" name="moyen" checked style="accent-color:var(--corail)"> <span>Orange Money — •••• 4512</span></label>' +
              '<label class="coche"><input type="radio" name="moyen" style="accent-color:var(--corail)"> <span>MTN MoMo</span></label>' +
              '<label class="coche"><input type="radio" name="moyen" style="accent-color:var(--corail)"> <span>Wave</span></label>' +
              '<label class="coche"><input type="radio" name="moyen" style="accent-color:var(--corail)"> <span>Carte bancaire</span></label>' +
            '</div>' +
            '<div class="encart info mt-16">' + ico('lock') +
              '<p>Les paiements transitent par Paystack. Aucune coordonnée bancaire n\'est stockée par Babi Wedding.</p></div>' +
          '</div>' +

          '<div class="carte">' +
            '<div class="carte-tete"><h3>Historique de facturation</h3></div>' +
            (paiements.length ? '<div class="tbl-wrap"><table class="data" style="min-width:0"><thead><tr>' +
              '<th>Date</th><th>Offre</th><th class="num">Montant</th><th>Statut</th></tr></thead><tbody>' +
              paiements.map(function (x) {
                var o = BW.get('offres', x.offre);
                return '<tr><td class="petit">' + BW.dateCourte(x.date) + '</td>' +
                  '<td class="petit">' + esc(o ? o.nom : '—') + '<br><span class="muet">' + esc(x.moyen) + '</span></td>' +
                  '<td class="num">' + BW.fcfa(x.montant) + '</td>' +
                  '<td>' + tag(x.statut, BW.STATUT_PAIEMENT) + '</td></tr>';
              }).join('') + '</tbody></table></div>'
              : '<p class="petit">Aucune facture pour le moment.</p>') +
          '</div>' +
        '</div>';
    },
    apres: function () {
      $$('[data-choisir]').forEach(function (b) {
        b.addEventListener('click', function () {
          var id = b.getAttribute('data-choisir');
          var o = BW.get('offres', id);
          UI.confirmer('Passer à l\'offre ' + o.nom,
            BW.fcfa(o.prix) + ' par mois, sans engagement. Le changement prend effet immédiatement et la ' +
            'facturation est ajustée au prorata.',
            'Confirmer', function () {
              BW.update('prestataires', moiId(), { abonnement: id });
              BW.create('paiements', {
                prestataire: moiId(), type: 'abonnement', offre: id, montant: o.prix,
                date: new Date().toISOString().slice(0, 10), moyen: 'Orange Money', statut: 'paye'
              });
              UI.toast('Abonnement mis à jour'); rendre();
            });
        });
      });
    }
  };

  /* ================================================================
     9. REVENUS
     ================================================================ */
  var revenus = {
    titre: 'Revenus',
    html: function () {
      var p = moi();
      var devisList = BW.list('devis', { prestataire: p.id });
      var acceptes = devisList.filter(function (q) { return q.statut === 'accepte'; });
      var ca = acceptes.reduce(function (s, q) { return s + (q.montant || 0); }, 0);
      var acomptes = BW.list('paiements', { prestataire: p.id, type: 'acompte' });
      var sequestre = acomptes.filter(function (a) { return a.statut === 'sequestre'; })
        .reduce(function (s, a) { return s + a.montant; }, 0);
      var reverse = acomptes.filter(function (a) { return a.statut === 'reverse'; })
        .reduce(function (s, a) { return s + a.montant; }, 0);
      var panier = acceptes.length ? Math.round(ca / acceptes.length) : 0;
      var conversion = devisList.length ? Math.round((acceptes.length / devisList.length) * 100) : 0;

      return '' +
        '<div class="page-head"><div class="fill">' +
          '<h2>Revenus générés par la plateforme</h2>' +
          '<p>Devis acceptés et acomptes encaissés via Paystack.</p>' +
        '</div></div>' +

        '<div class="grille g4">' +
          kpi('money', 'vert', 'Chiffre d\'affaires signé', BW.fcfa(ca)) +
          kpi('lock', 'bleu', 'Acomptes sous séquestre', BW.fcfa(sequestre)) +
          kpi('card', '', 'Déjà reversé', BW.fcfa(reverse)) +
          kpi('trend', 'ambre', 'Taux de conversion', conversion + ' %') +
        '</div>' +

        '<div class="grille g2 mt-16">' +
          '<div class="carte">' +
            '<div class="carte-tete"><h3>Entonnoir commercial</h3></div>' +
            '<div class="pile-v" style="gap:14px">' +
              entonnoir('Demandes reçues', devisList.length, devisList.length) +
              entonnoir('Devis envoyés', devisList.filter(function (q) { return q.statut !== 'attente'; }).length, devisList.length) +
              entonnoir('Devis acceptés', acceptes.length, devisList.length) +
            '</div>' +
            '<div class="sep"></div>' +
            '<div class="entre"><span class="petit muet">Panier moyen</span><b>' + BW.fcfa(panier) + '</b></div>' +
          '</div>' +

          '<div class="carte">' +
            '<div class="carte-tete"><h3>Acomptes</h3></div>' +
            (acomptes.length ? '<div class="tbl-wrap"><table class="data" style="min-width:0"><thead><tr>' +
              '<th>Date</th><th>Couple</th><th class="num">Montant</th><th>Statut</th></tr></thead><tbody>' +
              acomptes.map(function (a) {
                var c = a.couple ? BW.couple(a.couple) : null;
                return '<tr><td class="petit">' + BW.dateCourte(a.date) + '</td>' +
                  '<td class="petit">' + esc(c ? c.noms : '—') + '<br><span class="muet">' + esc(a.moyen) + '</span></td>' +
                  '<td class="num">' + BW.fcfa(a.montant) + '</td>' +
                  '<td>' + tag(a.statut, BW.STATUT_PAIEMENT) + '</td></tr>';
              }).join('') + '</tbody></table></div>'
              : '<p class="petit">Aucun acompte encaissé.</p>') +
            '<div class="encart info mt-16">' + ico('clock') +
              '<p>Les acomptes sont reversés sur votre Mobile Money 3 jours après la date de prestation confirmée.</p></div>' +
          '</div>' +
        '</div>';
    }
  };

  function entonnoir(libelle, valeur, total) {
    var pct = total ? Math.round((valeur / total) * 100) : 0;
    return '<div><div class="entre petit"><span>' + esc(libelle) + '</span>' +
      '<b>' + valeur + ' <span class="muet">(' + pct + ' %)</span></b></div>' +
      '<div class="jauge mt-8"><i style="width:' + pct + '%"></i></div></div>';
  }

  /* ================================================================
     En-tête et sélecteur de compte
     ================================================================ */
  function majEntete() {
    var p = moi();
    if (!p) return;
    var av = $('#user-avatar'), nom = $('#user-nom'), role = $('#user-role');
    if (av) av.src = p.contact.avatar;
    if (nom) nom.textContent = p.contact.nom;
    if (role) role.textContent = p.nom;

    var badge = $('#badge-demandes');
    if (badge) {
      var n = BW.list('devis', { prestataire: p.id, statut: 'attente' }).length;
      badge.textContent = n;
      badge.classList.toggle('hide', !n);
    }
  }

  function initSwitch() {
    var sel = $('#switch-presta');
    if (!sel) return;
    var liste = BW.list('prestataires');
    sel.innerHTML = liste.map(function (p) {
      return '<option value="' + esc(p.id) + '"' + (p.id === moiId() ? ' selected' : '') + '>' + esc(p.nom) + '</option>';
    }).join('');
    sel.addEventListener('change', function () {
      setMoi(sel.value);
      rendre(); majEntete();
      UI.toast('Compte : ' + BW.prestataire(sel.value).nom);
    });
  }

  /* ================================================================
     Démarrage
     ================================================================ */
  UI.initSide();

  var rendreOriginal = UI.routeur({
    '': tableau, 'tableau': tableau,
    'services': services,
    'portfolio': portfolio,
    'profil': profil,
    'demandes': demandes,
    'agenda': agenda,
    'avis': avis,
    'abonnement': abonnement,
    'revenus': revenus
  }, 'tableau');

  rendre = function () { rendreOriginal(); majEntete(); };

  initSwitch();
  majEntete();
})();
