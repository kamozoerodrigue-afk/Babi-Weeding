/**
 * Catalogue de l'application.
 *
 * Les tableaux exportés ici sont les mêmes objets d'un bout à l'autre de la
 * session : `hydrater()` les remplit sur place, au démarrage, avec le contenu
 * réel de la base. Les écrans continuent donc de les importer directement,
 * sans changement.
 *
 * Sans configuration (src/lib/config.ts) ou sans réseau, le jeu de
 * démonstration prend le relais et l'application reste utilisable.
 */
import { chargerCatalogue, chargerConversations, chargerDevis } from '@/lib/api';
import { CONFIGURE } from '@/lib/config';
import {
  DEMO_CATEGORIES, DEMO_CITIES, DEMO_CONVERSATIONS, DEMO_QUOTES, DEMO_VENDORS,
} from './demo';
import type { Category, Conversation, Quote, Vendor } from './types';

export * from './types';

/* --- Contenu, rempli au démarrage ---------------------------------- */
export const CATEGORIES: Category[] = [];
export const VENDORS: Vendor[] = [];
export const CONVERSATIONS: Conversation[] = [];
export const QUOTES: Quote[] = [];
export const CITIES: string[] = [];

export const findVendor = (id: string) => VENDORS.find((v) => v.id === id);

/** Source réellement utilisée : utile pour l'afficher dans l'écran profil. */
export let source: 'supabase' | 'demo' = 'demo';

function remplir<T>(cible: T[], contenu: T[]) {
  cible.length = 0;
  contenu.forEach((x) => cible.push(x));
}

function demonstration() {
  source = 'demo';
  remplir(CATEGORIES, DEMO_CATEGORIES);
  remplir(VENDORS, DEMO_VENDORS);
  remplir(CONVERSATIONS, DEMO_CONVERSATIONS);
  remplir(QUOTES, DEMO_QUOTES);
  remplir(CITIES, DEMO_CITIES);
}

/**
 * Charge le catalogue. Appelé une fois par app/_layout.tsx avant l'affichage
 * du premier écran. Ne rejette jamais : en cas d'échec, bascule en démo.
 */
export async function hydrater(): Promise<'supabase' | 'demo'> {
  if (!CONFIGURE) {
    demonstration();
    return source;
  }
  try {
    const [catalogue, devis, conversations] = await Promise.all([
      chargerCatalogue(),
      chargerDevis(),
      chargerConversations(),
    ]);
    remplir(CATEGORIES, catalogue.categories);
    remplir(VENDORS, catalogue.vendors);
    remplir(CITIES, catalogue.cities);
    remplir(QUOTES, devis);
    remplir(CONVERSATIONS, conversations);
    source = 'supabase';
  } catch (e) {
    console.warn('[Babi Wedding] Base injoignable, mode démonstration.', e);
    demonstration();
  }
  return source;
}

/** Relit uniquement les devis et les conversations du compte connecté. */
export async function rafraichirCompte() {
  if (source !== 'supabase') return;
  const [devis, conversations] = await Promise.all([chargerDevis(), chargerConversations()]);
  remplir(QUOTES, devis);
  remplir(CONVERSATIONS, conversations);
}
