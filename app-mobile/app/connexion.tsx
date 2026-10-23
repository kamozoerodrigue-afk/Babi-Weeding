/**
 * Connexion et création de compte. Ouvert depuis l'écran Profil.
 */
import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Icon from '@/components/Icon';
import { colors, radius, space, type } from '@/theme';
import { useSession } from '@/store/useSession';
import { CONFIGURE } from '@/lib/config';

export default function Connexion() {
  const router = useRouter();
  const { connexion, inscription } = useSession();

  const [mode, setMode] = useState<'connexion' | 'inscription'>('connexion');
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState('');
  const [info, setInfo] = useState('');
  const [occupe, setOccupe] = useState(false);

  const traduire = (e: any) => {
    const m = String(e?.message ?? '');
    if (/Invalid login credentials/i.test(m)) return 'Adresse ou mot de passe incorrect.';
    if (/Email not confirmed/i.test(m)) return 'Adresse non confirmée. Vérifiez votre boîte de réception.';
    if (/User already registered/i.test(m)) return 'Un compte existe déjà avec cette adresse.';
    if (/Password should be/i.test(m)) return 'Le mot de passe doit compter au moins 8 caractères.';
    return m || 'Une erreur est survenue.';
  };

  const valider = async () => {
    setErreur(''); setInfo('');
    if (!email.trim() || motDePasse.length < 6) {
      setErreur('Renseignez votre adresse et un mot de passe.');
      return;
    }
    setOccupe(true);
    try {
      if (mode === 'connexion') {
        await connexion(email.trim(), motDePasse);
        router.back();
      } else {
        if (!nom.trim()) { setErreur('Indiquez vos prénoms.'); return; }
        const ouverte = await inscription(email.trim(), motDePasse, nom.trim());
        if (ouverte) router.back();
        else setInfo('Compte créé. Confirmez votre adresse par courriel, puis connectez-vous.');
      }
    } catch (e) {
      setErreur(traduire(e));
    } finally {
      setOccupe(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.head}>
        <Pressable onPress={() => router.back()} hitSlop={12} accessibilityRole="button">
          <Icon name="x" size={22} color={colors.text} strokeWidth={2} />
        </Pressable>
        <Text style={styles.headTitle}>
          {mode === 'connexion' ? 'Se connecter' : 'Créer un compte'}
        </Text>
        <View style={{ width: 22 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          {!CONFIGURE && (
            <Text style={styles.avis}>
              La base de données n’est pas configurée : l’application fonctionne en
              démonstration hors ligne. Renseignez app.json → expo.extra.supabase.
            </Text>
          )}

          {mode === 'inscription' && (
            <Champ label="Vos prénoms" value={nom} onChange={setNom} placeholder="Adjoua & Koffi" />
          )}
          <Champ label="Adresse électronique" value={email} onChange={setEmail}
                 placeholder="vous@exemple.ci" keyboard="email-address" />
          <Champ label="Mot de passe" value={motDePasse} onChange={setMotDePasse}
                 placeholder="8 caractères minimum" secret />

          {erreur ? <Text style={styles.err}>{erreur}</Text> : null}
          {info ? <Text style={styles.ok}>{info}</Text> : null}

          <Pressable
            style={[styles.cta, (occupe || !CONFIGURE) && styles.ctaOff]}
            onPress={valider}
            disabled={occupe || !CONFIGURE}
            accessibilityRole="button"
          >
            {occupe
              ? <ActivityIndicator color={colors.white} />
              : <Text style={styles.ctaTxt}>
                  {mode === 'connexion' ? 'Se connecter' : 'Créer mon compte'}
                </Text>}
          </Pressable>

          <Pressable
            onPress={() => { setMode(mode === 'connexion' ? 'inscription' : 'connexion'); setErreur(''); setInfo(''); }}
            accessibilityRole="button"
          >
            <Text style={styles.bascule}>
              {mode === 'connexion'
                ? 'Pas encore de compte ? En créer un'
                : 'Déjà inscrit ? Se connecter'}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Champ({ label, value, onChange, placeholder, secret, keyboard }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; secret?: boolean; keyboard?: 'email-address';
}) {
  return (
    <View style={{ marginBottom: space.md }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.textLight}
        secureTextEntry={secret}
        autoCapitalize={keyboard === 'email-address' || secret ? 'none' : 'words'}
        keyboardType={keyboard}
        autoCorrect={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  head: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: space.lg, paddingVertical: space.md,
    borderBottomWidth: 1, borderBottomColor: colors.borderLight,
  },
  headTitle: { ...type.h3 },
  body: { padding: space.lg, paddingTop: space.xl },
  label: { fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 6 },
  input: {
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.md,
    paddingHorizontal: space.md, paddingVertical: 12, fontSize: 15, color: colors.text,
  },
  err: { color: colors.brandDark, fontSize: 13.5, marginBottom: space.md },
  ok: { color: colors.success, fontSize: 13.5, marginBottom: space.md },
  avis: { color: colors.textMuted, fontSize: 13, marginBottom: space.lg, lineHeight: 19 },
  cta: {
    backgroundColor: colors.brand, borderRadius: radius.md, paddingVertical: 15,
    alignItems: 'center', marginTop: space.sm,
  },
  ctaOff: { opacity: 0.5 },
  ctaTxt: { color: colors.white, fontSize: 15, fontWeight: '700' },
  bascule: { textAlign: 'center', color: colors.brand, fontSize: 14, marginTop: space.lg },
});
