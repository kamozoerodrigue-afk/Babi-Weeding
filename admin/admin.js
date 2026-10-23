/* ==========================================================================
   BABI WEDDING — panel d'administration
   Onze vues, routées par ancre. Les données viennent de BW (store.js).
   ========================================================================== */
(function () {
  'use strict';

  var $ = UI.$, $$ = UI.$$, esc = UI.esc, ico = UI.ico, tag = UI.tag;
  window.BW_APP_NOM = 'Administration Babi Wedding';

  var rendre; /* défini après la création du routeur */

  /* ================================================================
     Fragments réutilisables
     ================================================================ */
  function kpi(icone, ton, libelle, valeur, variation) {
    return '<div class="kpi">' +
      '<div class="haut"><span class="rond ' + ton + '">' + ico(icone) + '</span>' +
      '<span class="lbl">' + esc(libelle) + '</span></div>' +
      '<div class="val">' + valeur + '</div>' +
      (variation ? '<div class="var ' + variation.sens + '">' +
        ico(variation.sens === 'up' ? 'arrow-up' : 'arrow-down') + esc(variation.texte) + '</div>' : '') +
      '</div>';
  }

  function cellulePrestataire(p) {
    if (!p) return '<span class="muet">Prestataire supprimé</span>';
    return '<a class="cell-p" href="#/prestataires/' + esc(p.id) + '">' +
      '<img src="' + esc(p.photos[0]) + '" alt="" loading="lazy" width="80" height="80">' +
      '<span><b>' + esc(p.nom) + '</b><span>' + esc(BW.labelCategorie(p.categorie)) + ' · ' + esc(p.commune) + '</span></span>' +
      '</a>';
  }

  function barreRecherche(placeholder, id) {
    return '<div class="inp-ico recherche">' + ico('search') +
      '<input class="inp" type="search" id="' + id + '" placeholder="' + esc(placeholder) + '" aria-label="' + esc(placeholder) + '">' +
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
      var s = BW.stats();
      var trafic = BW.list('trafic');
      var dernier = trafic[trafic.length - 1] || { sessions: 0, inscriptions: 0, devis: 0 };
      var avant = trafic[trafic.length - 2] || dernier;
      var croissance = avant.sessions ? Math.round(((dernier.sessions - avant.sessions) / avant.sessions) * 100) : 0;

      var attente = BW.list('prestataires', { statut: 'attente' });
      var devisRecents = BW.list('devis').slice(0, 6);

      /* Répartition des prestataires par catégorie */
      var parCategorie = {};
      BW.list('prestataires', { statut: 'valide' }).forEach(function (p) {
        parCategorie[p.categorie] = (parCategorie[p.categorie] || 0) + 1;
      });
      var top = Object.keys(parCategorie).map(function (k) {
        return { cat: k, n: parCategorie[k] };
      }).sort(function (a, b) { return b.n - a.n; }).slice(0, 6);
      var maxCat = top.length ? top[0].n : 1;

      return '' +
        '<div class="page-head"><div class="fill">' +
          '<h2>Vue d\'ensemble</h2>' +
          '<p>Situation de la marketplace au ' + BW.date(new Date().toISOString()) + '.</p>' +
        '</div></div>' +

        '<div class="grille g4">' +
          kpi('briefcase', '', 'Prestataires validés', s.prestatairesValides,
              { sens: 'up', texte: '+' + s.prestatairesAttente + ' en attente' }) +
          kpi('users', 'bleu', 'Couples inscrits', s.couples,
              { sens: 'up', texte: '+' + dernier.inscriptions + ' ce mois' }) +
          kpi('doc', 'ambre', 'Demandes de devis', s.devis,
              { sens: 'up', texte: s.devisEnAttente + ' sans réponse' }) +
          kpi('trend', 'vert', 'Revenu mensuel récurrent', BW.fcfa(s.mrr),
              { sens: croissance >= 0 ? 'up' : 'down', texte: croissance + ' % de trafic' }) +
        '</div>' +

        '<div class="grille g-2-1 mt-16">' +
          '<div class="carte">' +
            '<div class="carte-tete"><h3>Trafic et activité, six derniers mois</h3></div>' +
            UI.chart(trafic, 'sessions', 'mois') +
            '<div class="legende"><span><i style="background:var(--corail)"></i>Sessions du site</span></div>' +
            '<div class="sep"></div>' +
            '<div class="grille g3">' +
              '<div><div class="petit muet">Sessions ce mois</div><div class="gras" style="font-size:18px">' + dernier.sessions.toLocaleString('fr-FR') + '</div></div>' +
              '<div><div class="petit muet">Inscriptions</div><div class="gras" style="font-size:18px">' + dernier.inscriptions + '</div></div>' +
              '<div><div class="petit muet">Devis émis</div><div class="gras" style="font-size:18px">' + dernier.devis + '</div></div>' +
            '</div>' +
          '</div>' +

          '<div>' +
            '<div class="carte">' +
              '<div class="carte-tete"><h3>À traiter</h3></div>' +
              '<ul class="flux">' +
                ligneAction('shield', s.prestatairesAttente ? 'wait' : 'ok', s.prestatairesAttente + ' profil' + (s.prestatairesAttente > 1 ? 's' : '') + ' à valider', 'Dossiers en attente de contrôle', '#/validation') +
                ligneAction('star', s.avisAModerer ? 'wait' : 'ok', s.avisAModerer + ' avis à modérer', 'Signalements et premières publications', '#/avis') +
                ligneAction('alert', s.litigesOuverts ? 'bad' : 'ok', s.litigesOuverts + ' litige' + (s.litigesOuverts > 1 ? 's' : '') + ' ouvert' + (s.litigesOuverts > 1 ? 's' : ''), 'Acomptes bloqués en séquestre', '#/litiges') +
                ligneAction('doc', s.devisEnAttente ? 'wait' : 'ok', s.devisEnAttente + ' devis sans réponse', 'Prestataires à relancer', '#/devis') +
              '</ul>' +
            '</div>' +

            '<div class="carte">' +
              '<div class="carte-tete"><h3>Acomptes sous séquestre</h3></div>' +
              '<div class="val gras" style="font-family:var(--serif);font-size:24px">' + BW.fcfa(s.sequestre) + '</div>' +
              '<p class="petit mt-8">Fonds conservés via Paystack jusqu\'à confirmation des prestations.</p>' +
              '<a href="#/paiements" class="lien mt-8">Voir les paiements ' + ico('arrow-right') + '</a>' +
            '</div>' +
          '</div>' +
        '</div>' +

        '<div class="grille g2 mt-16">' +
          '<div class="carte">' +
            '<div class="carte-tete"><h3>Répartition par catégorie</h3>' +
              '<a href="#/categories" class="lien petit">Gérer</a></div>' +
            '<div class="pile-v">' + top.map(function (t) {
              return '<div>' +
                '<div class="entre petit"><span>' + esc(BW.categorie(t.cat).label) + '</span><b>' + t.n + '</b></div>' +
                '<div class="jauge mt-8"><i style="width:' + Math.round((t.n / maxCat) * 100) + '%"></i></div>' +
                '</div>';
            }).join('') + '</div>' +
          '</div>' +

          '<div class="carte">' +
            '<div class="carte-tete"><h3>Derniers profils déposés</h3>' +
              '<a href="#/validation" class="lien petit">Tout voir</a></div>' +
            (attente.length ? '<ul class="flux">' + attente.map(function (p) {
              return '<li><span class="rond wait">' + ico('briefcase') + '</span>' +
                '<div style="flex:1"><b>' + esc(p.nom) + '</b>' +
                '<small>' + esc(BW.labelCategorie(p.categorie)) + ' · ' + esc(p.commune) + ' · déposé le ' + BW.dateCourte(p.inscritLe) + '</small></div>' +
                '<a class="btn btn-sm btn-neutre" href="#/validation">Examiner</a></li>';
            }).join('') + '</ul>' : UI.vide('check-circle', 'Aucun dossier en attente', 'Tous les profils déposés ont été traités.')) +
          '</div>' +
        '</div>' +

        '<div class="carte mt-16">' +
          '<div class="carte-tete"><h3>Dernières demandes de devis</h3>' +
            '<a href="#/devis" class="lien petit">Tout voir</a></div>' +
          '<div class="tbl-wrap"><table class="data"><thead><tr>' +
            '<th>Prestataire</th><th>Couple</th><th>Événement</th><th class="num">Montant</th><th>Statut</th>' +
          '</tr></thead><tbody>' + devisRecents.map(function (q) {
            var c = BW.couple(q.couple);
            return '<tr><td>' + cellulePrestataire(BW.prestataire(q.prestataire)) + '</td>' +
              '<td>' + esc(c ? c.noms : '—') + '<br><span class="petit muet">' + esc(c ? c.ville : '') + '</span></td>' +
              '<td class="petit">' + BW.dateCourte(q.dateEvenement) + '<br><span class="muet">' + q.invites + ' invités</span></td>' +
              '<td class="num">' + BW.fcfa(q.montant) + '</td>' +
              '<td>' + tag(q.statut, BW.STATUT_DEVIS) + '</td></tr>';
          }).join('') + '</tbody></table></div>' +
        '</div>';
    }
  };

  function ligneAction(icone, ton, titre, sous, href) {
    return '<li><span class="rond ' + ton + '">' + ico(icone) + '</span>' +
      '<div style="flex:1"><b>' + esc(titre) + '</b><small>' + esc(sous) + '</small></div>' +
      '<a class="btn-ico" href="' + href + '" aria-label="Ouvrir">' + ico('chevron-right') + '</a></li>';
  }

  /* ================================================================
     2. VALIDATION DES PROFILS
     ================================================================ */
  var validation = {
    titre: 'Validation des profils',
    html: function () {
      var attente = BW.list('prestataires', { statut: 'attente' });
      var refuses = BW.list('prestataires', { statut: 'refuse' });

      return '' +
        '<div class="page-head"><div class="fill">' +
          '<h2>' + attente.length + ' dossier' + (attente.length > 1 ? 's' : '') + ' en attente</h2>' +
          '<p>Contrôlez le registre de commerce, l\'authenticité du portfolio et la cohérence des tarifs avant publication.</p>' +
        '</div></div>' +

        '<div class="encart info mt-8" style="margin-bottom:20px">' + ico('shield') +
          '<p><b>Procédure.</b> Le cahier des charges impose une validation sous 48 h. Vérifiez que le RCCM est lisible, ' +
          'que les photos du portfolio appartiennent bien au prestataire et que les tarifs sont plausibles pour la catégorie.</p></div>' +

        (attente.length ? '<div class="grille g2">' + attente.map(carteDossier).join('') + '</div>'
                        : '<div class="plat">' + UI.vide('check-circle', 'Aucun dossier en attente', 'Tous les profils déposés ont été traités.') + '</div>') +

        (refuses.length ? '<div class="carte mt-24">' +
          '<div class="carte-tete"><h3>Dossiers refusés</h3></div>' +
          '<div class="tbl-wrap"><table class="data"><thead><tr>' +
          '<th>Prestataire</th><th>Motif</th><th>Déposé le</th><th class="actions">Action</th>' +
          '</tr></thead><tbody>' + refuses.map(function (p) {
            return '<tr><td>' + cellulePrestataire(p) + '</td>' +
              '<td class="petit">' + esc(p.motifRefus || '—') + '</td>' +
              '<td class="petit">' + BW.dateCourte(p.inscritLe) + '</td>' +
              '<td class="actions"><button class="btn btn-sm btn-neutre" data-reexaminer="' + esc(p.id) + '">Réexaminer</button></td></tr>';
          }).join('') + '</tbody></table></div></div>' : '');
    },
    apres: function () {
      $$('[data-valider]').forEach(function (b) {
        b.addEventListener('click', function () { ouvrirValidation(b.getAttribute('data-valider')); });
      });
      $$('[data-refuser]').forEach(function (b) {
        b.addEventListener('click', function () { ouvrirRefus(b.getAttribute('data-refuser')); });
      });
      $$('[data-reexaminer]').forEach(function (b) {
        b.addEventListener('click', function () {
          BW.update('prestataires', b.getAttribute('data-reexaminer'), { statut: 'attente', motifRefus: '' });
          UI.toast('Dossier remis en attente'); rendre();
        });
      });
    }
  };

  function carteDossier(p) {
    return '<div class="carte">' +
      '<div class="pile" style="align-items:flex-start;gap:14px">' +
        '<img src="' + esc(p.photos[0]) + '" alt="" style="width:88px;height:88px;border-radius:var(--r);object-fit:cover" loading="lazy" width="176" height="176">' +
        '<div style="flex:1;min-width:0">' +
          '<h3>' + esc(p.nom) + '</h3>' +
          '<p class="petit">' + esc(BW.labelCategorie(p.categorie)) + ' · ' + esc(p.commune) + ', ' + esc(p.ville) + '</p>' +
          '<p class="petit mt-8">' + esc(p.accroche) + '</p>' +
        '</div>' +
      '</div>' +
      '<div class="sep"></div>' +
      '<div class="grille g2 petit">' +
        infoLigne('Contact', p.contact.nom + ' — ' + p.contact.role) +
        infoLigne('Téléphone', p.contact.tel) +
        infoLigne('Courriel', p.contact.email) +
        infoLigne('RCCM', p.rccm) +
        infoLigne('Tarif de départ', BW.fcfa(p.prixMin) + ' / ' + p.unite) +
        infoLigne('Déposé le', BW.date(p.inscritLe)) +
      '</div>' +
      '<div class="sep"></div>' +
      '<div class="pile">' +
        '<button class="btn btn-vert btn-sm" data-valider="' + esc(p.id) + '">' + ico('check') + ' Valider le profil</button>' +
        '<button class="btn btn-rouge btn-sm" data-refuser="' + esc(p.id) + '">' + ico('x') + ' Refuser</button>' +
      '</div>' +
    '</div>';
  }

  function infoLigne(libelle, valeur) {
    return '<div><div class="muet" style="font-size:12px">' + esc(libelle) + '</div><b>' + esc(valeur) + '</b></div>';
  }

  function ouvrirValidation(id) {
    var p = BW.prestataire(id);
    if (!p) return;
    UI.modale('Valider ' + p.nom,
      '<div class="champ"><label for="v-abo">Offre d\'abonnement attribuée</label>' +
        '<select class="inp" id="v-abo">' + BW.list('offres').map(function (o) {
          return '<option value="' + o.id + '">' + esc(o.nom) + ' — ' + BW.fcfa(o.prix) + ' / mois</option>';
        }).join('') + '</select>' +
        '<span class="aide">Les trois premiers mois sont offerts au lancement.</span></div>' +
      '<label class="coche"><input type="checkbox" id="v-certifie" checked> ' +
        '<span><b>Attribuer le Badge Certifié Or</b><br><span class="petit muet">Pièce d\'identité et portfolio contrôlés.</span></span></label>' +
      '<label class="coche"><input type="checkbox" id="v-sponsor"> ' +
        '<span><b>Mettre en avant dans le catalogue</b><br><span class="petit muet">Réservé aux abonnements Or.</span></span></label>',
      '<button class="btn btn-neutre" data-fermer>Annuler</button>' +
      '<button class="btn btn-vert" id="v-ok">Publier le profil</button>');

    $('#v-ok').addEventListener('click', function () {
      BW.update('prestataires', id, {
        statut: 'valide',
        certifie: $('#v-certifie').checked,
        sponsorise: $('#v-sponsor').checked,
        abonnement: $('#v-abo').value,
        motifRefus: ''
      });
      UI.fermerModale();
      UI.toast(p.nom + ' est publié sur la marketplace');
      rendre();
    });
  }

  function ouvrirRefus(id) {
    var p = BW.prestataire(id);
    if (!p) return;
    UI.modale('Refuser ' + p.nom,
      '<div class="champ"><label for="r-motif">Motif du refus</label>' +
        '<select class="inp" id="r-motif">' +
          '<option>Registre de commerce illisible ou absent</option>' +
          '<option>Portfolio non authentique</option>' +
          '<option>Tarifs incohérents avec la catégorie</option>' +
          '<option>Coordonnées injoignables</option>' +
          '<option>Autre motif</option>' +
        '</select></div>' +
      '<div class="champ"><label for="r-note">Message adressé au prestataire</label>' +
        '<textarea class="inp" id="r-note" placeholder="Expliquez ce qui doit être corrigé pour un nouveau dépôt."></textarea>' +
        '<span class="aide">Ce message est envoyé par courriel. Le prestataire pourra redéposer son dossier.</span></div>',
      '<button class="btn btn-neutre" data-fermer>Annuler</button>' +
      '<button class="btn btn-rouge" id="r-ok">Confirmer le refus</button>');

    $('#r-ok').addEventListener('click', function () {
      var motif = $('#r-motif').value;
      var note = $('#r-note').value.trim();
      BW.update('prestataires', id, { statut: 'refuse', motifRefus: motif + (note ? ' — ' + note : '') });
      UI.fermerModale();
      UI.toast('Dossier refusé, le prestataire est informé');
      rendre();
    });
  }

  /* ================================================================
     3. PRESTATAIRES
     ================================================================ */
  var prestataires = {
    titre: 'Prestataires',
    html: function (id) {
      if (id) return fichePrestataire(id);
      var liste = BW.list('prestataires');
      return '' +
        '<div class="page-head"><div class="fill">' +
          '<h2>' + liste.length + ' prestataires au catalogue</h2>' +
          '<p>Profils publiés, en attente et refusés.</p>' +
        '</div></div>' +

        '<div class="filtres">' +
          barreRecherche('Rechercher un prestataire, une commune…', 'q-presta') +
          '<select class="inp" id="f-statut"><option value="">Tous les statuts</option>' +
            Object.keys(BW.STATUT_PRESTATAIRE).map(function (k) {
              return '<option value="' + k + '">' + esc(BW.STATUT_PRESTATAIRE[k]) + '</option>';
            }).join('') + '</select>' +
          '<select class="inp" id="f-cat"><option value="">Toutes catégories</option>' +
            BW.list('categories').map(function (c) {
              return '<option value="' + c.id + '">' + esc(c.label) + '</option>';
            }).join('') + '</select>' +
          '<span class="fill"></span>' +
          '<span class="petit muet"><b id="nb-presta">' + liste.length + '</b> affichés</span>' +
        '</div>' +

        '<div class="plat"><div class="tbl-wrap"><table class="data"><thead><tr>' +
          '<th>Prestataire</th><th>Statut</th><th>Abonnement</th><th class="num">Tarif départ</th>' +
          '<th>Note</th><th class="num">Devis</th><th class="actions">Actions</th>' +
        '</tr></thead><tbody id="corps-presta">' + liste.map(ligneP).join('') + '</tbody></table></div></div>';
    },
    apres: function (id) {
      if (id) { apresFiche(id); return; }

      function filtrer() {
        var q = ($('#q-presta').value || '').toLowerCase().trim();
        var st = $('#f-statut').value, cat = $('#f-cat').value;
        var n = 0;
        $$('#corps-presta tr').forEach(function (tr) {
          var okQ = !q || tr.textContent.toLowerCase().indexOf(q) > -1;
          var okS = !st || tr.getAttribute('data-statut') === st;
          var okC = !cat || tr.getAttribute('data-cat') === cat;
          var v = okQ && okS && okC;
          tr.classList.toggle('hide', !v);
          if (v) n++;
        });
        $('#nb-presta').textContent = n;
      }
      ['#q-presta', '#f-statut', '#f-cat'].forEach(function (s) {
        $(s).addEventListener('input', filtrer);
        $(s).addEventListener('change', filtrer);
      });

      $$('[data-suspendre]').forEach(function (b) {
        b.addEventListener('click', function () {
          var pid = b.getAttribute('data-suspendre');
          var p = BW.prestataire(pid);
          var suspendu = p.statut === 'suspendu';
          UI.confirmer(
            suspendu ? 'Réactiver ' + p.nom : 'Suspendre ' + p.nom,
            suspendu ? 'Le profil redeviendra visible sur la marketplace et l\'application.'
                     : 'Le profil sera retiré de la marketplace. Les devis en cours restent accessibles au prestataire.',
            suspendu ? 'Réactiver' : 'Suspendre',
            function () {
              BW.update('prestataires', pid, { statut: suspendu ? 'valide' : 'suspendu' });
              UI.toast(suspendu ? 'Profil réactivé' : 'Profil suspendu');
              rendre();
            }, !suspendu);
        });
      });
      $$('[data-sponsor]').forEach(function (b) {
        b.addEventListener('click', function () {
          var pid = b.getAttribute('data-sponsor');
          var p = BW.prestataire(pid);
          BW.update('prestataires', pid, { sponsorise: !p.sponsorise });
          UI.toast(p.sponsorise ? 'Mise en avant retirée' : 'Prestataire mis en avant');
          rendre();
        });
      });
    }
  };

  function ligneP(p) {
    var offre = BW.get('offres', p.abonnement);
    return '<tr data-statut="' + esc(p.statut) + '" data-cat="' + esc(p.categorie) + '">' +
      '<td>' + cellulePrestataire(p) + '</td>' +
      '<td>' + tag(p.statut, BW.STATUT_PRESTATAIRE) +
        (p.sponsorise ? ' <span class="tag corail">Mis en avant</span>' : '') + '</td>' +
      '<td>' + (offre ? '<span class="tag or">' + esc(offre.nom) + '</span>' : '<span class="muet petit">Aucun</span>') + '</td>' +
      '<td class="num">' + BW.fcfa(p.prixMin) + '</td>' +
      '<td>' + etoiles(p.note, p.avis) + '</td>' +
      '<td class="num">' + BW.list('devis', { prestataire: p.id }).length + '</td>' +
      '<td class="actions"><span class="pile" style="justify-content:flex-end">' +
        '<a class="btn-ico" href="#/prestataires/' + esc(p.id) + '" aria-label="Voir la fiche">' + ico('eye') + '</a>' +
        '<button class="btn-ico" data-sponsor="' + esc(p.id) + '" aria-label="Basculer la mise en avant">' + ico('star') + '</button>' +
        '<button class="btn-ico danger" data-suspendre="' + esc(p.id) + '" aria-label="Suspendre ou réactiver">' + ico('ban') + '</button>' +
      '</span></td></tr>';
  }

  function fichePrestataire(id) {
    var p = BW.prestataire(id);
    if (!p) return '<div class="plat">' + UI.vide('search', 'Prestataire introuvable', 'Ce profil a peut-être été supprimé.') + '</div>';

    var services = BW.servicesDe(id, true);
    var devis = BW.list('devis', { prestataire: id });
    var avis = BW.list('avis', { prestataire: id });
    var paiements = BW.list('paiements', { prestataire: id });
    var ca = paiements.filter(function (x) { return x.statut === 'paye'; })
      .reduce(function (s, x) { return s + x.montant; }, 0);

    return '' +
      '<a class="lien petit" href="#/prestataires">' + ico('chevron-left') + ' Retour à la liste</a>' +

      '<div class="carte mt-16">' +
        '<div class="pile" style="align-items:flex-start;gap:16px;flex-wrap:wrap">' +
          '<img src="' + esc(p.photos[0]) + '" alt="" style="width:110px;height:110px;border-radius:var(--r-lg);object-fit:cover" width="220" height="220">' +
          '<div style="flex:1;min-width:220px">' +
            '<div class="pile"><h2>' + esc(p.nom) + '</h2>' + tag(p.statut, BW.STATUT_PRESTATAIRE) +
              (p.certifie ? '<span class="tag or">' + ico('check') + ' Certifié Or</span>' : '') + '</div>' +
            '<p class="mt-8">' + esc(BW.labelCategorie(p.categorie)) + ' · ' + esc(p.commune) + ', ' + esc(p.ville) + '</p>' +
            '<div class="pile mt-8">' + etoiles(p.note, p.avis) +
              '<span class="petit muet">Inscrit le ' + BW.date(p.inscritLe) + '</span></div>' +
          '</div>' +
          '<a class="btn btn-neutre btn-sm" href="../app/prestataire.html?id=' + esc(p.id) + '" target="_blank" rel="noopener">' +
            ico('external') + ' Voir la fiche publique</a>' +
        '</div>' +
      '</div>' +

      '<div class="grille g4 mt-16">' +
        kpi('doc', 'bleu', 'Demandes reçues', devis.length) +
        kpi('check-circle', 'vert', 'Devis acceptés', devis.filter(function (q) { return q.statut === 'accepte'; }).length) +
        kpi('star', 'ambre', 'Note moyenne', BW.note(p.note)) +
        kpi('money', '', 'Encaissé sur la plateforme', BW.fcfa(ca)) +
      '</div>' +

      '<div class="grille g-2-1 mt-16">' +
        '<div>' +
          '<div class="carte">' +
            '<div class="carte-tete"><h3>Services proposés</h3><span class="petit muet">' + services.length + ' au total</span></div>' +
            (services.length ? '<div class="tbl-wrap"><table class="data" style="min-width:0"><thead><tr>' +
              '<th>Service</th><th class="num">Prix</th><th>Statut</th></tr></thead><tbody>' +
              services.map(function (s) {
                return '<tr><td><b>' + esc(s.nom) + '</b><br><span class="petit muet">' + esc(s.description) + '</span></td>' +
                  '<td class="num">' + BW.fcfa(s.prix) + '<br><span class="petit muet">/ ' + esc(s.unite) + '</span></td>' +
                  '<td>' + (s.actif ? '<span class="tag ok">Actif</span>' : '<span class="tag">Masqué</span>') + '</td></tr>';
              }).join('') + '</tbody></table></div>'
              : UI.vide('list', 'Aucun service saisi', 'Le prestataire n\'a pas encore détaillé son offre.')) +
          '</div>' +

          '<div class="carte">' +
            '<div class="carte-tete"><h3>Demandes de devis</h3></div>' +
            (devis.length ? '<div class="tbl-wrap"><table class="data" style="min-width:0"><thead><tr>' +
              '<th>Couple</th><th>Événement</th><th class="num">Montant</th><th>Statut</th></tr></thead><tbody>' +
              devis.map(function (q) {
                var c = BW.couple(q.couple);
                return '<tr><td>' + esc(c ? c.noms : '—') + '</td>' +
                  '<td class="petit">' + BW.dateCourte(q.dateEvenement) + ' · ' + q.invites + ' invités</td>' +
                  '<td class="num">' + BW.fcfa(q.montant) + '</td>' +
                  '<td>' + tag(q.statut, BW.STATUT_DEVIS) + '</td></tr>';
              }).join('') + '</tbody></table></div>'
              : UI.vide('doc', 'Aucune demande', 'Ce prestataire n\'a pas encore été sollicité.')) +
          '</div>' +
        '</div>' +

        '<div>' +
          '<div class="carte">' +
            '<div class="carte-tete"><h3>Contact</h3></div>' +
            '<div class="pile"><img class="avatar" src="' + esc(p.contact.avatar) + '" alt="" width="80" height="80">' +
              '<div><b>' + esc(p.contact.nom) + '</b><br><span class="petit muet">' + esc(p.contact.role) + '</span></div></div>' +
            '<div class="sep"></div>' +
            '<div class="pile-v petit">' +
              '<div>' + ico('mail', 'ico-sm') + ' ' + esc(p.contact.email) + '</div>' +
              '<div>' + ico('phone', 'ico-sm') + ' ' + esc(p.contact.tel) + '</div>' +
              '<div>' + ico('doc', 'ico-sm') + ' RCCM ' + esc(p.rccm) + '</div>' +
              '<div>' + ico('clock', 'ico-sm') + ' ' + esc(p.delaiReponse || 'Délai non renseigné') + '</div>' +
            '</div>' +
          '</div>' +

          '<div class="carte">' +
            '<div class="carte-tete"><h3>Abonnement</h3></div>' +
            abonnementBloc(p) +
          '</div>' +

          '<div class="carte">' +
            '<div class="carte-tete"><h3>Avis reçus</h3></div>' +
            (avis.length ? '<ul class="flux">' + avis.map(function (a) {
              var c = BW.couple(a.couple);
              return '<li><span class="rond ' + BW.ton(a.statut) + '">' + ico('star') + '</span>' +
                '<div style="flex:1"><b>' + BW.note(a.note) + ' — ' + esc(c ? c.noms : '—') + '</b>' +
                '<small>' + esc(a.texte.slice(0, 90)) + (a.texte.length > 90 ? '…' : '') + '</small></div>' +
                tag(a.statut, BW.STATUT_AVIS) + '</li>';
            }).join('') + '</ul>' : '<p class="petit">Aucun avis publié.</p>') +
          '</div>' +
        '</div>' +
      '</div>';
  }

  function abonnementBloc(p) {
    var o = BW.get('offres', p.abonnement);
    if (!o) return '<p class="petit">Aucun abonnement actif.</p>' +
      '<button class="btn btn-primary btn-sm btn-block mt-8" data-abo="' + esc(p.id) + '">Attribuer une offre</button>';
    return '<div class="entre"><span class="tag or">' + esc(o.nom) + '</span>' +
      '<b>' + BW.fcfa(o.prix) + ' / mois</b></div>' +
      '<ul class="pile-v petit mt-16">' + o.avantages.map(function (a) {
        return '<li>' + ico('check', 'ico-sm') + ' ' + esc(a) + '</li>';
      }).join('') + '</ul>' +
      '<button class="btn btn-neutre btn-sm btn-block mt-16" data-abo="' + esc(p.id) + '">Changer d\'offre</button>';
  }

  function apresFiche(id) {
    $$('[data-abo]').forEach(function (b) {
      b.addEventListener('click', function () {
        var p = BW.prestataire(id);
        UI.modale('Abonnement de ' + p.nom,
          '<div class="champ"><label for="a-offre">Offre</label><select class="inp" id="a-offre">' +
            '<option value="aucun">Aucun abonnement</option>' +
            BW.list('offres').map(function (o) {
              return '<option value="' + o.id + '"' + (o.id === p.abonnement ? ' selected' : '') + '>' +
                esc(o.nom) + ' — ' + BW.fcfa(o.prix) + ' / mois</option>';
            }).join('') + '</select></div>',
          '<button class="btn btn-neutre" data-fermer>Annuler</button>' +
          '<button class="btn btn-primary" id="a-ok">Enregistrer</button>');
        $('#a-ok').addEventListener('click', function () {
          BW.update('prestataires', id, { abonnement: $('#a-offre').value });
          UI.fermerModale(); UI.toast('Abonnement mis à jour'); rendre();
        });
      });
    });
  }

  /* ================================================================
     4. CATÉGORIES
     ================================================================ */
  var categories = {
    titre: 'Catégories',
    html: function () {
      var cats = BW.list('categories');
      return '' +
        '<div class="page-head"><div class="fill">' +
          '<h2>' + cats.length + ' catégories de prestataires</h2>' +
          '<p>Structure du catalogue, partagée par le site, la marketplace et l\'application mobile.</p>' +
        '</div>' +
        '<button class="btn btn-primary" id="add-cat">' + ico('plus') + ' Ajouter une catégorie</button></div>' +

        '<div class="plat"><div class="tbl-wrap"><table class="data"><thead><tr>' +
          '<th>Catégorie</th><th>Identifiant</th><th class="num">Prestataires</th>' +
          '<th class="num">Devis reçus</th><th class="actions">Actions</th>' +
        '</tr></thead><tbody>' + cats.map(function (c) {
          var n = BW.list('prestataires', { categorie: c.id, statut: 'valide' }).length;
          var d = BW.list('devis').filter(function (q) {
            var p = BW.prestataire(q.prestataire);
            return p && p.categorie === c.id;
          }).length;
          return '<tr><td><span class="pile">' +
              '<span class="rond" style="width:34px;height:34px;border-radius:var(--r);display:grid;place-items:center;background:var(--corail-pale);color:var(--corail)">' + ico(c.icon.replace('i-', '')) + '</span>' +
              '<b>' + esc(c.label) + '</b></span></td>' +
            '<td class="petit muet">' + esc(c.id) + '</td>' +
            '<td class="num">' + n + '</td><td class="num">' + d + '</td>' +
            '<td class="actions"><button class="btn-ico" data-edit-cat="' + esc(c.id) + '" aria-label="Modifier">' + ico('edit') + '</button></td></tr>';
        }).join('') + '</tbody></table></div></div>';
    },
    apres: function () {
      var ouvrir = function (c) {
        UI.modale(c ? 'Modifier la catégorie' : 'Nouvelle catégorie',
          '<div class="champ"><label for="c-label">Nom au pluriel</label>' +
            '<input class="inp" id="c-label" value="' + esc(c ? c.label : '') + '" placeholder="Photographes"></div>' +
          '<div class="champ"><label for="c-sing">Nom au singulier</label>' +
            '<input class="inp" id="c-sing" value="' + esc(c ? c.singulier : '') + '" placeholder="Photographe">' +
            '<span class="aide">Affiché sur les cartes de la marketplace et de l\'application.</span></div>' +
          '<div class="champ"><label for="c-id">Identifiant d\'URL</label>' +
            '<input class="inp" id="c-id" value="' + esc(c ? c.id : '') + '" placeholder="photographes"' + (c ? ' disabled' : '') + '>' +
            '<span class="aide">Sert d\'adresse : /photographe-mariage-abidjan.</span></div>',
          '<button class="btn btn-neutre" data-fermer>Annuler</button>' +
          '<button class="btn btn-primary" id="c-ok">Enregistrer</button>');

        $('#c-ok').addEventListener('click', function () {
          var label = $('#c-label').value.trim();
          var sing = $('#c-sing').value.trim();
          if (!label || !sing) { UI.toast('Renseignez les deux libellés'); return; }
          if (c) {
            BW.update('categories', c.id, { label: label, singulier: sing });
          } else {
            var id = $('#c-id').value.trim() ||
              label.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-');
            BW.create('categories', { id: id, label: label, singulier: sing, icon: 'i-briefcase' });
          }
          UI.fermerModale(); UI.toast('Catégorie enregistrée'); rendre();
        });
      };
      $('#add-cat').addEventListener('click', function () { ouvrir(null); });
      $$('[data-edit-cat]').forEach(function (b) {
        b.addEventListener('click', function () { ouvrir(BW.categorie(b.getAttribute('data-edit-cat'))); });
      });
    }
  };

  /* ================================================================
     5. COUPLES
     ================================================================ */
  var couples = {
    titre: 'Couples',
    html: function () {
      var liste = BW.list('couples');
      var diaspora = liste.filter(function (c) { return c.diaspora; }).length;
      return '' +
        '<div class="page-head"><div class="fill">' +
          '<h2>' + liste.length + ' couples inscrits</h2>' +
          '<p>' + diaspora + ' organisent leur mariage depuis l\'étranger.</p>' +
        '</div></div>' +

        '<div class="filtres">' + barreRecherche('Rechercher un couple, une ville…', 'q-couple') +
          '<span class="fill"></span><span class="petit muet"><b id="nb-couple">' + liste.length + '</b> affichés</span></div>' +

        '<div class="plat"><div class="tbl-wrap"><table class="data"><thead><tr>' +
          '<th>Couple</th><th>Contact</th><th>Mariage</th><th class="num">Invités</th>' +
          '<th class="num">Budget</th><th class="num">Devis</th><th>Statut</th>' +
        '</tr></thead><tbody id="corps-couple">' + liste.map(function (c) {
          return '<tr><td><b>' + esc(c.noms) + '</b>' +
              (c.diaspora ? ' <span class="tag info">Diaspora</span>' : '') +
              '<br><span class="petit muet">' + esc(c.ville) + ' · inscrit le ' + BW.dateCourte(c.inscritLe) + '</span></td>' +
            '<td class="petit">' + esc(c.email) + '<br><span class="muet">' + esc(c.tel) + '</span></td>' +
            '<td class="petit">' + BW.date(c.dateMariage) + '</td>' +
            '<td class="num">' + c.invites + '</td>' +
            '<td class="num">' + BW.fcfa(c.budget) + '</td>' +
            '<td class="num">' + BW.list('devis', { couple: c.id }).length + '</td>' +
            '<td>' + (c.statut === 'actif' ? '<span class="tag ok">Actif</span>' : '<span class="tag">Inactif</span>') + '</td></tr>';
        }).join('') + '</tbody></table></div></div>';
    },
    apres: function () {
      $('#q-couple').addEventListener('input', function () {
        UI.filtrerLignes('#corps-couple tr', this.value, '#nb-couple');
      });
    }
  };

  /* ================================================================
     6. DEVIS
     ================================================================ */
  var devis = {
    titre: 'Demandes de devis',
    html: function () {
      var liste = BW.list('devis');
      var volume = liste.filter(function (q) { return q.montant; })
        .reduce(function (s, q) { return s + q.montant; }, 0);
      return '' +
        '<div class="page-head"><div class="fill">' +
          '<h2>' + liste.length + ' demandes</h2>' +
          '<p>Volume chiffré cumulé : ' + BW.fcfa(volume) + '.</p>' +
        '</div></div>' +

        '<div class="filtres">' + barreRecherche('Rechercher…', 'q-devis') +
          '<div class="puces" id="puces-devis">' +
            '<button class="puce on" data-st="">Toutes</button>' +
            Object.keys(BW.STATUT_DEVIS).map(function (k) {
              return '<button class="puce" data-st="' + k + '">' + esc(BW.STATUT_DEVIS[k]) + '</button>';
            }).join('') + '</div>' +
          '<span class="fill"></span><span class="petit muet"><b id="nb-devis">' + liste.length + '</b> affichées</span></div>' +

        '<div class="plat"><div class="tbl-wrap"><table class="data"><thead><tr>' +
          '<th>Prestataire</th><th>Couple</th><th>Demande</th><th>Événement</th>' +
          '<th class="num">Montant</th><th>Statut</th>' +
        '</tr></thead><tbody id="corps-devis">' + liste.map(function (q) {
          var c = BW.couple(q.couple);
          return '<tr data-st="' + esc(q.statut) + '">' +
            '<td>' + cellulePrestataire(BW.prestataire(q.prestataire)) + '</td>' +
            '<td>' + esc(c ? c.noms : '—') + '<br><span class="petit muet">' + esc(c ? c.ville : '') + '</span></td>' +
            '<td class="petit" style="max-width:280px">' + esc(q.message) +
              '<br><span class="muet">Envoyée le ' + BW.dateCourte(q.envoyeLe) + '</span></td>' +
            '<td class="petit">' + BW.dateCourte(q.dateEvenement) + '<br><span class="muet">' + q.invites + ' invités</span></td>' +
            '<td class="num">' + BW.fcfa(q.montant) + '</td>' +
            '<td>' + tag(q.statut, BW.STATUT_DEVIS) + '</td></tr>';
        }).join('') + '</tbody></table></div></div>';
    },
    apres: function () {
      var st = '';
      function filtrer() {
        var q = ($('#q-devis').value || '').toLowerCase().trim();
        var n = 0;
        $$('#corps-devis tr').forEach(function (tr) {
          var v = (!q || tr.textContent.toLowerCase().indexOf(q) > -1) &&
                  (!st || tr.getAttribute('data-st') === st);
          tr.classList.toggle('hide', !v);
          if (v) n++;
        });
        $('#nb-devis').textContent = n;
      }
      $('#q-devis').addEventListener('input', filtrer);
      $$('#puces-devis .puce').forEach(function (b) {
        b.addEventListener('click', function () {
          $$('#puces-devis .puce').forEach(function (x) { x.classList.remove('on'); });
          b.classList.add('on'); st = b.getAttribute('data-st'); filtrer();
        });
      });
    }
  };

  /* ================================================================
     7. AVIS
     ================================================================ */
  var avis = {
    titre: 'Avis',
    html: function () {
      var liste = BW.list('avis');
      var aModerer = liste.filter(function (a) { return a.statut !== 'publie'; });
      return '' +
        '<div class="page-head"><div class="fill">' +
          '<h2>' + aModerer.length + ' avis à traiter</h2>' +
          '<p>Les avis signalés par un prestataire et les premières publications passent par la modération.</p>' +
        '</div></div>' +

        (aModerer.length ? '<div class="grille g2">' + aModerer.map(carteAvis).join('') + '</div>'
          : '<div class="plat">' + UI.vide('check-circle', 'Rien à modérer', 'Tous les avis sont publiés.') + '</div>') +

        '<div class="carte mt-24"><div class="carte-tete"><h3>Tous les avis</h3></div>' +
        '<div class="tbl-wrap"><table class="data"><thead><tr>' +
          '<th>Prestataire</th><th>Couple</th><th>Note</th><th>Avis</th><th>Statut</th><th class="actions">Actions</th>' +
        '</tr></thead><tbody>' + liste.map(function (a) {
          var c = BW.couple(a.couple);
          return '<tr><td>' + cellulePrestataire(BW.prestataire(a.prestataire)) + '</td>' +
            '<td class="petit">' + esc(c ? c.noms : '—') + '<br><span class="muet">' + BW.dateCourte(a.date) + '</span></td>' +
            '<td>' + etoiles(a.note) + '</td>' +
            '<td class="petit" style="max-width:320px">' + esc(a.texte) + '</td>' +
            '<td>' + tag(a.statut, BW.STATUT_AVIS) + '</td>' +
            '<td class="actions"><span class="pile" style="justify-content:flex-end">' +
              (a.statut !== 'publie' ? '<button class="btn-ico" data-pub="' + esc(a.id) + '" aria-label="Publier">' + ico('check') + '</button>' : '') +
              (a.statut !== 'masque' ? '<button class="btn-ico danger" data-masq="' + esc(a.id) + '" aria-label="Masquer">' + ico('eye-off') + '</button>' : '') +
            '</span></td></tr>';
        }).join('') + '</tbody></table></div></div>';
    },
    apres: function () {
      $$('[data-pub]').forEach(function (b) {
        b.addEventListener('click', function () {
          BW.update('avis', b.getAttribute('data-pub'), { statut: 'publie' });
          UI.toast('Avis publié'); rendre();
        });
      });
      $$('[data-masq]').forEach(function (b) {
        b.addEventListener('click', function () {
          UI.confirmer('Masquer cet avis', 'Il ne sera plus visible sur la fiche publique du prestataire.',
            'Masquer', function () {
              BW.update('avis', b.getAttribute('data-masq'), { statut: 'masque' });
              UI.toast('Avis masqué'); rendre();
            }, true);
        });
      });
    }
  };

  function carteAvis(a) {
    var p = BW.prestataire(a.prestataire), c = BW.couple(a.couple);
    return '<div class="carte">' +
      '<div class="entre"><div class="pile">' + etoiles(a.note) +
        '<span class="petit muet">' + BW.date(a.date) + '</span></div>' + tag(a.statut, BW.STATUT_AVIS) + '</div>' +
      '<p class="mt-16" style="color:var(--texte)">« ' + esc(a.texte) + ' »</p>' +
      '<div class="sep"></div>' +
      '<div class="petit"><b>' + esc(c ? c.noms : '—') + '</b> à propos de <b>' + esc(p ? p.nom : '—') + '</b></div>' +
      (a.motifSignalement ? '<div class="encart ambre mt-16">' + ico('alert') +
        '<p><b>Signalement.</b> ' + esc(a.motifSignalement) + '</p></div>' : '') +
      '<div class="pile mt-16">' +
        '<button class="btn btn-vert btn-sm" data-pub="' + esc(a.id) + '">' + ico('check') + ' Publier</button>' +
        '<button class="btn btn-rouge btn-sm" data-masq="' + esc(a.id) + '">' + ico('eye-off') + ' Masquer</button>' +
      '</div></div>';
  }

  /* ================================================================
     8. LITIGES
     ================================================================ */
  var litiges = {
    titre: 'Litiges',
    html: function () {
      var liste = BW.list('litiges');
      var ouverts = liste.filter(function (l) { return l.statut === 'ouvert'; });
      var bloque = ouverts.reduce(function (s, l) { return s + l.montant; }, 0);

      return '' +
        '<div class="page-head"><div class="fill">' +
          '<h2>' + ouverts.length + ' litige' + (ouverts.length > 1 ? 's' : '') + ' ouvert' + (ouverts.length > 1 ? 's' : '') + '</h2>' +
          '<p>' + BW.fcfa(bloque) + ' d\'acomptes bloqués en séquestre. Le cahier des charges impose une résolution sous 5 jours ouvrés.</p>' +
        '</div></div>' +

        (liste.length ? '<div class="pile-v" style="gap:16px">' + liste.map(function (l) {
          var c = BW.couple(l.couple), p = BW.prestataire(l.prestataire);
          return '<div class="carte">' +
            '<div class="entre" style="align-items:flex-start">' +
              '<div><div class="pile">' + tag(l.statut, BW.STATUT_LITIGE) +
                '<span class="tag ' + (l.priorite === 'haute' ? 'bad' : 'wait') + '">Priorité ' + esc(l.priorite) + '</span>' +
                '<span class="petit muet">Ouvert le ' + BW.date(l.ouvertLe) + '</span></div>' +
                '<h3 class="mt-8">' + esc(l.objet) + '</h3></div>' +
              '<div class="droite"><div class="petit muet">Montant en jeu</div>' +
                '<b style="font-size:18px">' + BW.fcfa(l.montant) + '</b></div>' +
            '</div>' +
            '<p class="mt-16">' + esc(l.detail) + '</p>' +
            '<div class="sep"></div>' +
            '<div class="grille g2 petit">' +
              infoLigne('Couple', c ? c.noms + ' — ' + c.email : '—') +
              infoLigne('Prestataire', p ? p.nom + ' — ' + p.contact.email : '—') +
            '</div>' +
            (l.statut === 'ouvert' ? '<div class="pile mt-16">' +
              '<button class="btn btn-vert btn-sm" data-rembourse="' + esc(l.id) + '">' + ico('money') + ' Rembourser le couple</button>' +
              '<button class="btn btn-neutre btn-sm" data-reverse="' + esc(l.id) + '">' + ico('check') + ' Reverser au prestataire</button>' +
              '</div>' : '') +
          '</div>';
        }).join('') + '</div>'
        : '<div class="plat">' + UI.vide('check-circle', 'Aucun litige', 'Aucune procédure en cours.') + '</div>');
    },
    apres: function () {
      $$('[data-rembourse]').forEach(function (b) {
        b.addEventListener('click', function () {
          var l = BW.get('litiges', b.getAttribute('data-rembourse'));
          UI.confirmer('Rembourser le couple',
            'L\'acompte de ' + BW.fcfa(l.montant) + ' sera restitué sous 5 jours ouvrés et le litige clos.',
            'Confirmer le remboursement', function () {
              BW.update('litiges', l.id, { statut: 'resolu' });
              UI.toast('Remboursement engagé, litige clos'); rendre();
            });
        });
      });
      $$('[data-reverse]').forEach(function (b) {
        b.addEventListener('click', function () {
          var l = BW.get('litiges', b.getAttribute('data-reverse'));
          UI.confirmer('Reverser au prestataire',
            'L\'acompte de ' + BW.fcfa(l.montant) + ' sera versé au prestataire et le litige clos.',
            'Confirmer le versement', function () {
              BW.update('litiges', l.id, { statut: 'resolu' });
              UI.toast('Versement engagé, litige clos'); rendre();
            });
        });
      });
    }
  };

  /* ================================================================
     9. REVENUS ET ABONNEMENTS
     ================================================================ */
  var revenus = {
    titre: 'Revenus & abonnements',
    html: function () {
      var s = BW.stats();
      var offres = BW.list('offres');
      var valides = BW.list('prestataires', { statut: 'valide' });
      var paiements = BW.list('paiements', { type: 'abonnement' });
      var encaisse = paiements.filter(function (p) { return p.statut === 'paye'; })
        .reduce(function (x, p) { return x + p.montant; }, 0);
      var echecs = paiements.filter(function (p) { return p.statut === 'echoue'; });

      var parOffre = offres.map(function (o) {
        var n = valides.filter(function (p) { return p.abonnement === o.id; }).length;
        return { offre: o, n: n, mrr: n * o.prix };
      });
      var maxMrr = Math.max.apply(null, parOffre.map(function (x) { return x.mrr; })) || 1;

      return '' +
        '<div class="page-head"><div class="fill">' +
          '<h2>Revenus des abonnements</h2>' +
          '<p>Modèle d\'abonnement mensuel des prestataires, hors commissions sur acomptes.</p>' +
        '</div></div>' +

        '<div class="grille g4">' +
          kpi('trend', 'vert', 'Revenu mensuel récurrent', BW.fcfa(s.mrr)) +
          kpi('money', '', 'Encaissé ce mois', BW.fcfa(encaisse)) +
          kpi('lock', 'bleu', 'Sous séquestre', BW.fcfa(s.sequestre)) +
          kpi('alert', 'ambre', 'Paiements échoués', echecs.length) +
        '</div>' +

        '<div class="grille g2 mt-16">' +
          '<div class="carte">' +
            '<div class="carte-tete"><h3>Répartition par offre</h3></div>' +
            '<div class="pile-v" style="gap:16px">' + parOffre.map(function (x) {
              return '<div>' +
                '<div class="entre"><span class="pile"><span class="tag or">' + esc(x.offre.nom) + '</span>' +
                  '<span class="petit muet">' + BW.fcfa(x.offre.prix) + ' / mois</span></span>' +
                  '<b>' + x.n + ' abonné' + (x.n > 1 ? 's' : '') + ' · ' + BW.fcfa(x.mrr) + '</b></div>' +
                '<div class="jauge mt-8"><i style="width:' + Math.round((x.mrr / maxMrr) * 100) + '%"></i></div>' +
                '</div>';
            }).join('') + '</div>' +
          '</div>' +

          '<div class="carte">' +
            '<div class="carte-tete"><h3>Détail des offres</h3></div>' +
            '<div class="pile-v" style="gap:14px">' + offres.map(function (o) {
              return '<div style="border:1px solid var(--bordure-pale);border-radius:var(--r);padding:14px">' +
                '<div class="entre"><b>' + esc(o.nom) + '</b><b>' + BW.fcfa(o.prix) + ' / mois</b></div>' +
                '<ul class="pile-v petit mt-8">' + o.avantages.map(function (a) {
                  return '<li>' + ico('check', 'ico-sm') + ' ' + esc(a) + '</li>';
                }).join('') + '</ul></div>';
            }).join('') + '</div>' +
          '</div>' +
        '</div>' +

        '<div class="carte mt-16">' +
          '<div class="carte-tete"><h3>Abonnés par prestataire</h3></div>' +
          '<div class="tbl-wrap"><table class="data"><thead><tr>' +
            '<th>Prestataire</th><th>Offre</th><th class="num">Montant mensuel</th>' +
            '<th>Dernier paiement</th><th>Statut</th>' +
          '</tr></thead><tbody>' + valides.map(function (p) {
            var o = BW.get('offres', p.abonnement);
            var dernier = BW.list('paiements', { prestataire: p.id, type: 'abonnement' })[0];
            return '<tr><td>' + cellulePrestataire(p) + '</td>' +
              '<td>' + (o ? '<span class="tag or">' + esc(o.nom) + '</span>' : '<span class="muet petit">Aucun</span>') + '</td>' +
              '<td class="num">' + BW.fcfa(o ? o.prix : 0) + '</td>' +
              '<td class="petit">' + (dernier ? BW.dateCourte(dernier.date) + ' · ' + esc(dernier.moyen) : '—') + '</td>' +
              '<td>' + (dernier ? tag(dernier.statut, BW.STATUT_PAIEMENT) : '<span class="tag">—</span>') + '</td></tr>';
          }).join('') + '</tbody></table></div>' +
        '</div>';
    }
  };

  /* ================================================================
     10. PAIEMENTS
     ================================================================ */
  var paiements = {
    titre: 'Paiements',
    html: function () {
      var liste = BW.list('paiements');
      var parMoyen = {};
      liste.filter(function (p) { return p.statut === 'paye'; }).forEach(function (p) {
        parMoyen[p.moyen] = (parMoyen[p.moyen] || 0) + p.montant;
      });
      var moyens = Object.keys(parMoyen).map(function (k) { return { moyen: k, total: parMoyen[k] }; })
        .sort(function (a, b) { return b.total - a.total; });
      var maxM = moyens.length ? moyens[0].total : 1;

      return '' +
        '<div class="page-head"><div class="fill">' +
          '<h2>' + liste.length + ' transactions</h2>' +
          '<p>Abonnements des prestataires et acomptes des couples, tous transitant par Paystack.</p>' +
        '</div></div>' +

        '<div class="grille g-1-2">' +
          '<div class="carte">' +
            '<div class="carte-tete"><h3>Par moyen de paiement</h3></div>' +
            '<div class="pile-v" style="gap:14px">' + moyens.map(function (m) {
              return '<div><div class="entre petit"><span>' + esc(m.moyen) + '</span><b>' + BW.fcfa(m.total) + '</b></div>' +
                '<div class="jauge mt-8"><i style="width:' + Math.round((m.total / maxM) * 100) + '%"></i></div></div>';
            }).join('') + '</div>' +
            '<div class="encart info mt-16">' + ico('mobile') +
              '<p>Le Mobile Money représente la majorité des encaissements, conformément aux usages ivoiriens.</p></div>' +
          '</div>' +

          '<div class="carte">' +
            '<div class="carte-tete"><h3>Journal des transactions</h3>' +
              barreRecherche('Rechercher…', 'q-pay') + '</div>' +
            '<div class="tbl-wrap"><table class="data" style="min-width:0"><thead><tr>' +
              '<th>Date</th><th>Contrepartie</th><th>Type</th><th>Moyen</th><th class="num">Montant</th><th>Statut</th>' +
            '</tr></thead><tbody id="corps-pay">' + liste.map(function (p) {
              var pr = BW.prestataire(p.prestataire);
              var c = p.couple ? BW.couple(p.couple) : null;
              return '<tr><td class="petit">' + BW.dateCourte(p.date) + '</td>' +
                '<td class="petit"><b>' + esc(pr ? pr.nom : '—') + '</b>' +
                  (c ? '<br><span class="muet">Acompte de ' + esc(c.noms) + '</span>' : '') + '</td>' +
                '<td>' + (p.type === 'abonnement' ? '<span class="tag">Abonnement</span>' : '<span class="tag info">Acompte</span>') + '</td>' +
                '<td class="petit">' + esc(p.moyen) + '</td>' +
                '<td class="num">' + BW.fcfa(p.montant) + '</td>' +
                '<td>' + tag(p.statut, BW.STATUT_PAIEMENT) + '</td></tr>';
            }).join('') + '</tbody></table></div>' +
          '</div>' +
        '</div>';
    },
    apres: function () {
      $('#q-pay').addEventListener('input', function () {
        UI.filtrerLignes('#corps-pay tr', this.value);
      });
    }
  };

  /* ================================================================
     11. BLOG
     ================================================================ */
  var blog = {
    titre: 'Articles du blog',
    html: function () {
      var liste = BW.list('articles');
      var vues = liste.reduce(function (s, a) { return s + a.vues; }, 0);
      return '' +
        '<div class="page-head"><div class="fill">' +
          '<h2>' + liste.length + ' articles</h2>' +
          '<p>' + vues.toLocaleString('fr-FR') + ' vues cumulées. Le blog est le principal levier d\'acquisition SEO.</p>' +
        '</div>' +
        '<button class="btn btn-primary" id="add-art">' + ico('plus') + ' Nouvel article</button></div>' +

        '<div class="plat"><div class="tbl-wrap"><table class="data"><thead><tr>' +
          '<th>Titre</th><th>Catégorie</th><th>Auteur</th><th>Mot-clé cible</th>' +
          '<th class="num">Vues</th><th>Statut</th><th class="actions">Actions</th>' +
        '</tr></thead><tbody>' + liste.map(function (a) {
          return '<tr><td><b>' + esc(a.titre) + '</b><br><span class="petit muet">' + BW.dateCourte(a.date) + '</span></td>' +
            '<td><span class="tag corail">' + esc(a.categorie) + '</span></td>' +
            '<td class="petit">' + esc(a.auteur) + '</td>' +
            '<td class="petit muet">' + esc(a.motsCles) + '</td>' +
            '<td class="num">' + a.vues.toLocaleString('fr-FR') + '</td>' +
            '<td>' + tag(a.statut, BW.STATUT_ARTICLE) + '</td>' +
            '<td class="actions"><span class="pile" style="justify-content:flex-end">' +
              (a.statut !== 'publie' ? '<button class="btn-ico" data-pub-art="' + esc(a.id) + '" aria-label="Publier">' + ico('check') + '</button>' : '') +
              '<button class="btn-ico danger" data-del-art="' + esc(a.id) + '" aria-label="Supprimer">' + ico('trash') + '</button>' +
            '</span></td></tr>';
        }).join('') + '</tbody></table></div></div>';
    },
    apres: function () {
      $('#add-art').addEventListener('click', function () {
        UI.modale('Nouvel article',
          '<div class="champ"><label for="art-titre">Titre</label>' +
            '<input class="inp" id="art-titre" placeholder="Traiteur mariage Abidjan : prix et conseils"></div>' +
          '<div class="rangee d2">' +
            '<div class="champ"><label for="art-cat">Catégorie</label><select class="inp" id="art-cat">' +
              ['Budget', 'Organisation', 'Inspiration', 'Prestataires', 'Traditions'].map(function (c) {
                return '<option>' + c + '</option>'; }).join('') + '</select></div>' +
            '<div class="champ"><label for="art-auteur">Auteur</label>' +
              '<input class="inp" id="art-auteur" value="Aïcha Traoré"></div>' +
          '</div>' +
          '<div class="champ"><label for="art-kw">Mot-clé cible</label>' +
            '<input class="inp" id="art-kw" placeholder="traiteur mariage abidjan prix">' +
            '<span class="aide">Doit apparaître dans le titre, l\'introduction et un intertitre.</span></div>',
          '<button class="btn btn-neutre" data-fermer>Annuler</button>' +
          '<button class="btn btn-primary" id="art-ok">Créer le brouillon</button>');

        $('#art-ok').addEventListener('click', function () {
          var titre = $('#art-titre').value.trim();
          if (!titre) { UI.toast('Le titre est obligatoire'); return; }
          BW.create('articles', {
            titre: titre, categorie: $('#art-cat').value, auteur: $('#art-auteur').value.trim(),
            statut: 'brouillon', date: new Date().toISOString().slice(0, 10), vues: 0,
            motsCles: $('#art-kw').value.trim()
          });
          UI.fermerModale(); UI.toast('Brouillon créé'); rendre();
        });
      });

      $$('[data-pub-art]').forEach(function (b) {
        b.addEventListener('click', function () {
          BW.update('articles', b.getAttribute('data-pub-art'), { statut: 'publie' });
          UI.toast('Article publié'); rendre();
        });
      });
      $$('[data-del-art]').forEach(function (b) {
        b.addEventListener('click', function () {
          UI.confirmer('Supprimer l\'article', 'Cette action est définitive.', 'Supprimer', function () {
            BW.remove('articles', b.getAttribute('data-del-art'));
            UI.toast('Article supprimé'); rendre();
          }, true);
        });
      });
    }
  };

  /* ================================================================
     12. PARAMÈTRES
     ================================================================ */
  var parametres = {
    titre: 'Paramètres',
    html: function () {
      return '' +
        '<div class="page-head"><div class="fill">' +
          '<h2>Paramètres de la plateforme</h2>' +
          '<p>Réglages partagés par le site, la marketplace et l\'application mobile.</p>' +
        '</div></div>' +

        '<div class="grille g2">' +
          '<div class="carte">' +
            '<div class="carte-tete"><h3>Identité</h3></div>' +
            '<div class="champ"><label for="s-nom">Nom de la plateforme</label>' +
              '<input class="inp" id="s-nom" value="Babi Wedding"></div>' +
            '<div class="champ"><label for="s-domaine">Domaine</label>' +
              '<input class="inp" id="s-domaine" value="babiwedding.ci"></div>' +
            '<div class="champ"><label for="s-contact">Courriel de contact</label>' +
              '<input class="inp" id="s-contact" type="email" value="contact@babiwedding.ci"></div>' +
          '</div>' +

          '<div class="carte">' +
            '<div class="carte-tete"><h3>Règles de la marketplace</h3></div>' +
            '<div class="champ"><label for="s-delai">Délai de validation des profils</label>' +
              '<select class="inp" id="s-delai"><option>24 heures</option><option selected>48 heures</option><option>72 heures</option></select></div>' +
            '<div class="champ"><label for="s-litige">Délai de traitement des litiges</label>' +
              '<select class="inp" id="s-litige"><option>3 jours ouvrés</option><option selected>5 jours ouvrés</option><option>10 jours ouvrés</option></select></div>' +
            '<div class="champ"><label for="s-reverse">Reversement après prestation</label>' +
              '<select class="inp" id="s-reverse"><option selected>3 jours</option><option>7 jours</option><option>14 jours</option></select></div>' +
            '<label class="coche"><input type="checkbox" checked> <span>Modération obligatoire du premier avis de chaque prestataire</span></label>' +
            '<label class="coche"><input type="checkbox" checked> <span>Masquer les coordonnées jusqu\'à acceptation du devis</span></label>' +
          '</div>' +

          '<div class="carte">' +
            '<div class="carte-tete"><h3>Paiements</h3></div>' +
            '<div class="champ"><label for="s-psp">Prestataire de paiement</label>' +
              '<input class="inp" id="s-psp" value="Paystack" disabled></div>' +
            '<div class="pile-v petit">' +
              '<label class="coche"><input type="checkbox" checked> Orange Money</label>' +
              '<label class="coche"><input type="checkbox" checked> MTN MoMo</label>' +
              '<label class="coche"><input type="checkbox" checked> Wave</label>' +
              '<label class="coche"><input type="checkbox" checked> Carte bancaire (Visa, Mastercard)</label>' +
            '</div>' +
            '<div class="champ mt-16"><label for="s-acompte">Acompte demandé à la réservation</label>' +
              '<select class="inp" id="s-acompte"><option>20 %</option><option selected>30 %</option><option>50 %</option></select></div>' +
          '</div>' +

          '<div class="carte">' +
            '<div class="carte-tete"><h3>Données de démonstration</h3></div>' +
            '<p class="petit">Les trois interfaces lisent le même jeu de données, conservé dans votre navigateur. ' +
              'La réinitialisation restaure l\'état d\'origine sans toucher au code.</p>' +
            '<div class="encart ambre mt-16">' + ico('alert') +
              '<p>En production, cette couche sera remplacée par Supabase. Le schéma SQL complet est fourni dans <b>db/schema.sql</b>.</p></div>' +
            '<button class="btn btn-neutre btn-block mt-16" id="s-reset">' + ico('refresh') + ' Réinitialiser les données</button>' +
          '</div>' +
        '</div>' +

        '<div class="pile mt-24"><button class="btn btn-primary" id="s-save">Enregistrer les paramètres</button></div>';
    },
    apres: function () {
      $('#s-save').addEventListener('click', function () { UI.toast('Paramètres enregistrés'); });
      $('#s-reset').addEventListener('click', resetDemo);
    }
  };

  function resetDemo() {
    UI.confirmer('Réinitialiser la démonstration',
      'Toutes vos modifications seront effacées et le jeu de données d\'origine restauré.',
      'Réinitialiser', function () {
        BW.reset(); UI.toast('Données réinitialisées'); rendre(); majBadges();
      }, true);
  }

  /* ================================================================
     Badges de la barre latérale
     ================================================================ */
  function majBadges() {
    var s = BW.stats();
    var set = function (sel, n) {
      var el = $(sel);
      if (!el) return;
      el.textContent = n;
      el.classList.toggle('hide', !n);
    };
    set('#badge-validation', s.prestatairesAttente);
    set('#badge-avis', s.avisAModerer);
    set('#badge-litiges', s.litigesOuverts);
  }

  /* ================================================================
     Démarrage
     ================================================================ */
  UI.initSide();

  rendre = UI.routeur({
    '': tableau, 'tableau': tableau,
    'validation': validation,
    'prestataires': prestataires,
    'categories': categories,
    'couples': couples,
    'devis': devis,
    'avis': avis,
    'litiges': litiges,
    'revenus': revenus,
    'paiements': paiements,
    'blog': blog,
    'parametres': parametres
  }, 'tableau');

  var rendreOriginal = rendre;
  rendre = function () { rendreOriginal(); majBadges(); };

  majBadges();
  var reset = $('#reset-db');
  if (reset) reset.addEventListener('click', function (e) { e.preventDefault(); resetDemo(); });
})();
