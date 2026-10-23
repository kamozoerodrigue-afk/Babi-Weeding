/* ==========================================================================
   BABI WEDDING — couche de données partagée

   Site vitrine, marketplace web, portail prestataire, panel d'administration
   et application mobile lisent tous la même base Supabase.

   L'API publique n'a pas changé — BW.list, BW.get, BW.create, BW.update,
   BW.remove restent synchrones — mais elle s'appuie désormais sur un cache
   hydraté au démarrage depuis PostgreSQL :

       BW.boot(['market.js'])   charge la base puis la page
       BW.list('prestataires', { statut: 'valide' })
       BW.create('devis', { ... })     écrit en base en arrière-plan

   Les écritures partent immédiatement vers Supabase ; le cache local est mis
   à jour dans la foulée pour que l'affichage reste instantané. En cas d'échec
   la modification est annulée et l'évènement « bw:erreur » est émis.

   Sans configuration (assets/js/config.js vide) ou sans réseau, la couche
   bascule sur le jeu de démonstration hors ligne, et les pages continuent de
   s'ouvrir par double-clic.
   ========================================================================== */
(function (global) {
  'use strict';

  var CFG  = global.BW_CONFIG || {};
  var BASE = null;          // client Supabase
  var etat = 'demo';        // 'supabase' | 'demo'
  var cache = {};           // table -> tableau au format applicatif
  var prets = [];           // rappels enregistrés via BW.ready
  var hydrate = false;
  var enCours = [];         // écritures en vol
  var totaux = null;        // totaux publics renvoyés par la base

  /* =========================================================================
     1. CORRESPONDANCE ENTRE LES COLONNES SQL ET LES CHAMPS DU FRONT
     Le front travaille en camelCase, PostgreSQL en snake_case. Toute la
     traduction est centralisée ici : aucune vue n'a eu à être modifiée.
     ========================================================================= */
  var SCHEMA = {
    categories: {
      table: 'categories', vue: 'categories', tri: 'ordre',
      champs: { id: 'id', label: 'label', singulier: 'singulier', icon: 'icone', ordre: 'ordre' }
    },
    villes: {
      table: 'villes', vue: 'villes', tri: 'nom', brut: true,
      champs: { id: 'id', nom: 'nom', region: 'region' },
      versApp: function (r) { return r.nom; }          // le front attend des chaînes
    },
    offres: {
      table: 'offres', vue: 'offres', tri: 'ordre',
      champs: { id: 'id', nom: 'nom', prix: 'prix_fcfa', periode: 'periode', avantages: 'avantages' }
    },
    trafic: {
      table: 'trafic', vue: 'trafic', tri: 'ordre',
      champs: { id: 'id', mois: 'mois', annee: 'annee', ordre: 'ordre',
                sessions: 'sessions', inscriptions: 'inscriptions', devis: 'devis' }
    },
    prestataires: {
      table: 'prestataires', vue: 'prestataires_publics', tri: 'nom',
      champs: {
        id: 'id', slug: 'slug', nom: 'nom', categorie: 'categorie_id', ville: 'ville',
        commune: 'commune', statut: 'statut', certifie: 'certifie', sponsorise: 'sponsorise',
        accroche: 'accroche', description: 'description', capacite: 'capacite',
        delaiReponse: 'delai_reponse', prixMin: 'prix_min_fcfa', unite: 'unite_prix',
        photos: 'photos', note: 'note_moyenne', avis: 'nb_avis', abonnement: 'offre',
        rccm: 'rccm', motifRefus: 'motif_refus', inscritLe: 'cree_le', contact: 'contact',
        proprietaire: 'proprietaire'
      },
      /* La vue publique n'expose ni courriel ni téléphone : on reconstitue
         un objet contact partiel pour que les gabarits restent identiques. */
      versApp: function (r, o) {
        if (!o.contact || typeof o.contact !== 'object') {
          o.contact = { nom: r.contact_nom || '', role: r.contact_role || '',
                        avatar: r.contact_avatar || '', email: '', tel: '' };
        }
        o.contact = o.contact || {};
        if (!o.statut) o.statut = 'valide';
        o.note = Number(o.note || 0);
        o.avis = Number(o.avis || 0);
        return o;
      },
      versDb: function (o, d) {
        if (o.contact) {
          d.email_contact = o.contact.email || null;
          d.tel_contact   = o.contact.tel   || null;
        }
        if (!d.slug && o.nom) d.slug = BWslug(o.nom) + '-' + String(d.id || '').slice(0, 4);
        return d;
      }
    },
    services: {
      table: 'services', vue: 'services_publics', tri: 'ordre',
      champs: {
        id: 'id', prestataire: 'prestataire_id', nom: 'nom', description: 'description',
        prix: 'prix_fcfa', unite: 'unite', duree: 'duree', inclus: 'inclus',
        actif: 'actif', ordre: 'ordre'
      },
      versApp: function (r, o) { if (o.actif === undefined) o.actif = true; return o; }
    },
    couples: {
      table: 'couples', vue: null, tri: 'noms',
      champs: {
        id: 'id', profil: 'profil_id', noms: 'noms', email: 'email', tel: 'tel',
        ville: 'ville', dateMariage: 'date_mariage', invites: 'nb_invites',
        budget: 'budget_fcfa', diaspora: 'diaspora', statut: 'statut', inscritLe: 'cree_le'
      }
    },
    devis: {
      table: 'devis', vue: null, tri: '-envoye_le',
      champs: {
        id: 'id', couple: 'couple_id', prestataire: 'prestataire_id', service: 'service_id',
        statut: 'statut', message: 'message', dateEvenement: 'date_evenement',
        invites: 'nb_invites', montant: 'montant_fcfa', reponse: 'reponse',
        envoyeLe: 'envoye_le', reponduLe: 'repondu_le',
        contactNom: 'contact_nom', contactEmail: 'contact_email', contactTel: 'contact_tel'
      }
    },
    avis: {
      table: 'avis', vue: 'avis_publics', tri: '-cree_le',
      champs: {
        id: 'id', prestataire: 'prestataire_id', couple: 'couple_id', devis: 'devis_id',
        note: 'note', texte: 'texte', statut: 'statut', signalePar: 'signale_par',
        motifSignalement: 'motif_signalement', reponse: 'reponse_prestataire', date: 'cree_le'
      },
      versApp: function (r, o) {
        if (!o.statut) o.statut = 'publie';
        if (r.couple_noms) o.coupleNoms = r.couple_noms;
        return o;
      }
    },
    paiements: {
      table: 'paiements', vue: null, tri: '-date_operation',
      champs: {
        id: 'id', prestataire: 'prestataire_id', couple: 'couple_id', devis: 'devis_id',
        type: 'type', offre: 'offre', montant: 'montant_fcfa', moyen: 'moyen',
        statut: 'statut', date: 'date_operation', reference: 'reference_psp'
      }
    },
    litiges: {
      table: 'litiges', vue: null, tri: '-ouvert_le',
      champs: {
        id: 'id', couple: 'couple_id', prestataire: 'prestataire_id', paiement: 'paiement_id',
        objet: 'objet', detail: 'detail', montant: 'montant_fcfa', statut: 'statut',
        priorite: 'priorite', decision: 'decision', ouvertLe: 'ouvert_le', closLe: 'clos_le'
      }
    },
    articles: {
      table: 'articles', vue: 'articles_publics', tri: '-cree_le',
      champs: {
        id: 'id', slug: 'slug', titre: 'titre', chapo: 'chapo', contenu: 'contenu',
        categorie: 'categorie', auteur: 'auteur_nom', image: 'image_url',
        motsCles: 'mots_cles', metaDesc: 'meta_desc', statut: 'statut', vues: 'vues',
        minutes: 'minutes_lecture', date: 'cree_le', publieLe: 'publie_le'
      },
      versApp: function (r, o) {
        if (!o.statut) o.statut = 'publie';
        if (o.publieLe) o.date = o.publieLe;
        return o;
      },
      versDb: function (o, d) {
        if (!d.slug && o.titre) d.slug = BWslug(o.titre);
        if (o.statut === 'publie' && !d.publie_le) d.publie_le = new Date().toISOString();
        return d;
      }
    },
    conversations: {
      table: 'conversations', vue: null, tri: '-cree_le',
      champs: { id: 'id', couple: 'couple_id', prestataire: 'prestataire_id',
                devis: 'devis_id', creeLe: 'cree_le' }
    },
    messages: {
      table: 'messages', vue: null, tri: 'envoye_le',
      champs: { id: 'id', conversation: 'conversation_id', auteur: 'auteur_id',
                contenu: 'contenu', lu: 'lu', envoyeLe: 'envoye_le' }
    }
  };

  /* Tables rafraîchies en temps réel entre les onglets ouverts. */
  var TEMPS_REEL = ['prestataires', 'services', 'devis', 'avis', 'paiements',
                    'litiges', 'articles', 'couples', 'messages'];

  /* =========================================================================
     2. OUTILS
     ========================================================================= */
  function BWslug(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
  }

  function uuid() {
    if (global.crypto && global.crypto.randomUUID) return global.crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  function versApp(nom, ligne) {
    var def = SCHEMA[nom];
    if (!def) return ligne;
    if (def.brut && def.versApp) return def.versApp(ligne);
    var o = {};
    Object.keys(def.champs).forEach(function (k) {
      var col = def.champs[k];
      if (ligne[col] !== undefined) o[k] = ligne[col];
    });
    return def.versApp ? def.versApp(ligne, o) : o;
  }

  function versDb(nom, obj) {
    var def = SCHEMA[nom];
    if (!def) return obj;
    var d = {};
    Object.keys(def.champs).forEach(function (k) {
      if (obj[k] !== undefined) d[def.champs[k]] = obj[k];
    });
    return def.versDb ? def.versDb(obj, d) : d;
  }

  function fusionner(publique, privee) {
    var index = {};
    publique.forEach(function (r) { index[r.id] = r; });
    privee.forEach(function (r) { index[r.id] = Object.assign({}, index[r.id] || {}, r); });
    return Object.keys(index).map(function (k) { return index[k]; });
  }

  function emettre(nom, detail) {
    try {
      global.dispatchEvent(new CustomEvent(nom, { detail: detail || {} }));
    } catch (e) { /* navigateur ancien : silencieux */ }
  }

  function signaler(message, erreur) {
    if (global.console) global.console.error('[Babi Wedding]', message, erreur || '');
    emettre('bw:erreur', { message: message, erreur: erreur });
  }

  /* =========================================================================
     3. CHARGEMENT DE LA BASE
     ========================================================================= */
  function charger(url) {
    /* Les scripts du site portent le numéro de version : le navigateur ne
       peut pas servir une ancienne copie après une mise à jour. */
    if (url.indexOf('//') === -1 && CFG.version && url.indexOf('?') === -1) {
      url += '?v=' + CFG.version;
    }
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = url; s.async = false;
      s.onload = resolve;
      s.onerror = function () { reject(new Error('Script introuvable : ' + url)); };
      document.head.appendChild(s);
    });
  }

  function configuree() {
    return !!(CFG.url && CFG.anonKey && CFG.url.indexOf('http') === 0);
  }

  function selectionner(source, tri) {
    var r = BASE.from(source).select('*');
    if (tri) {
      var desc = tri.charAt(0) === '-';
      r = r.order(desc ? tri.slice(1) : tri, { ascending: !desc });
    }
    return r.then(function (res) { return res.error ? [] : (res.data || []); })
            .catch(function () { return []; });
  }

  function hydrater() {
    var noms = Object.keys(SCHEMA);
    return Promise.all(noms.map(function (nom) {
      var def = SCHEMA[nom];
      var sources = [];
      if (def.vue && def.vue !== def.table) sources.push(selectionner(def.vue, def.tri));
      sources.push(selectionner(def.table, def.tri));
      return Promise.all(sources).then(function (jeux) {
        var lignes = jeux.length === 2 ? fusionner(jeux[0], jeux[1]) : jeux[0];
        cache[nom] = lignes.map(function (l) { return versApp(nom, l); });
      });
    })).then(function () {
      /* Le front attend un tableau de chaînes pour les villes. */
      if (!cache.villes || !cache.villes.length) cache.villes = [];
      /* Totaux affichés sur la page d'accueil. Ils portent sur des tables
         fermées aux visiteurs : seule la fonction SQL les expose. */
      return BASE.rpc('statistiques_publiques')
        .then(function (r) { totaux = (r.data && r.data[0]) || null; })
        .catch(function () { totaux = null; });
    }).then(function () {
      hydrate = true;
    });
  }

  function modeDemo(raison) {
    etat = 'demo';
    var seed = global.BW_DEMO;
    if (!seed) { signaler('Jeu de démonstration absent : ' + raison); cache = {}; return; }
    Object.keys(seed).forEach(function (k) {
      if (k === 'version') return;
      cache[k] = JSON.parse(JSON.stringify(seed[k]));
    });
    hydrate = true;
    if (global.console) global.console.warn('[Babi Wedding] Mode démonstration hors ligne — ' + raison);
    emettre('bw:demo', { raison: raison });
  }

  function tempsReel() {
    try {
      var canal = BASE.channel('bw-tout');
      TEMPS_REEL.forEach(function (nom) {
        var def = SCHEMA[nom];
        canal.on('postgres_changes',
          { event: '*', schema: 'public', table: def.table },
          function (charge) { appliquerDistant(nom, charge); });
      });
      canal.subscribe();
    } catch (e) { /* le temps réel est un confort, pas une dépendance */ }
  }

  var minuteurTotaux = null;
  function relireTotaux() {
    if (etat !== 'supabase') return Promise.resolve();
    return BASE.rpc('statistiques_publiques').then(function (r) {
      var neuf = (r.data && r.data[0]) || null;
      if (!neuf) return;
      totaux = neuf;
      emettre('bw:totaux', totaux);
    }).catch(function () { /* les compteurs gardent leur dernière valeur */ });
  }

  /* Les totaux sont recalculés par la base ; on ne la sollicite qu'une fois
     par rafale de modifications. */
  function programmerTotaux() {
    clearTimeout(minuteurTotaux);
    minuteurTotaux = setTimeout(relireTotaux, 900);
  }

  function appliquerDistant(nom, charge) {
    var liste = cache[nom] || (cache[nom] = []);
    var id = (charge['new'] && charge['new'].id) || (charge.old && charge.old.id);
    if (!id) return;
    var i = liste.findIndex(function (r) { return r.id === id; });
    if (charge.eventType === 'DELETE') {
      if (i > -1) liste.splice(i, 1);
    } else {
      var o = versApp(nom, charge['new']);
      if (i > -1) liste[i] = Object.assign({}, liste[i], o); else liste.push(o);
    }
    emettre('bw:change', { table: nom, type: charge.eventType });
    programmerTotaux();
  }

  /* =========================================================================
     4. DÉMARRAGE
     Chaque page appelle BW.boot([...scripts]) : la base est chargée, puis
     les scripts de la page sont injectés dans l'ordre indiqué.
     ========================================================================= */
  function demarrer() {
    if (!configuree()) {
      return charger(chemin('assets/js/demo-data.js'))
        .then(function () { modeDemo('configuration absente'); })
        .catch(function () { modeDemo('configuration absente'); });
    }
    return charger(CFG.sdk)
      .then(function () {
        BASE = global.supabase.createClient(CFG.url, CFG.anonKey, {
          auth: { persistSession: true, autoRefreshToken: true, storageKey: 'bw-session' }
        });
        etat = 'supabase';
        global.BW.base = BASE;
        return global.BW.auth._init();
      })
      .then(hydrater)
      .then(tempsReel)
      .catch(function (e) {
        signaler('Connexion à la base impossible, bascule en démonstration.', e);
        return charger(chemin('assets/js/demo-data.js'))
          .then(function () { modeDemo('base injoignable'); })
          .catch(function () { modeDemo('base injoignable'); });
      });
  }

  /* Résout un chemin relatif à la racine du site, quelle que soit la
     profondeur de la page (/, /app/, /pro/, /admin/). */
  function chemin(rel) {
    var base = document.currentScript && document.currentScript.src;
    if (!base) {
      var s = document.querySelector('script[src*="store.js"]');
      base = s ? s.src : location.href;
    }
    return base.replace(/assets\/js\/store\.js.*$/, '') + rel;
  }

  var promesseDemarrage = null;
  function pret() {
    if (!promesseDemarrage) {
      promesseDemarrage = demarrer().then(function () {
        prets.forEach(function (fn) { try { fn(); } catch (e) { signaler('Rappel bw:ready', e); } });
        prets = [];
        emettre('bw:pret', { mode: etat });
      });
    }
    return promesseDemarrage;
  }

  /* =========================================================================
     5. ÉCRITURES
     ========================================================================= */
  function ecrire(promesse, annuler, message) {
    var p = promesse.then(function (res) {
      if (res && res.error) throw res.error;
      return res;
    }).catch(function (e) {
      if (annuler) annuler();
      signaler(message, e);
    });
    enCours.push(p);
    p.then(function () {
      var i = enCours.indexOf(p);
      if (i > -1) enCours.splice(i, 1);
    });
    return p;
  }

  function table(nom) { return cache[nom] || (cache[nom] = []); }

  /* =========================================================================
     6. API PUBLIQUE — inchangée pour les vues existantes
     ========================================================================= */
  var BW = {

    /** 'supabase' quand la base répond, 'demo' en repli hors ligne. */
    get mode() { return etat; },

    /** Vrai une fois le cache hydraté. */
    get charge() { return hydrate; },

    /** Client Supabase brut, pour les besoins qui sortent de cette API. */
    base: null,

    /**
     * Démarre la couche de données puis injecte les scripts de la page.
     * À appeler une seule fois, en dernier, dans chaque page HTML.
     *   BW.boot(['market.js'])
     */
    boot: function (scripts) {
      return pret().then(function () {
        return (scripts || []).reduce(function (chaine, src) {
          return chaine.then(function () { return charger(src); });
        }, Promise.resolve());
      }).catch(function (e) { signaler('Démarrage de la page', e); });
    },

    /** Exécute le rappel une fois la base chargée. */
    ready: function (fn) {
      if (hydrate) { fn(); return Promise.resolve(); }
      prets.push(fn);
      return pret();
    },

    /** Attend la fin des écritures en vol. Utile pour les tests. */
    ecrituresTerminees: function () { return Promise.all(enCours.slice()); },

    /** Relit les totaux publics affichés sur la page d'accueil. */
    relireTotaux: function () { return relireTotaux(); },

    /** Relit toute la base depuis le serveur. */
    rafraichir: function () {
      if (etat !== 'supabase') return Promise.resolve();
      return hydrater().then(function () { emettre('bw:change', { table: '*' }); });
    },

    /**
     * Lecture filtrée.
     *   BW.list('prestataires', { statut: 'valide' })
     */
    list: function (nom, ou) {
      var lignes = table(nom);
      if (!ou) return lignes.slice();
      return lignes.filter(function (r) {
        return Object.keys(ou).every(function (k) { return r[k] === ou[k]; });
      });
    },

    /** Lecture d'une ligne par identifiant. */
    get: function (nom, id) {
      return table(nom).filter(function (r) { return r.id === id; })[0] || null;
    },

    /**
     * Création. Renvoie immédiatement la ligne créée ; l'insertion en base
     * se poursuit en arrière-plan.
     */
    create: function (nom, ligne) {
      var o = Object.assign({}, ligne);
      if (!o.id) o.id = SCHEMA[nom] && SCHEMA[nom].champs.id === 'id' && etat === 'supabase'
        ? uuid() : (o.id || uuid());
      table(nom).push(o);
      if (etat === 'supabase' && SCHEMA[nom]) {
        ecrire(BASE.from(SCHEMA[nom].table).insert(versDb(nom, o)),
          function () {
            var l = table(nom), i = l.indexOf(o);
            if (i > -1) l.splice(i, 1);
          },
          'Création impossible dans « ' + nom + ' »');
      }
      emettre('bw:change', { table: nom, type: 'INSERT' });
      if (etat === 'supabase') programmerTotaux();
      return o;
    },

    /** Mise à jour partielle. Renvoie la ligne modifiée. */
    update: function (nom, id, patch) {
      var ligne = BW.get(nom, id);
      if (!ligne) return null;
      var avant = Object.assign({}, ligne);
      Object.keys(patch).forEach(function (k) { ligne[k] = patch[k]; });
      if (etat === 'supabase' && SCHEMA[nom]) {
        ecrire(BASE.from(SCHEMA[nom].table).update(versDb(nom, patch)).eq('id', id),
          function () { Object.keys(avant).forEach(function (k) { ligne[k] = avant[k]; }); },
          'Mise à jour impossible dans « ' + nom + ' »');
      }
      emettre('bw:change', { table: nom, type: 'UPDATE' });
      if (etat === 'supabase') programmerTotaux();
      return ligne;
    },

    /** Suppression. */
    remove: function (nom, id) {
      var lignes = table(nom);
      var i = lignes.findIndex(function (r) { return r.id === id; });
      if (i < 0) return false;
      var retiree = lignes.splice(i, 1)[0];
      if (etat === 'supabase' && SCHEMA[nom]) {
        ecrire(BASE.from(SCHEMA[nom].table)['delete']().eq('id', id),
          function () { lignes.splice(i, 0, retiree); },
          'Suppression impossible dans « ' + nom + ' »');
      }
      emettre('bw:change', { table: nom, type: 'DELETE' });
      if (etat === 'supabase') programmerTotaux();
      return true;
    },

    /** Recharge le cache depuis le serveur (ou resème la démonstration). */
    reset: function () {
      if (etat === 'supabase') return BW.rafraichir();
      if (global.BW_DEMO) modeDemo('réinitialisation demandée');
      return Promise.resolve();
    },


    /* ---------- Aides de lecture ---------- */
    categorie: function (id) {
      return BW.list('categories').filter(function (c) { return c.id === id; })[0] || null;
    },
    labelCategorie: function (id) {
      var c = BW.categorie(id);
      return c ? c.singulier : id;
    },
    couple: function (id) { return BW.get('couples', id); },
    prestataire: function (id) { return BW.get('prestataires', id); },

    /** Services actifs d'un prestataire. */
    servicesDe: function (prestataireId, tousLesStatuts) {
      return BW.list('services').filter(function (s) {
        return s.prestataire === prestataireId && (tousLesStatuts || s.actif);
      });
    },

    /**
     * Totaux du site public. Sur la base, ils viennent de la fonction SQL
     * statistiques_publiques ; hors ligne, ils sont recalculés localement.
     * Les tables couples et devis restant fermées aux visiteurs, c'est le
     * seul moyen d'afficher des chiffres justes sans rien exposer.
     */
    statsPubliques: function () {
      if (totaux) return totaux;
      var p = BW.list('prestataires');
      return {
        prestataires: p.filter(function (x) { return x.statut === 'valide'; }).length,
        certifies: p.filter(function (x) { return x.statut === 'valide' && x.certifie; }).length,
        couples: BW.list('couples').length,
        devis: BW.list('devis').length,
        villes: BW.list('villes').length,
        categories: BW.list('categories').length,
        avis: BW.list('avis', { statut: 'publie' }).length,
        articles: BW.list('articles', { statut: 'publie' }).length
      };
    },

    /* ---------- Indicateurs ---------- */
    stats: function () {
      var p = BW.list('prestataires');
      var q = BW.list('devis');
      var pay = BW.list('paiements');
      var mrr = p.filter(function (x) { return x.statut === 'valide' && x.abonnement !== 'aucun'; })
        .reduce(function (s, x) {
          var o = BW.get('offres', x.abonnement);
          return s + (o ? o.prix : 0);
        }, 0);
      return {
        prestatairesValides: p.filter(function (x) { return x.statut === 'valide'; }).length,
        prestatairesAttente: p.filter(function (x) { return x.statut === 'attente'; }).length,
        couples: BW.list('couples').length,
        devis: q.length,
        devisEnAttente: q.filter(function (x) { return x.statut === 'attente'; }).length,
        mrr: mrr,
        sequestre: pay.filter(function (x) { return x.statut === 'sequestre'; })
          .reduce(function (s, x) { return s + x.montant; }, 0),
        avisAModerer: BW.list('avis').filter(function (a) { return a.statut !== 'publie'; }).length,
        litigesOuverts: BW.list('litiges').filter(function (l) { return l.statut === 'ouvert'; }).length
      };
    },

    /* ---------- Formatage ---------- */
    fcfa: function (n) {
      if (n === null || n === undefined) return '—';
      return Number(n).toLocaleString('fr-FR').replace(/[  ]/g, ' ') + ' FCFA';
    },
    date: function (iso) {
      if (!iso) return '—';
      var d = new Date(iso);
      if (isNaN(d)) return iso;
      return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    },
    dateCourte: function (iso) {
      if (!iso) return '—';
      var d = new Date(iso);
      if (isNaN(d)) return iso;
      return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' });
    },
    note: function (n) {
      return n ? Number(n).toFixed(1).replace('.', ',') : '—';
    },
    /** Échappe le HTML avant injection — toutes les vues passent par là. */
    esc: function (s) {
      return String(s === null || s === undefined ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    },

    /* ---------- Libellés de statut ---------- */
    STATUT_PRESTATAIRE: { valide: 'Validé', attente: 'En attente', refuse: 'Refusé', suspendu: 'Suspendu' },
    STATUT_DEVIS: { attente: 'En attente', recu: 'Devis envoyé', accepte: 'Accepté', refuse: 'Refusé' },
    STATUT_AVIS: { publie: 'Publié', attente: 'À modérer', signale: 'Signalé', masque: 'Masqué' },
    STATUT_PAIEMENT: { paye: 'Payé', echoue: 'Échoué', sequestre: 'Sous séquestre', reverse: 'Reversé' },
    STATUT_ARTICLE: { publie: 'Publié', brouillon: 'Brouillon', relecture: 'En relecture' },
    STATUT_LITIGE: { ouvert: 'Ouvert', resolu: 'Résolu', clos: 'Clos' },

    /** Classe CSS de la pastille de statut. */
    ton: function (statut) {
      if (['valide', 'publie', 'accepte', 'paye', 'resolu', 'reverse'].indexOf(statut) > -1) return 'ok';
      if (['attente', 'brouillon', 'relecture', 'sequestre'].indexOf(statut) > -1) return 'wait';
      if (['refuse', 'echoue', 'suspendu', 'signale', 'ouvert', 'masque'].indexOf(statut) > -1) return 'bad';
      if (statut === 'recu') return 'info';
      return '';
    }
,
  };

  /* =========================================================================
     7. AUTHENTIFICATION
     Trois rôles : couple, prestataire, admin. Le rôle vit dans la table
     profils et pilote toutes les politiques de sécurité de PostgreSQL.
     ========================================================================= */
  BW.auth = {
    utilisateur: null,   // { id, email }
    profil: null,        // { id, role, nom_complet, ... }

    _init: function () {
      if (etat !== 'supabase') return Promise.resolve(null);
      return BASE.auth.getSession().then(function (res) {
        var session = res && res.data && res.data.session;
        BASE.auth.onAuthStateChange(function (_evt, s) {
          BW.auth.utilisateur = s ? s.user : null;
          if (!s) BW.auth.profil = null;
          emettre('bw:auth', { connecte: !!s });
        });
        if (!session) return null;
        BW.auth.utilisateur = session.user;
        return BW.auth._chargerProfil();
      }).catch(function () { return null; });
    },

    _chargerProfil: function () {
      if (!BW.auth.utilisateur) return Promise.resolve(null);
      return BASE.from('profils').select('*').eq('id', BW.auth.utilisateur.id).maybeSingle()
        .then(function (res) { BW.auth.profil = res.data || null; return BW.auth.profil; })
        .catch(function () { return null; });
    },

    /** Inscription. role : 'couple' (défaut), 'prestataire' ou 'admin'. */
    inscription: function (email, motDePasse, infos) {
      infos = infos || {};
      if (etat !== 'supabase') return Promise.reject(new Error('Base non configurée'));
      return BASE.auth.signUp({
        email: email, password: motDePasse,
        options: { data: { nom_complet: infos.nom || email, role: infos.role || 'couple' } }
      }).then(function (res) {
        if (res.error) throw res.error;
        BW.auth.utilisateur = res.data.user;
        return BW.auth._chargerProfil().then(function () { return res.data; });
      });
    },

    /** Connexion par courriel et mot de passe. */
    connexion: function (email, motDePasse) {
      if (etat !== 'supabase') return Promise.reject(new Error('Base non configurée'));
      return BASE.auth.signInWithPassword({ email: email, password: motDePasse })
        .then(function (res) {
          if (res.error) throw res.error;
          BW.auth.utilisateur = res.data.user;
          return BW.auth._chargerProfil()
            .then(hydrater)
            .then(function () { return res.data; });
        });
    },

    /** Lien magique envoyé par courriel, sans mot de passe. */
    lienMagique: function (email) {
      if (etat !== 'supabase') return Promise.reject(new Error('Base non configurée'));
      return BASE.auth.signInWithOtp({ email: email }).then(function (res) {
        if (res.error) throw res.error;
        return res.data;
      });
    },

    /** Réinitialisation du mot de passe. */
    motDePasseOublie: function (email) {
      if (etat !== 'supabase') return Promise.reject(new Error('Base non configurée'));
      return BASE.auth.resetPasswordForEmail(email).then(function (res) {
        if (res.error) throw res.error;
        return true;
      });
    },

    deconnexion: function () {
      if (etat !== 'supabase') return Promise.resolve();
      return BASE.auth.signOut().then(function () {
        BW.auth.utilisateur = null;
        BW.auth.profil = null;
        return hydrater();
      });
    },

    connecte: function () { return !!BW.auth.utilisateur; },
    role: function () { return BW.auth.profil ? BW.auth.profil.role : null; },
    estAdmin: function () { return BW.auth.role() === 'admin'; },
    estPrestataire: function () { return BW.auth.role() === 'prestataire'; },

    /** Fiche du prestataire rattachée au compte connecté. */
    monPrestataire: function () {
      if (!BW.auth.utilisateur) return null;
      return BW.list('prestataires').filter(function (p) {
        return p.proprietaire === BW.auth.utilisateur.id;
      })[0] || BW.list('prestataires')[0] || null;
    },

    /** Dossier du couple rattaché au compte connecté. */
    monCouple: function () {
      if (!BW.auth.utilisateur) return null;
      return BW.list('couples').filter(function (c) {
        return c.profil === BW.auth.utilisateur.id;
      })[0] || null;
    },

    /**
     * Garde de page. Redirige vers l'écran de connexion si le rôle attendu
     * n'est pas celui du compte. En mode démonstration, laisse passer.
     */
    exigerRole: function (role, urlConnexion) {
      if (etat !== 'supabase') return true;
      if (BW.auth.role() === role || BW.auth.estAdmin()) return true;
      location.replace(urlConnexion + '?retour=' + encodeURIComponent(location.pathname));
      return false;
    }
  };

  global.BW = BW;
})(window);
