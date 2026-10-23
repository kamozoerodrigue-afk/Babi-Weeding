/**
 * État global léger : favoris et devis, partagés entre les onglets.
 *
 * Les favoris vivent sur l'appareil (AsyncStorage) : ils sont propres à la
 * personne qui tient le téléphone. Les devis, eux, sont enregistrés en base
 * et suivis par le prestataire et l'administration.
 */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QUOTES, rafraichirCompte, type Quote } from '@/data/catalogue';
import { envoyerDevis } from '@/lib/api';

const CLE_FAVORIS = 'bw:favoris';

type DemandeDevis = {
  vendorId: string;
  eventDate: string;   // AAAA-MM-JJ
  guests: number;
  message: string;
};

type Store = {
  favorites: string[];
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  quotes: Quote[];
  addQuote: (d: DemandeDevis) => Promise<void>;
  reloadQuotes: () => Promise<void>;
};

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>(() => [...QUOTES]);

  /* Favoris relus au lancement puis enregistrés à chaque changement. */
  useEffect(() => {
    AsyncStorage.getItem(CLE_FAVORIS)
      .then((brut) => { if (brut) setFavorites(JSON.parse(brut)); })
      .catch(() => { /* première ouverture */ });
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const suivant = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      AsyncStorage.setItem(CLE_FAVORIS, JSON.stringify(suivant)).catch(() => {});
      return suivant;
    });
  }, []);

  const isFavorite = useCallback((id: string) => favorites.includes(id), [favorites]);

  const reloadQuotes = useCallback(async () => {
    await rafraichirCompte();
    setQuotes([...QUOTES]);
  }, []);

  const addQuote = useCallback(async (d: DemandeDevis) => {
    const cree = await envoyerDevis(d);
    if (cree) {
      setQuotes((prev) => [cree, ...prev]);
      return;
    }
    /* Repli hors ligne : la demande reste visible dans l'application. */
    setQuotes((prev) => [{
      id: `local-${Date.now()}`,
      vendorId: d.vendorId,
      status: 'attente',
      sentAt: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }),
      eventDate: d.eventDate,
      guests: d.guests,
    }, ...prev]);
  }, []);

  const value = useMemo(
    () => ({ favorites, toggleFavorite, isFavorite, quotes, addQuote, reloadQuotes }),
    [favorites, toggleFavorite, isFavorite, quotes, addQuote, reloadQuotes]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useStore doit être utilisé dans StoreProvider');
  return ctx;
}
