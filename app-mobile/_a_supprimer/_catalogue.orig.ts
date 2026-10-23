/**
 * Jeu de données de démonstration, aligné sur le catalogue du site vitrine.
 * À remplacer par les appels Supabase / API en production.
 */
import type { IconName } from '@/components/Icon';

export type Category = {
  id: string;
  label: string;
  icon: IconName;
  count: number;
};

export const CATEGORIES: Category[] = [
  { id: 'photographes', label: 'Photographes', icon: 'photo', count: 86 },
  { id: 'traiteurs', label: 'Traiteurs', icon: 'traiteur', count: 63 },
  { id: 'salles', label: 'Salles', icon: 'salle', count: 57 },
  { id: 'dj', label: 'Animateurs DJ', icon: 'dj', count: 52 },
  { id: 'decorateurs', label: 'Décorateurs', icon: 'deco', count: 48 },
  { id: 'videastes', label: 'Vidéastes', icon: 'video', count: 41 },
  { id: 'maquilleurs', label: 'Maquilleurs', icon: 'maquillage', count: 39 },
  { id: 'robes', label: 'Robes', icon: 'robe', count: 34 },
  { id: 'coiffeurs', label: 'Coiffeurs', icon: 'coiffure', count: 28 },
  { id: 'vehicules', label: 'Véhicules', icon: 'voiture', count: 24 },
  { id: 'planners', label: 'Wedding planners', icon: 'planner', count: 22 },
  { id: 'hotels', label: 'Hôtels', icon: 'hotel', count: 19 },
  { id: 'bijoutiers', label: 'Bijoutiers', icon: 'bijou', count: 17 },
  { id: 'agences', label: 'Agences', icon: 'agence', count: 15 },
];

export type Vendor = {
  id: string;
  name: string;
  categoryId: string;
  categoryLabel: string;
  city: string;
  commune: string;
  rating: number;
  reviews: number;
  priceFrom: number;
  priceUnit: string;
  certified: boolean;
  sponsored: boolean;
  photos: string[];
  tagline: string;
  about: string;
  services: string[];
  capacity?: string;
  responseTime: string;
  owner: { name: string; role: string; avatar: string; since: string };
};

