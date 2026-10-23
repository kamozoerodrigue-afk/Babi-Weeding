/**
 * Session du compte. Enveloppe fine autour de Supabase Auth : l'écran de
 * profil et l'écran de connexion s'y branchent, le reste de l'application
 * n'a pas à connaître la mécanique.
 */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { auth } from '@/lib/api';
import { rafraichirCompte } from '@/data/catalogue';

type Profil = { id: string; role: string; nom_complet: string | null } | null;

type Contexte = {
  session: Session | null;
  profil: Profil;
  pret: boolean;
  connexion: (email: string, motDePasse: string) => Promise<void>;
  inscription: (email: string, motDePasse: string, nom: string) => Promise<boolean>;
  deconnexion: () => Promise<void>;
};

const Ctx = createContext<Contexte | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profil, setProfil] = useState<Profil>(null);
  const [pret, setPret] = useState(false);

  const chargerProfil = useCallback(async (s: Session | null) => {
    if (!supabase || !s) { setProfil(null); return; }
    const { data } = await supabase
      .from('profils').select('id, role, nom_complet').eq('id', s.user.id).maybeSingle();
    setProfil((data as Profil) ?? null);
  }, []);

  useEffect(() => {
    let vivant = true;
    auth.session().then(async (s) => {
      if (!vivant) return;
      setSession(s ?? null);
      await chargerProfil(s ?? null);
      setPret(true);
    });
    const abonnement = supabase?.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      chargerProfil(s);
    });
    return () => { vivant = false; abonnement?.data.subscription.unsubscribe(); };
  }, [chargerProfil]);

  const connexion = useCallback(async (email: string, motDePasse: string) => {
    const { session: s } = await auth.connexion(email, motDePasse);
    setSession(s ?? null);
    await chargerProfil(s ?? null);
    await rafraichirCompte();
  }, [chargerProfil]);

  /** Rend vrai quand la session est ouverte, faux si une confirmation par
      courriel est requise avant la première connexion. */
  const inscription = useCallback(async (email: string, motDePasse: string, nom: string) => {
    const { session: s, user } = await auth.inscription(email, motDePasse, nom);
    if (!s) return false;
    if (supabase && user) {
      await supabase.from('couples').insert({ profil_id: user.id, noms: nom, email, statut: 'actif' });
    }
    setSession(s);
    await chargerProfil(s);
    await rafraichirCompte();
    return true;
  }, [chargerProfil]);

  const deconnexion = useCallback(async () => {
    await auth.deconnexion();
    setSession(null);
    setProfil(null);
    await rafraichirCompte();
  }, []);

  const valeur = useMemo(
    () => ({ session, profil, pret, connexion, inscription, deconnexion }),
    [session, profil, pret, connexion, inscription, deconnexion]
  );

  return <Ctx.Provider value={valeur}>{children}</Ctx.Provider>;
}

export function useSession() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useSession doit être utilisé dans SessionProvider');
  return ctx;
}
