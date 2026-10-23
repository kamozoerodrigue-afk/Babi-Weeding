/* ==========================================================================
   BABI WEDDING — couche de données partagée
   Panel admin, portail prestataire et marketplace web lisent tous d'ici.

   Les données vivent dans localStorage sous la clé BW_DB. Au premier
   chargement, le jeu de démonstration ci-dessous est semé. L'API publique
   (BW.list, BW.get, BW.create, BW.update, BW.remove) est volontairement
   calquée sur celle de Supabase pour que le branchement se limite à
   remplacer le corps de ces cinq fonctions.
   ========================================================================== */
(function (global) {
  'use strict';

  var KEY = 'BW_DB';
  var VERSION = 3;

  var U = function (id, w) {
    return 'https://images.unsplash.com/' + id + '?auto=format&fit=crop&w=' + (w || 900) + '&q=72';
  };

  /* ---------------------------------------------------------------
     1. JEU DE DÉMONSTRATION
     --------------------------------------------------------------- */
  var SEED = {
    version: VERSION,

    categories: [
      { id: 'photographes',     label: 'Photographes',            singulier: 'Photographe',            icon: 'i-photo' },
      { id: 'videastes',        label: 'Vidéastes',               singulier: 'Vidéaste',               icon: 'i-video' },
      { id: 'traiteurs',        label: 'Traiteurs',               singulier: 'Traiteur',               icon: 'i-traiteur' },
      { id: 'salles',           label: 'Salles de réception',     singulier: 'Salle de réception',     icon: 'i-salle' },
      { id: 'decorateurs',      label: 'Décorateurs',             singulier: 'Décorateur',             icon: 'i-deco' },
      { id: 'dj-animateurs',    label: 'Animateurs DJ',           singulier: 'Animateur DJ',           icon: 'i-dj' },
      { id: 'robes',            label: 'Créateurs de robes',      singulier: 'Créateur de robes',      icon: 'i-robe' },
      { id: 'maquilleurs',      label: 'Maquilleurs',             singulier: 'Maquilleur',             icon: 'i-maquillage' },
      { id: 'coiffeurs',        label: 'Coiffeurs',               singulier: 'Coiffeur',               icon: 'i-coiffure' },
      { id: 'wedding-planners', label: 'Wedding Planners',        singulier: 'Wedding Planner',        icon: 'i-planner' },
      { id: 'hotels',           label: 'Hôtels',                  singulier: 'Hôtel',                  icon: 'i-hotel' },
      { id: 'bijoutiers',       label: 'Bijoutiers',              singulier: 'Bijoutier',              icon: 'i-bijou' },
      { id: 'vehicules',        label: 'Loueurs de véhicules',    singulier: 'Loueur de véhicules',    icon: 'i-voiture' },
      { id: 'agences',          label: 'Agences événementielles', singulier: 'Agence événementielle',  icon: 'i-agence' }
    ],

    villes: ['Cocody', 'Plateau', 'Marcory', 'Riviera Golf', 'Yopougon', 'Treichville',
             'Angré', 'Yamoussoukro', 'Bouaké', 'San-Pedro', 'Daloa'],

    /* --- Prestataires -------------------------------------------------- */
    prestataires: [
      {
        id: 'studio-lumiere-ci', nom: 'Studio Lumière CI', categorie: 'photographes',
        ville: 'Abidjan', commune: 'Cocody', statut: 'valide', certifie: true, sponsorise: true,
        note: 4.9, avis: 47, prixMin: 150000, unite: 'la prestation',
        accroche: 'Reportage complet, drone et album imprimé',
        description: "Neuf ans de reportage de mariage à Abidjan. Nous couvrons la dot, le civil et la réception, avec un second photographe inclus dès le forfait journée. Livraison de 300 photos retouchées sous 21 jours.",
        photos: [U('photo-1519741497674-611481863552'), U('photo-1537633552985-df8429e8048b'), U('photo-1606216794074-735e91aa2c92')],
        delaiReponse: 'Répond en moins de 2 h',
        contact: { nom: 'Yao Kouassi', role: 'Photographe principal', email: 'contact@studiolumiere.ci', tel: '+225 07 00 11 22', avatar: U('photo-1546484475-7f7bd55792da', 200) },
        abonnement: 'or', inscritLe: '2026-02-14', rccm: 'CI-ABJ-2019-B-14582'
      },
      {
        id: 'palais-des-saveurs', nom: 'Le Palais des Saveurs', categorie: 'traiteurs',
        ville: 'Abidjan', commune: 'Marcory', statut: 'valide', certifie: true, sponsorise: true,
        note: 4.8, avis: 63, prixMin: 8000, unite: 'le couvert',
        accroche: 'Cuisine ivoirienne et internationale, service en salle',
        description: "Menus mixtes attiéké-poisson, kedjenou ou buffet international. Personnel de service, vaisselle et nappage inclus à partir de 100 couverts. Dégustation gratuite avant signature.",
        photos: [U('photo-1555244162-803834f70033'), U('photo-1511285560929-80b456fea0bc')],
        capacite: '50 à 800 invités', delaiReponse: 'Répond en moins de 4 h',
        contact: { nom: 'Aminata Bamba', role: 'Cheffe et gérante', email: 'contact@palaisdessaveurs.ci', tel: '+225 05 44 33 21', avatar: U('photo-1594744803329-e58b31de8bf5', 200) },
        abonnement: 'or', inscritLe: '2026-01-08', rccm: 'CI-ABJ-2017-B-09341'
      },
      {
        id: 'villa-ebene', nom: 'Villa Ébène Réceptions', categorie: 'salles',
        ville: 'Abidjan', commune: 'Riviera Golf', statut: 'valide', certifie: true, sponsorise: false,
        note: 4.9, avis: 38, prixMin: 700000, unite: 'la journée',
        accroche: 'Jardin arboré, salle climatisée et parking 80 places',
        description: "Un domaine de 2 hectares à dix minutes du Golf. Salle climatisée de 400 places, jardin pour la cérémonie laïque, loge des mariés et groupe électrogène de secours.",
        photos: [U('photo-1519225421980-715cb0215aed'), U('photo-1464366400600-7168b8af9bc3')],
        capacite: '80 à 500 invités', delaiReponse: 'Répond en moins de 24 h',
        contact: { nom: 'Serge Adjé', role: 'Directeur du domaine', email: 'reservation@villaebene.ci', tel: '+225 27 22 41 90', avatar: U('photo-1600880292203-757bb62b4baf', 200) },
        abonnement: 'argent', inscritLe: '2025-11-22', rccm: 'CI-ABJ-2015-B-03127'
      },
      {
        id: 'akwaba-decoration', nom: 'Akwaba Décoration', categorie: 'decorateurs',
        ville: 'Abidjan', commune: 'Plateau', statut: 'valide', certifie: true, sponsorise: true,
        note: 4.7, avis: 29, prixMin: 300000, unite: 'la prestation',
        accroche: 'Scénographie wax, kita et fleurs tropicales',
        description: "Décoration de cérémonie coutumière et de réception. Nous dessinons une scénographie sur mesure à partir de vos couleurs et du pagne de la famille, puis installons la veille.",
        photos: [U('photo-1470259078422-826894b933aa'), U('photo-1533174072545-7a4b6ad7a6c3')],
        delaiReponse: 'Répond en moins de 6 h',
        contact: { nom: 'Fatou Koné', role: 'Directrice artistique', email: 'hello@akwabadeco.ci', tel: '+225 01 55 66 77', avatar: U('photo-1522673607200-164d1b6ce486', 200) },
        abonnement: 'or', inscritLe: '2026-03-02', rccm: 'CI-ABJ-2018-B-11209'
      },
      {
        id: 'dj-kwabo', nom: 'DJ Kwabo Events', categorie: 'dj-animateurs',
        ville: 'Abidjan', commune: 'Yopougon', statut: 'valide', certifie: true, sponsorise: false,
        note: 4.8, avis: 51, prixMin: 180000, unite: 'la soirée',
        accroche: 'Coupé-décalé, zouglou et afrobeats jusqu\'au bout de la nuit',
        description: "Sonorisation, éclairage et animation micro. Playlist construite avec vous en amont, avec les incontournables de la dot et l'ouverture de bal répétée.",
        photos: [U('photo-1514525253161-7a46d19cd819'), U('photo-1492684223066-81342ee5ff30')],
        delaiReponse: 'Répond en moins de 3 h',
        contact: { nom: 'Kwabo Diarra', role: 'DJ et animateur', email: 'booking@djkwabo.ci', tel: '+225 07 88 99 00', avatar: U('photo-1519742866993-66d3cfef4bbd', 200) },
        abonnement: 'argent', inscritLe: '2026-01-30', rccm: 'CI-ABJ-2016-B-07744'
      },
      {
        id: 'awa-beauty', nom: 'Awa Beauty Studio', categorie: 'maquilleurs',
        ville: 'Abidjan', commune: 'Angré', statut: 'valide', certifie: true, sponsorise: false,
        note: 5, avis: 24, prixMin: 60000, unite: 'la prestation',
        accroche: 'Maquillage longue tenue, essai inclus',
        description: "Maquillage adapté aux carnations foncées et à la chaleur d'Abidjan, tenue garantie 14 heures. Essai en studio inclus, déplacement possible le jour J.",
        photos: [U('photo-1594736797933-d0501ba2fe65'), U('photo-1560066984-138dadb4c035')],
        delaiReponse: 'Répond en moins de 1 h',
        contact: { nom: 'Awa Sanogo', role: 'Maquilleuse professionnelle', email: 'awa@awabeauty.ci', tel: '+225 05 12 34 56', avatar: U('photo-1531123897727-8f129e1688ce', 200) },
        abonnement: 'bronze', inscritLe: '2026-04-11', rccm: 'CI-ABJ-2020-B-16630'
      },
      {
        id: 'eclat-studio', nom: 'Éclat Studio Abidjan', categorie: 'photographes',
        ville: 'Abidjan', commune: 'Riviera Golf', statut: 'valide', certifie: true, sponsorise: true,
        note: 5, avis: 58, prixMin: 550000, unite: 'la prestation',
        accroche: 'Photo et vidéo, équipe de quatre personnes',
        description: "Studio haut de gamme pour les mariages de la diaspora. Équipe de deux photographes et deux vidéastes, teaser livré sous 72 heures et film complet sous 6 semaines.",
        photos: [U('photo-1521543832500-49e69fb2bea1'), U('photo-1554080353-a576cf803bda')],
        delaiReponse: 'Répond en moins de 2 h',
        contact: { nom: "Marc-Aurel N'Guessan", role: 'Directeur du studio', email: 'studio@eclat.ci', tel: '+225 27 21 30 40', avatar: U('photo-1500648767791-00dcc994a43e', 200) },
        abonnement: 'or', inscritLe: '2025-09-05', rccm: 'CI-ABJ-2014-B-01988'
      },
      {
        id: 'baoule-prod', nom: 'Baoulé Prod', categorie: 'videastes',
        ville: 'Yamoussoukro', commune: 'Centre', statut: 'valide', certifie: true, sponsorise: false,
        note: 4.7, avis: 12, prixMin: 210000, unite: 'la prestation',
        accroche: 'Film de mariage traditionnel et moderne',
        description: "Spécialiste du mariage coutumier baoulé. Captation multi-caméras de la dot, montage narratif de 25 minutes et version courte pour les réseaux.",
        photos: [U('photo-1606216794074-735e91aa2c92'), U('photo-1519741497674-611481863552')],
        delaiReponse: 'Répond en moins de 12 h',
        contact: { nom: 'Konan Brou', role: 'Réalisateur', email: 'konan@baouleprod.ci', tel: '+225 07 45 67 89', avatar: U('photo-1507003211169-0a1dd7228f2d', 200) },
        abonnement: 'bronze', inscritLe: '2026-05-19', rccm: 'CI-YAM-2019-B-00412'
      },
      /* --- en attente de validation par l'administration --- */
      {
        id: 'harmonie-events', nom: 'Harmonie Events CI', categorie: 'wedding-planners',
        ville: 'Abidjan', commune: 'Cocody', statut: 'attente', certifie: false, sponsorise: false,
        note: 0, avis: 0, prixMin: 400000, unite: 'la prestation',
        accroche: 'Organisation clé en main, coordination du jour J',
        description: "Agence de wedding planning fondée en 2024. Coordination complète de la dot au brunch du lendemain, avec un chef de projet dédié.",
        photos: [U('photo-1600880292203-757bb62b4baf')],
        delaiReponse: 'Répond en moins de 8 h',
        contact: { nom: 'Prisca Yao', role: 'Fondatrice', email: 'prisca@harmonie-events.ci', tel: '+225 05 90 12 34', avatar: U('photo-1573496359142-b8d87734a5a2', 200) },
        abonnement: 'aucun', inscritLe: '2026-08-01', rccm: 'CI-ABJ-2024-B-22105'
      },
      {
        id: 'gold-limousine', nom: 'Gold Limousine Abidjan', categorie: 'vehicules',
        ville: 'Abidjan', commune: 'Marcory', statut: 'attente', certifie: false, sponsorise: false,
        note: 0, avis: 0, prixMin: 120000, unite: 'la journée',
        accroche: 'Berlines et limousines avec chauffeur',
        description: "Flotte de six véhicules de prestige avec chauffeur en costume. Décoration florale du capot incluse, cortège possible jusqu'à quatre voitures.",
        photos: [U('photo-1503376780353-7e6692767b70')],
        delaiReponse: 'Répond en moins de 5 h',
        contact: { nom: 'Ibrahim Touré', role: 'Gérant', email: 'contact@goldlimousine.ci', tel: '+225 01 23 45 67', avatar: U('photo-1507003211169-0a1dd7228f2d', 200) },
        abonnement: 'aucun', inscritLe: '2026-08-03', rccm: 'CI-ABJ-2023-B-19870'
      },
      {
        id: 'delices-abj', nom: 'Délices Abidjan', categorie: 'traiteurs',
        ville: 'Abidjan', commune: 'Treichville', statut: 'refuse', certifie: false, sponsorise: false,
        note: 0, avis: 0, prixMin: 5000, unite: 'le couvert',
        accroche: 'Traiteur événementiel',
        description: "Dossier incomplet : registre de commerce illisible et portfolio composé d'images trouvées en ligne.",
        photos: [U('photo-1555244162-803834f70033')],
        delaiReponse: '', motifRefus: 'Portfolio non authentique, RCCM illisible',
        contact: { nom: 'Alain Kacou', role: 'Gérant', email: 'alain@delices-abj.ci', tel: '+225 07 11 22 33', avatar: U('photo-1507003211169-0a1dd7228f2d', 200) },
        abonnement: 'aucun', inscritLe: '2026-07-28', rccm: 'illisible'
      }
    ],

    /* --- Services proposés par les prestataires ------------------------ */
    services: [
      { id: 's1', prestataire: 'studio-lumiere-ci', nom: 'Forfait journée complète', prix: 320000, unite: 'forfait', duree: '12 h', actif: true,
        description: 'Dot, civil et réception. 300 photos retouchées, album 30x30 et second photographe.',
        inclus: ['Second photographe', 'Album imprimé 30x30', '300 photos retouchées', 'Galerie en ligne'] },
      { id: 's2', prestataire: 'studio-lumiere-ci', nom: 'Forfait demi-journée', prix: 180000, unite: 'forfait', duree: '6 h', actif: true,
        description: 'Couverture de la cérémonie et du cocktail, 150 photos retouchées.',
        inclus: ['150 photos retouchées', 'Galerie en ligne'] },
      { id: 's3', prestataire: 'studio-lumiere-ci', nom: 'Séance engagement', prix: 75000, unite: 'séance', duree: '2 h', actif: true,
        description: 'Séance photo de couple en extérieur avant le mariage.',
        inclus: ['40 photos retouchées', 'Deux tenues'] },
      { id: 's4', prestataire: 'studio-lumiere-ci', nom: 'Option drone', prix: 60000, unite: 'option', duree: '', actif: false,
        description: 'Prises de vue aériennes du lieu de réception. Suspendu en attente du renouvellement de la licence.',
        inclus: ['10 minutes de rushes', 'Montage court'] },
      { id: 's5', prestataire: 'palais-des-saveurs', nom: 'Menu ivoirien complet', prix: 12000, unite: 'couvert', duree: '', actif: true,
        description: 'Entrée, attiéké-poisson ou kedjenou, dessert et boissons non alcoolisées.',
        inclus: ['Service en salle', 'Vaisselle', 'Nappage'] },
      { id: 's6', prestataire: 'palais-des-saveurs', nom: 'Menu gastronomique mixte', prix: 19000, unite: 'couvert', duree: '', actif: true,
        description: 'Buffet dressé mêlant cuisine ivoirienne et internationale, personnel dédié.',
        inclus: ['Buffet dressé', 'Personnel dédié', 'Boissons premium'] },
      { id: 's7', prestataire: 'villa-ebene', nom: 'Location journée complète', prix: 900000, unite: 'journée', duree: '24 h', actif: true,
        description: 'Salle climatisée 400 places, jardin, loge des mariés, parking et groupe électrogène.',
        inclus: ['Climatisation', 'Parking 80 places', 'Groupe électrogène', 'Loge des mariés'] },
      { id: 's8', prestataire: 'akwaba-decoration', nom: 'Scénographie complète', prix: 480000, unite: 'forfait', duree: '', actif: true,
        description: 'Conception sur mesure, installation la veille et démontage le lendemain.',
        inclus: ['Arche florale', 'Habillage de salle', 'Mobilier', 'Démontage'] }
    ],

    /* --- Couples inscrits ---------------------------------------------- */
    couples: [
      { id: 'c-adjoua', noms: 'Adjoua & Koffi', email: 'adjoua.koffi@email.ci', tel: '+225 07 30 40 50',
        ville: 'Cocody', dateMariage: '2026-12-14', invites: 180, budget: 6000000,
        inscritLe: '2026-06-02', statut: 'actif', diaspora: false },
      { id: 'c-mariama', noms: 'Mariama & Ibrahima', email: 'm.ibrahima@email.fr', tel: '+33 6 12 34 56 78',
        ville: 'Paris', dateMariage: '2027-02-20', invites: 250, budget: 12000000,
        inscritLe: '2026-05-18', statut: 'actif', diaspora: true },
      { id: 'c-ange', noms: 'Ange & Grace', email: 'ange.grace@email.ci', tel: '+225 05 60 70 80',
        ville: 'Yamoussoukro', dateMariage: '2027-04-10', invites: 120, budget: 3500000,
        inscritLe: '2026-07-09', statut: 'actif', diaspora: false },
      { id: 'c-yann', noms: 'Yann & Estelle', email: 'yann.estelle@email.ca', tel: '+1 514 555 0142',
        ville: 'Montréal', dateMariage: '2027-01-16', invites: 200, budget: 9000000,
        inscritLe: '2026-04-25', statut: 'actif', diaspora: true },
      { id: 'c-sekou', noms: 'Sékou & Fanta', email: 'sekou.fanta@email.ci', tel: '+225 01 90 80 70',
        ville: 'Bouaké', dateMariage: '2026-11-07', invites: 300, budget: 5000000,
        inscritLe: '2026-03-14', statut: 'inactif', diaspora: false }
    ],

    /* --- Demandes de devis --------------------------------------------- */
    devis: [
      { id: 'q1', couple: 'c-adjoua', prestataire: 'studio-lumiere-ci', statut: 'recu', montant: 320000,
        envoyeLe: '2026-08-02', dateEvenement: '2026-12-14', invites: 180,
        message: "Bonjour, nous cherchons une couverture complète : dot le matin, civil puis réception." },
      { id: 'q2', couple: 'c-adjoua', prestataire: 'palais-des-saveurs', statut: 'recu', montant: 2160000,
        envoyeLe: '2026-08-01', dateEvenement: '2026-12-14', invites: 180,
        message: "Menu mixte pour 180 couverts, avec service en salle." },
      { id: 'q3', couple: 'c-adjoua', prestataire: 'villa-ebene', statut: 'attente', montant: null,
        envoyeLe: '2026-07-31', dateEvenement: '2026-12-14', invites: 180,
        message: "La salle est-elle libre le 14 décembre ? Nous serions 180." },
      { id: 'q4', couple: 'c-adjoua', prestataire: 'akwaba-decoration', statut: 'accepte', montant: 480000,
        envoyeLe: '2026-07-24', dateEvenement: '2026-12-14', invites: 180,
        message: "Décoration en wax bleu et or, arche florale pour la cérémonie laïque." },
      { id: 'q5', couple: 'c-mariama', prestataire: 'eclat-studio', statut: 'recu', montant: 890000,
        envoyeLe: '2026-07-30', dateEvenement: '2027-02-20', invites: 250,
        message: "Nous organisons depuis Paris. Photo et vidéo, avec teaser rapide pour la famille." },
      { id: 'q6', couple: 'c-yann', prestataire: 'studio-lumiere-ci', statut: 'attente', montant: null,
        envoyeLe: '2026-08-03', dateEvenement: '2027-01-16', invites: 200,
        message: "Disponible le 16 janvier ? Nous arrivons de Montréal une semaine avant." },
      { id: 'q7', couple: 'c-ange', prestataire: 'baoule-prod', statut: 'refuse', montant: null,
        envoyeLe: '2026-07-20', dateEvenement: '2027-04-10', invites: 120,
        message: "Captation de la dot en pays baoulé." },
      { id: 'q8', couple: 'c-ange', prestataire: 'dj-kwabo', statut: 'recu', montant: 240000,
        envoyeLe: '2026-08-04', dateEvenement: '2027-04-10', invites: 120,
        message: "Animation de la soirée, ouverture de bal et coupé-décalé." }
    ],

    /* --- Avis ----------------------------------------------------------- */
    avis: [
      { id: 'a1', prestataire: 'studio-lumiere-ci', couple: 'c-adjoua', note: 5, statut: 'publie', date: '2026-07-12',
        texte: "Travail remarquable. L'équipe a su capter les moments de la dot sans jamais s'imposer. Livraison en avance sur le délai annoncé." },
      { id: 'a2', prestataire: 'palais-des-saveurs', couple: 'c-adjoua', note: 5, statut: 'publie', date: '2026-07-15',
        texte: "Le kedjenou a fait l'unanimité et le service était impeccable du début à la fin." },
      { id: 'a3', prestataire: 'villa-ebene', couple: 'c-sekou', note: 4, statut: 'publie', date: '2026-06-28',
        texte: "Cadre magnifique et personnel attentif. Un bémol sur la climatisation d'une des salles annexes." },
      { id: 'a4', prestataire: 'dj-kwabo', couple: 'c-ange', note: 5, statut: 'attente', date: '2026-08-03',
        texte: "Ambiance folle jusqu'à 4 h du matin. Il a parfaitement lu la salle." },
      { id: 'a5', prestataire: 'akwaba-decoration', couple: 'c-mariama', note: 2, statut: 'signale', date: '2026-08-02',
        texte: "Installation terminée avec deux heures de retard, plusieurs compositions florales étaient fanées.",
        signalePar: 'akwaba-decoration', motifSignalement: 'Le prestataire conteste : retard imputable à l\'accès au site' }
    ],

    /* --- Abonnements et paiements --------------------------------------- */
    offres: [
      { id: 'bronze', nom: 'Bronze', prix: 15000, periode: 'mois',
        avantages: ['Profil public vérifié', 'Jusqu\'à 5 devis par mois', 'Messagerie sécurisée'] },
      { id: 'argent', nom: 'Argent', prix: 35000, periode: 'mois',
        avantages: ['Devis illimités', 'Badge Certifié Or', 'Statistiques de profil', 'Support prioritaire'] },
      { id: 'or', nom: 'Or', prix: 75000, periode: 'mois',
        avantages: ['Tout Argent', 'Mise en avant sponsorisée', 'Position prioritaire au catalogue', 'Accompagnement dédié'] }
    ],

    paiements: [
      { id: 'p1', prestataire: 'studio-lumiere-ci', type: 'abonnement', offre: 'or', montant: 75000, date: '2026-08-01', moyen: 'Orange Money', statut: 'paye' },
      { id: 'p2', prestataire: 'palais-des-saveurs', type: 'abonnement', offre: 'or', montant: 75000, date: '2026-08-01', moyen: 'Wave', statut: 'paye' },
      { id: 'p3', prestataire: 'eclat-studio', type: 'abonnement', offre: 'or', montant: 75000, date: '2026-08-01', moyen: 'Carte bancaire', statut: 'paye' },
      { id: 'p4', prestataire: 'akwaba-decoration', type: 'abonnement', offre: 'or', montant: 75000, date: '2026-08-02', moyen: 'MTN MoMo', statut: 'paye' },
      { id: 'p5', prestataire: 'villa-ebene', type: 'abonnement', offre: 'argent', montant: 35000, date: '2026-08-01', moyen: 'Orange Money', statut: 'paye' },
      { id: 'p6', prestataire: 'dj-kwabo', type: 'abonnement', offre: 'argent', montant: 35000, date: '2026-08-03', moyen: 'Wave', statut: 'paye' },
      { id: 'p7', prestataire: 'awa-beauty', type: 'abonnement', offre: 'bronze', montant: 15000, date: '2026-08-02', moyen: 'Orange Money', statut: 'paye' },
      { id: 'p8', prestataire: 'baoule-prod', type: 'abonnement', offre: 'bronze', montant: 15000, date: '2026-08-04', moyen: 'MTN MoMo', statut: 'echoue' },
      { id: 'p9', prestataire: 'akwaba-decoration', type: 'acompte', couple: 'c-adjoua', montant: 144000, date: '2026-07-26', moyen: 'Orange Money', statut: 'sequestre' },
      { id: 'p10', prestataire: 'studio-lumiere-ci', type: 'acompte', couple: 'c-mariama', montant: 96000, date: '2026-07-18', moyen: 'Carte bancaire', statut: 'reverse' }
    ],

    /* --- Litiges --------------------------------------------------------- */
    litiges: [
      { id: 'l1', couple: 'c-mariama', prestataire: 'akwaba-decoration', montant: 144000,
        ouvertLe: '2026-08-02', statut: 'ouvert', priorite: 'haute',
        objet: 'Retard de livraison et compositions florales abîmées',
        detail: "Le couple demande un remboursement partiel de 40 %. Le prestataire conteste et invoque un problème d'accès au site le jour de l'installation." },
      { id: 'l2', couple: 'c-sekou', prestataire: 'villa-ebene', montant: 250000,
        ouvertLe: '2026-07-14', statut: 'resolu', priorite: 'moyenne',
        objet: 'Climatisation en panne dans la salle annexe',
        detail: "Geste commercial de 250 000 FCFA accepté par les deux parties. Dossier clos le 21 juillet." }
    ],

    /* --- Articles du blog ------------------------------------------------ */
    articles: [
      { id: 'art1', titre: 'Budget mariage Abidjan 2026 : combien prévoir ?', categorie: 'Budget',
        auteur: 'Aïcha Traoré', statut: 'publie', date: '2026-07-15', vues: 4820, motsCles: 'budget mariage abidjan 2026' },
      { id: 'art2', titre: 'Top 10 salles de réception mariage à Abidjan', categorie: 'Prestataires',
        auteur: 'Aïcha Traoré', statut: 'publie', date: '2026-07-02', vues: 3110, motsCles: 'salle reception mariage abidjan' },
      { id: 'art3', titre: "Mariage coutumier Côte d'Ivoire : toutes les étapes", categorie: 'Traditions',
        auteur: 'Konan Brou', statut: 'publie', date: '2026-06-20', vues: 6740, motsCles: 'mariage coutumier cote ivoire' },
      { id: 'art4', titre: 'Rétroplanning mariage : que faire 12 mois avant ?', categorie: 'Organisation',
        auteur: 'Aïcha Traoré', statut: 'brouillon', date: '2026-08-04', vues: 0, motsCles: 'retroplanning mariage' },
      { id: 'art5', titre: 'Bijoux mariage ivoirien : les tendances 2026', categorie: 'Inspiration',
        auteur: 'Prisca Yao', statut: 'relecture', date: '2026-08-03', vues: 0, motsCles: 'bijoux mariage ivoirien' }
    ],

    /* --- Trafic mensuel, pour les graphiques ------------------------------ */
    trafic: [
      { mois: 'Mars',      sessions: 1240, inscriptions: 38,  devis: 96 },
      { mois: 'Avril',     sessions: 1890, inscriptions: 61,  devis: 148 },
      { mois: 'Mai',       sessions: 2640, inscriptions: 84,  devis: 203 },
      { mois: 'Juin',      sessions: 3420, inscriptions: 112, devis: 287 },
      { mois: 'Juillet',   sessions: 4780, inscriptions: 156, devis: 391 },
      { mois: 'Août',      sessions: 5310, inscriptions: 174, devis: 428 }
    ]
  };

  /* ---------------------------------------------------------------
     2. PERSISTANCE
     --------------------------------------------------------------- */
  var db = null;

  function load() {
    if (db) return db;
    try {
      var raw = global.localStorage && global.localStorage.getItem(KEY);
      var parsed = raw ? JSON.parse(raw) : null;
      /* Un changement de VERSION resème les données de démonstration. */
      db = parsed && parsed.version === VERSION ? parsed : JSON.parse(JSON.stringify(SEED));
    } catch (e) {
      db = JSON.parse(JSON.stringify(SEED));
    }
    save();
    return db;
  }

  function save() {
    try {
      if (global.localStorage) global.localStorage.setItem(KEY, JSON.stringify(db));
    } catch (e) { /* mode privé ou quota atteint : on reste en mémoire */ }
  }

  function uid(prefix) {
    return (prefix || 'id') + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  /* ---------------------------------------------------------------
     3. API PUBLIQUE
     Signature volontairement proche de Supabase pour faciliter
     le remplacement : BW.list('prestataires', { statut: 'valide' })
     --------------------------------------------------------------- */
  var BW = {
    /** Renvoie une copie du tableau, filtrée par égalité stricte sur chaque clé. */
    list: function (table, where) {
      var rows = load()[table] || [];
      if (!where) return rows.slice();
      return rows.filter(function (row) {
        return Object.keys(where).every(function (k) {
          var v = where[k];
          return Array.isArray(v) ? v.indexOf(row[k]) > -1 : row[k] === v;
        });
      });
    },

    get: function (table, id) {
      return (load()[table] || []).filter(function (r) { return r.id === id; })[0] || null;
    },

    create: function (table, row) {
      var d = load();
      if (!d[table]) d[table] = [];
      if (!row.id) row.id = uid(table.slice(0, 2));
      d[table].unshift(row);
      save();
      return row;
    },

    update: function (table, id, patch) {
      var d = load();
      var row = (d[table] || []).filter(function (r) { return r.id === id; })[0];
      if (!row) return null;
      Object.keys(patch).forEach(function (k) { row[k] = patch[k]; });
      save();
      return row;
    },

    remove: function (table, id) {
      var d = load();
      d[table] = (d[table] || []).filter(function (r) { return r.id !== id; });
      save();
    },

    /** Remet le jeu de démonstration à zéro. */
    reset: function () {
      db = JSON.parse(JSON.stringify(SEED));
      save();
      return db;
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
  };

  global.BW = BW;
})(window);