const U = (id: string, w = 900) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=72`;

export const VENDORS: Vendor[] = [
  {
    id: 'studio-lumiere-ci',
    name: 'Studio Lumière CI',
    categoryId: 'photographes',
    categoryLabel: 'Photographe',
    city: 'Abidjan',
    commune: 'Cocody',
    rating: 4.9,
    reviews: 47,
    priceFrom: 150000,
    priceUnit: 'la prestation',
    certified: true,
    sponsored: true,
    photos: [
      U('photo-1519741497674-611481863552'),
      U('photo-1537633552985-df8429e8048b'),
      U('photo-1606216794074-735e91aa2c92'),
    ],
    tagline: 'Reportage complet, drone et album imprimé',
    about:
      "Neuf ans de reportage de mariage à Abidjan. Nous couvrons la dot, le civil et la réception, avec un second photographe inclus dès le forfait journée. Livraison de 300 photos retouchées sous 21 jours.",
    services: ['Séance engagement', 'Prise de vue par drone', 'Album imprimé', 'Second photographe'],
    responseTime: 'Répond en moins de 2 h',
    owner: { name: 'Yao Kouassi', role: 'Photographe principal', avatar: U('photo-1546484475-7f7bd55792da', 200), since: '2019' },
  },
  {
    id: 'palais-des-saveurs',
    name: 'Le Palais des Saveurs',
    categoryId: 'traiteurs',
    categoryLabel: 'Traiteur',
    city: 'Abidjan',
    commune: 'Marcory',
    rating: 4.8,
    reviews: 63,
    priceFrom: 8000,
    priceUnit: 'le couvert',
    certified: true,
    sponsored: true,
    photos: [U('photo-1555244162-803834f70033'), U('photo-1511285560929-80b456fea0bc')],
    tagline: 'Cuisine ivoirienne et internationale, service en salle',
    about:
      "Menus mixtes attiéké-poisson, kedjenou ou buffet international. Personnel de service, vaisselle et nappage inclus à partir de 100 couverts. Dégustation gratuite avant signature.",
    services: ['Dégustation offerte', 'Service en salle', 'Vaisselle incluse', 'Bar et boissons'],
    capacity: '50 à 800 invités',
    responseTime: 'Répond en moins de 4 h',
    owner: { name: 'Aminata Bamba', role: 'Cheffe et gérante', avatar: U('photo-1594744803329-e58b31de8bf5', 200), since: '2017' },
  },
  {
    id: 'villa-ebene',
    name: 'Villa Ébène Réceptions',
    categoryId: 'salles',
    categoryLabel: 'Salle de réception',
    city: 'Abidjan',
    commune: 'Riviera Golf',
    rating: 4.9,
    reviews: 38,
    priceFrom: 700000,
    priceUnit: 'la journée',
    certified: true,
    sponsored: false,
    photos: [U('photo-1519225421980-715cb0215aed'), U('photo-1464366400600-7168b8af9bc3')],
    tagline: 'Jardin arboré, salle climatisée et parking 80 places',
    about:
      "Un domaine de 2 hectares à dix minutes du Golf. Salle climatisée de 400 places, jardin pour la cérémonie laïque, loge des mariés et groupe électrogène de secours.",
    services: ['Climatisation', 'Parking 80 places', 'Groupe électrogène', 'Loge des mariés'],
    capacity: '80 à 500 invités',
    responseTime: 'Répond en moins de 24 h',
    owner: { name: 'Serge Adjé', role: 'Directeur du domaine', avatar: U('photo-1600880292203-757bb62b4baf', 200), since: '2015' },
  },
  {
    id: 'akwaba-decoration',
    name: 'Akwaba Décoration',
    categoryId: 'decorateurs',
    categoryLabel: 'Décorateur',
    city: 'Abidjan',
    commune: 'Plateau',
    rating: 4.7,
    reviews: 29,
    priceFrom: 300000,
    priceUnit: 'la prestation',
    certified: true,
    sponsored: true,
    photos: [U('photo-1470259078422-826894b933aa'), U('photo-1533174072545-7a4b6ad7a6c3')],
    tagline: 'Scénographie wax, kita et fleurs tropicales',
    about:
      "Décoration de cérémonie coutumière et de réception. Nous dessinons une scénographie sur mesure à partir de vos couleurs et du pagne de la famille, puis installons la veille.",
    services: ['Scénographie sur mesure', 'Installation la veille', 'Location de mobilier', 'Arche florale'],
    responseTime: 'Répond en moins de 6 h',
    owner: { name: 'Fatou Koné', role: 'Directrice artistique', avatar: U('photo-1522673607200-164d1b6ce486', 200), since: '2018' },
  },
  {
    id: 'dj-kwabo',
    name: 'DJ Kwabo Events',
    categoryId: 'dj',
    categoryLabel: 'Animateur DJ',
    city: 'Abidjan',
    commune: 'Yopougon',
    rating: 4.8,
    reviews: 51,
    priceFrom: 180000,
    priceUnit: 'la soirée',
    certified: true,
    sponsored: false,
    photos: [U('photo-1514525253161-7a46d19cd819'), U('photo-1492684223066-81342ee5ff30')],
    tagline: 'Coupé-décalé, zouglou et afrobeats jusqu\'au bout de la nuit',
    about:
      "Sonorisation, éclairage et animation micro. Playlist construite avec vous en amont, avec les incontournables de la dot et l'ouverture de bal répétée.",
    services: ['Sonorisation complète', 'Jeux de lumière', 'Animation micro', 'Machine à fumée'],
    responseTime: 'Répond en moins de 3 h',
    owner: { name: 'Kwabo Diarra', role: 'DJ et animateur', avatar: U('photo-1519742866993-66d3cfef4bbd', 200), since: '2016' },
  },
  {
    id: 'awa-beauty',
    name: 'Awa Beauty Studio',
    categoryId: 'maquilleurs',
    categoryLabel: 'Maquilleuse',
    city: 'Abidjan',
    commune: 'Angré, Cocody',
    rating: 5,
    reviews: 24,
    priceFrom: 60000,
    priceUnit: 'la prestation',
    certified: true,
    sponsored: false,
    photos: [U('photo-1594736797933-d0501ba2fe65'), U('photo-1560066984-138dadb4c035')],
    tagline: 'Maquillage longue tenue, essai inclus',
    about:
      "Maquillage adapté aux carnations foncées et à la chaleur d'Abidjan, tenue garantie 14 heures. Essai en studio inclus, déplacement possible le jour J.",
    services: ['Essai inclus', 'Déplacement à domicile', 'Coiffure possible', 'Maquillage des témoins'],
    responseTime: 'Répond en moins de 1 h',
    owner: { name: 'Awa Sanogo', role: 'Maquilleuse professionnelle', avatar: U('photo-1531123897727-8f129e1688ce', 200), since: '2020' },
  },
  {
    id: 'eclat-studio',
    name: 'Éclat Studio Abidjan',
    categoryId: 'photographes',
    categoryLabel: 'Photographe',
    city: 'Abidjan',
    commune: 'Riviera Golf',
    rating: 5,
    reviews: 58,
    priceFrom: 550000,
    priceUnit: 'la prestation',
    certified: true,
    sponsored: true,
    photos: [U('photo-1521543832500-49e69fb2bea1'), U('photo-1554080353-a576cf803bda')],
    tagline: 'Photo et vidéo, équipe de quatre personnes',
    about:
      "Studio haut de gamme pour les mariages de la diaspora. Équipe de deux photographes et deux vidéastes, teaser livré sous 72 heures et film complet sous 6 semaines.",
    services: ['Photo et vidéo', 'Teaser sous 72 h', 'Drone', 'Album grand format'],
    responseTime: 'Répond en moins de 2 h',
    owner: { name: 'Marc-Aurel N\'Guessan', role: 'Directeur du studio', avatar: U('photo-1500648767791-00dcc994a43e', 200), since: '2014' },
  },
  {
    id: 'baoule-prod',
    name: 'Baoulé Prod',
    categoryId: 'videastes',
    categoryLabel: 'Vidéaste',
    city: 'Yamoussoukro',
    commune: 'Centre',
    rating: 4.7,
    reviews: 12,
    priceFrom: 210000,
    priceUnit: 'la prestation',
    certified: true,
    sponsored: false,
    photos: [U('photo-1606216794074-735e91aa2c92'), U('photo-1519741497674-611481863552')],
    tagline: 'Film de mariage traditionnel et moderne',
    about:
      "Spécialiste du mariage coutumier baoulé. Captation multi-caméras de la dot, montage narratif de 25 minutes et version courte pour les réseaux.",
    services: ['Multi-caméras', 'Version réseaux sociaux', 'Captation de la dot', 'Livraison clé USB'],
    responseTime: 'Répond en moins de 12 h',
    owner: { name: 'Konan Brou', role: 'Réalisateur', avatar: U('photo-1507003211169-0a1dd7228f2d', 200), since: '2019' },
  },
];

export const findVendor = (id: string) => VENDORS.find((v) => v.id === id);

/** Normalise les espaces insecables produits par toLocaleString en espaces simples. */
export const formatFCFA = (n: number) =>
  n.toLocaleString('fr-FR').replace(/[\u202F\u00A0]/g, ' ') + ' FCFA';

/* --- Messagerie --- */
export type Conversation = {
  id: string;
  vendorId: string;
  unread: number;
  lastAt: string;
  messages: { from: 'me' | 'them'; text: string; at: string }[];
};

export const CONVERSATIONS: Conversation[] = [
  {
    id: 'c1',
    vendorId: 'studio-lumiere-ci',
    unread: 2,
    lastAt: '09:42',
    messages: [
      { from: 'me', text: 'Bonjour, êtes-vous disponible le 14 décembre 2026 à Cocody ?', at: 'Hier 18:20' },
      { from: 'them', text: 'Bonjour ! Oui, la date est encore libre. Combien d\'invités prévoyez-vous ?', at: 'Hier 19:05' },
      { from: 'me', text: 'Environ 180 personnes, avec la dot le matin.', at: 'Hier 19:11' },
      { from: 'them', text: 'Parfait. Je vous propose le forfait journée complète à 320 000 FCFA : dot, civil et réception, 300 photos retouchées et un album 30x30.', at: '09:40' },
      { from: 'them', text: 'Je vous envoie le devis détaillé dans la journée.', at: '09:42' },
    ],
  },
  {
    id: 'c2',
    vendorId: 'palais-des-saveurs',
    unread: 0,
    lastAt: 'Hier',
    messages: [
      { from: 'me', text: 'Bonjour, quel est votre prix pour 180 couverts en menu mixte ?', at: 'Lundi 14:02' },
      { from: 'them', text: 'Bonjour, comptez 12 000 FCFA par couvert, soit 2 160 000 FCFA service compris. Dégustation offerte le samedi.', at: 'Hier 10:15' },
    ],
  },
  {
    id: 'c3',
    vendorId: 'villa-ebene',
    unread: 1,
    lastAt: 'Lundi',
    messages: [
      { from: 'me', text: 'La salle est-elle disponible le 14 décembre ?', at: 'Lundi 09:30' },
      { from: 'them', text: 'Bonjour, oui. Souhaitez-vous une visite ce week-end ?', at: 'Lundi 11:48' },
    ],
  },
];

/* --- Demandes de devis --- */
export type QuoteStatus = 'attente' | 'recu' | 'accepte';

export type Quote = {
  id: string;
  vendorId: string;
  status: QuoteStatus;
  sentAt: string;
  amount?: number;
  eventDate: string;
  guests: number;
};

export const QUOTES: Quote[] = [
  { id: 'q1', vendorId: 'studio-lumiere-ci', status: 'recu', sentAt: '2 août', amount: 320000, eventDate: '14 décembre 2026', guests: 180 },
  { id: 'q2', vendorId: 'palais-des-saveurs', status: 'recu', sentAt: '1 août', amount: 2160000, eventDate: '14 décembre 2026', guests: 180 },
  { id: 'q3', vendorId: 'villa-ebene', status: 'attente', sentAt: '31 juillet', eventDate: '14 décembre 2026', guests: 180 },
  { id: 'q4', vendorId: 'akwaba-decoration', status: 'accepte', sentAt: '24 juillet', amount: 480000, eventDate: '14 décembre 2026', guests: 180 },
];

export const STATUS_LABEL: Record<QuoteStatus, string> = {
  attente: 'En attente de réponse',
  recu: 'Devis reçu',
  accepte: 'Devis accepté',
};

/* --- Villes pour le filtre --- */
export const CITIES = [
  'Cocody', 'Plateau', 'Marcory', 'Riviera Golf', 'Yopougon',
  'Treichville', 'Yamoussoukro', 'Bouaké', 'San-Pedro', 'Daloa',
];

export const BUDGETS = [
  { id: 'eco', label: 'Moins de 200 000 FCFA', max: 200000 },
  { id: 'mid', label: '200 000 à 500 000 FCFA', min: 200000, max: 500000 },
  { id: 'high', label: 'Plus de 500 000 FCFA', min: 500000 },
];
