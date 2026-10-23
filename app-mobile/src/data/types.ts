/**
 * Types partagés du catalogue. Le contenu vient de Supabase (src/lib/api.ts),
 * ou du jeu de démonstration (src/data/demo.ts) si la base n'est pas jointe.
 */
import type { IconName } from '@/components/Icon';

export type Category = {
  id: string;
  label: string;
  icon: IconName;
  count: number;
};

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

export type Conversation = {
  id: string;
  vendorId: string;
  unread: number;
  lastAt: string;
  messages: { from: 'me' | 'them'; text: string; at: string }[];
};

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

export const STATUS_LABEL: Record<QuoteStatus, string> = {
  attente: 'En attente de réponse',
  recu: 'Devis reçu',
  accepte: 'Devis accepté',
};

export const BUDGETS = [
  { id: 'eco', label: 'Moins de 200 000 FCFA', max: 200000 },
  { id: 'mid', label: '200 000 à 500 000 FCFA', min: 200000, max: 500000 },
  { id: 'high', label: 'Plus de 500 000 FCFA', min: 500000 },
];

/** Normalise les espaces insécables produits par toLocaleString. */
export const formatFCFA = (n: number) =>
  n.toLocaleString('fr-FR').replace(/[\u202F\u00A0]/g, ' ') + ' FCFA';
