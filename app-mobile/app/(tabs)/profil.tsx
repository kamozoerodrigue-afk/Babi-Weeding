import React from 'react';
import { View, Text, Image, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Icon, { type IconName } from '@/components/Icon';
import { Divider } from '@/components/ui';
import { colors, radius, space, type } from '@/theme';
import { useStore } from '@/store/useFavorites';
import { useSession } from '@/store/useSession';
import { source } from '@/data/catalogue';

export default function Profil() {
  const router = useRouter();
  const { favorites, quotes } = useStore();
  const { session, profil, deconnexion } = useSession();

  const connecte = !!session;
  const nom = profil?.nom_complet ?? session?.user.email ?? 'Invité';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Profil</Text>

        <View style={styles.card}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=200&q=72' }}
            style={styles.avatar}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{nom}</Text>
            <Text style={styles.meta}>
              {connecte ? session?.user.email : 'Connectez-vous pour suivre vos devis'}
            </Text>
          </View>
          <Icon name="next" size={18} color={colors.textLight} strokeWidth={2} />
        </View>

        <View style={styles.stats}>
          <Stat value={String(quotes.length)} label="Devis en cours" />
          <Stat value={String(favorites.length)} label="Favoris" />
          <Stat value="132" label="Jours restants" />
        </View>

        <Divider />

        <Text style={styles.section}>Mon mariage</Text>
        <Row icon="calendar" label="Date et lieu de la cérémonie" />
        <Row icon="users" label="Liste des invités" hint="180 personnes" />
        <Row icon="money" label="Budget et suivi des dépenses" hint="3 sur 12 postes réglés" />
        <Row icon="planner" label="Check-list et rétroplanning" hint="24 tâches sur 120" />

        <Divider />

        <Text style={styles.section}>Paiements</Text>
        <Row icon="card" label="Moyens de paiement" hint="Orange Money · Wave" />
        <Row icon="doc" label="Historique des acomptes" />
        <Row icon="shield" label="Protection des acomptes" hint="Séquestre Paystack" />

        <Divider />

        <Text style={styles.section}>Compte</Text>
        <Row icon="bell" label="Notifications" />
        <Row icon="globe" label="Langue et région" hint="Français · Côte d'Ivoire" />
        <Row icon="lock" label="Confidentialité et sécurité" />
        <Row icon="settings" label="Paramètres" />

        <Divider />

        <Pressable
          style={styles.pro}
          onPress={() => router.push('/(tabs)')}
          accessibilityRole="button"
        >
          <Icon name="agence" size={24} color={colors.brand} strokeWidth={1.6} />
          <View style={{ flex: 1 }}>
            <Text style={styles.proTitle}>Vous êtes prestataire ?</Text>
            <Text style={styles.proSub}>Créez votre profil professionnel, 3 mois offerts au lancement.</Text>
          </View>
          <Icon name="next" size={18} color={colors.brand} strokeWidth={2} />
        </Pressable>

        <Pressable
          style={styles.logout}
          accessibilityRole="button"
          onPress={() => (connecte ? deconnexion() : router.push('/connexion'))}
        >
          <Icon name={connecte ? 'logout' : 'user'} size={20} color={colors.textMuted} strokeWidth={1.8} />
          <Text style={styles.logoutTxt}>{connecte ? 'Se déconnecter' : 'Se connecter'}</Text>
        </Pressable>

        <Text style={styles.version}>
          Babi Wedding · version 1.0.0 · Abidjan, Côte d'Ivoire
          {source === 'demo' ? ' · démonstration hors ligne' : ''}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function Row({ icon, label, hint }: { icon: IconName; label: string; hint?: string }) {
  return (
    <Pressable style={styles.row} accessibilityRole="button">
      <Icon name={icon} size={22} color={colors.text} strokeWidth={1.7} />
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        {hint ? <Text style={styles.rowHint}>{hint}</Text> : null}
      </View>
      <Icon name="next" size={17} color={colors.textLight} strokeWidth={2} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  body: { padding: space.lg, paddingBottom: space.xxl },
  title: { ...type.h1, marginBottom: space.lg },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: space.md,
    borderWidth: 1, borderColor: colors.borderLight, borderRadius: radius.lg,
    padding: space.lg,
  },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.bgAlt },
  name: { fontSize: 18, fontWeight: '700', color: colors.text },
  meta: { ...type.small, marginTop: 2 },
  stats: { flexDirection: 'row', gap: space.md, marginTop: space.lg },
  stat: { flex: 1, backgroundColor: colors.bgAlt, borderRadius: radius.lg, padding: space.md, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '700', color: colors.brand },
  statLabel: { fontSize: 12, color: colors.textMuted, marginTop: 2, textAlign: 'center' },
  section: { ...type.h3, marginBottom: space.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.lg, paddingVertical: 13 },
  rowLabel: { fontSize: 15, color: colors.text },
  rowHint: { fontSize: 13, color: colors.textLight, marginTop: 1 },
  pro: {
    flexDirection: 'row', alignItems: 'center', gap: space.md,
    backgroundColor: colors.brandPale, borderRadius: radius.lg, padding: space.lg,
  },
  proTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  proSub: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  logout: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.lg },
  logoutTxt: { fontSize: 15, color: colors.textMuted, textDecorationLine: 'underline' },
  version: { fontSize: 12, color: colors.textLight, textAlign: 'center', marginTop: space.sm },
});
