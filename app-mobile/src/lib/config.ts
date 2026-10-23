/**
 * Configuration de la base de données.
 *
 * Deux façons de la renseigner, dans cet ordre de priorité :
 *   1. les variables d'environnement EXPO_PUBLIC_SUPABASE_URL / _ANON_KEY
 *      (fichier .env à la racine de app-mobile) ;
 *   2. le bloc expo.extra.supabase de app.json.
 *
 * La clé anon est publique par conception : la protection réelle vient des
 * politiques de sécurité au niveau des lignes définies dans db/schema.sql.
 */
import Constants from 'expo-constants';

const extra = (Constants.expoConfig?.extra ?? {}) as {
  supabase?: { url?: string; anonKey?: string };
};

export const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? extra.supabase?.url ?? '';

export const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? extra.supabase?.anonKey ?? '';

/** Vrai quand l'application peut réellement joindre la base. */
export const CONFIGURE = SUPABASE_URL.startsWith('http') && SUPABASE_ANON_KEY.length > 20;
