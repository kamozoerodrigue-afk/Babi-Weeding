/**
 * Accès aux données. Les requêtes visent les vues publiques du schéma
 * (prestataires_publics, services_publics…), qui excluent volontairement
 * les coordonnées directes des professionnels.
 *
 * Chaque fonction rend les types déjà utilisés par les écrans : la couche
 * de traduction SQL → application vit ici et nulle part ailleurs.
 */
import type { Category, Conversation, Quote, QuoteStatus, Vendor } from '@/data/types';
import type { IconName } from '@/components/Icon';
import { supabase } from './supabase';

/* ------------------------------------------------------------------ */
/*  Traduction des lignes SQL vers les objets de l'application         */
/* ------------------------------------------------------------------ */

const icone = (v: string | null): IconName =>
  ((v ?? 'i-agence').replace(/^i-/, '') as IconName);

type LignePresta = Record<string, any>;

function versVendor(r: LignePresta, services: string[]): Vendor {
  return {
    id: r.id,
    name: r.nom,
    categoryId: r.categorie_id,
    categoryLabel: r.categorie_singulier ?? r.categorie_label ?? r.categorie_id,
    city: r.ville ?? 'Abidjan',
    commune: r.commune ?? '',
    rating: Number(r.note_moyenne ?? 0),
    reviews: Number(r.nb_avis ?? 0),
    priceFrom: Number(r.prix_min_fcfa ?? 0),
    priceUnit: r.unite_prix ?? 'la prestation',
    certified: !!r.certifie,
    sponsored: !!r.sponsorise,
    photos: Array.isArray(r.photos) ? r.photos : [],
    tagline: r.accroche ?? '',
    about: r.description ?? '',
    services,
    capacity: r.capacite ?? undefined,
    responseTime: r.delai_reponse ?? 'Répond sous 48 h',
    owner: {
      name: r.contact_nom ?? '',
      role: r.contact_role ?? '',
      avatar: r.contact_avatar ?? '',
      since: r.cree_le ? new Date(r.cree_le).getFullYear().toString() : '',
    },
  };
}

const STATUTS_CONNUS: QuoteStatus[] = ['attente', 'recu', 'accepte'];
const versStatut = (s: string): QuoteStatus =>
  STATUTS_CONNUS.includes(s as QuoteStatus) ? (s as QuoteStatus) : 'attente';

const jourMois = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }) : '';

const jourComplet = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

const heure = (iso: string | null) =>
  iso ? new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '';

/* ------------------------------------------------------------------ */
/*  Lectures                                                           */
/* ------------------------------------------------------------------ */

export async function chargerCatalogue(): Promise<{
  categories: Category[];
  vendors: Vendor[];
  cities: string[];
}> {
  if (!supabase) throw new Error('Base non configurée');

  const [cats, prestas, services, villes] = await Promise.all([
    supabase.from('categories').select('*').eq('actif', true).order('ordre'),
    supabase.from('prestataires_publics').select('*').order('sponsorise', { ascending: false }),
    supabase.from('services_publics').select('prestataire_id, nom, ordre').order('ordre'),
    supabase.from('villes').select('nom').eq('actif', true).order('nom'),
  ]);

  const parPresta = new Map<string, string[]>();
  (services.data ?? []).forEach((s: any) => {
    const l = parPresta.get(s.prestataire_id) ?? [];
    l.push(s.nom);
    parPresta.set(s.prestataire_id, l);
  });

  const lignes = prestas.data ?? [];
  const compte = new Map<string, number>();
  lignes.forEach((r: any) => compte.set(r.categorie_id, (compte.get(r.categorie_id) ?? 0) + 1));

  return {
    categories: (cats.data ?? []).map((c: any) => ({
      id: c.id,
      label: c.label,
      icon: icone(c.icone),
      count: compte.get(c.id) ?? 0,
    })),
    vendors: lignes.map((r: any) => versVendor(r, parPresta.get(r.id) ?? [])),
    cities: (villes.data ?? []).map((v: any) => v.nom),
  };
}

/** Demandes de devis du couple connecté. Tableau vide si personne n'est connecté. */
export async function chargerDevis(): Promise<Quote[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('devis')
    .select('*')
    .order('envoye_le', { ascending: false });
  if (error || !data) return [];
  return data.map((d: any) => ({
    id: d.id,
    vendorId: d.prestataire_id,
    status: versStatut(d.statut),
    sentAt: jourMois(d.envoye_le),
    amount: d.montant_fcfa ?? undefined,
    eventDate: jourComplet(d.date_evenement),
    guests: d.nb_invites ?? 0,
  }));
}

/** Conversations du couple connecté, messages inclus. */
export async function chargerConversations(): Promise<Conversation[]> {
  if (!supabase) return [];
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('conversations')
    .select('id, prestataire_id, cree_le, messages(id, auteur_id, contenu, lu, envoye_le)')
    .order('cree_le', { ascending: false });
  if (error || !data) return [];

  return data.map((c: any) => {
    const msgs = (c.messages ?? []).sort(
      (a: any, b: any) => +new Date(a.envoye_le) - +new Date(b.envoye_le)
    );
    const dernier = msgs[msgs.length - 1];
    return {
      id: c.id,
      vendorId: c.prestataire_id,
      unread: msgs.filter((m: any) => !m.lu && m.auteur_id !== user?.id).length,
      lastAt: dernier ? heure(dernier.envoye_le) : '',
      messages: msgs.map((m: any) => ({
        from: m.auteur_id === user?.id ? ('me' as const) : ('them' as const),
        text: m.contenu,
        at: heure(m.envoye_le),
      })),
    };
  });
}

/* ------------------------------------------------------------------ */
/*  Écritures                                                          */
/* ------------------------------------------------------------------ */

export async function envoyerDevis(entree: {
  vendorId: string;
  eventDate: string;      // AAAA-MM-JJ
  guests: number;
  message: string;
}): Promise<Quote | null> {
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();

  let coupleId: string | null = null;
  if (user) {
    const { data } = await supabase.from('couples').select('id').eq('profil_id', user.id).maybeSingle();
    coupleId = data?.id ?? null;
  }

  const { data, error } = await supabase
    .from('devis')
    .insert({
      couple_id: coupleId,
      prestataire_id: entree.vendorId,
      statut: 'attente',
      message: entree.message,
      date_evenement: entree.eventDate,
      nb_invites: entree.guests,
    })
    .select()
    .single();

  if (error || !data) return null;
  return {
    id: data.id,
    vendorId: data.prestataire_id,
    status: 'attente',
    sentAt: jourMois(data.envoye_le),
    eventDate: jourComplet(data.date_evenement),
    guests: data.nb_invites ?? entree.guests,
  };
}

export async function envoyerMessage(conversationId: string, contenu: string) {
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from('messages')
    .insert({ conversation_id: conversationId, auteur_id: user.id, contenu })
    .select()
    .single();
  return data ?? null;
}

/* ------------------------------------------------------------------ */
/*  Authentification                                                   */
/* ------------------------------------------------------------------ */

export const auth = {
  async session() {
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    return data.session;
  },
  async connexion(email: string, motDePasse: string) {
    if (!supabase) throw new Error('Base non configurée');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: motDePasse });
    if (error) throw error;
    return data;
  },
  async inscription(email: string, motDePasse: string, nom: string) {
    if (!supabase) throw new Error('Base non configurée');
    const { data, error } = await supabase.auth.signUp({
      email,
      password: motDePasse,
      options: { data: { nom_complet: nom, role: 'couple' } },
    });
    if (error) throw error;
    return data;
  },
  async deconnexion() {
    if (supabase) await supabase.auth.signOut();
  },
};
