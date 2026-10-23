import React, { useMemo } from 'react';
import { View, Text, FlatList, Image, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Icon from '@/components/Icon';
import { Button, EmptyState } from '@/components/ui';
import { colors, radius, space, type } from '@/theme';
import { findVendor, formatFCFA, STATUS_LABEL, type Quote } from '@/data/catalogue';
import { useStore } from '@/store/useFavorites';

const STATUS_STYLE = {
  attente: { bg: colors.bgAlt, fg: colors.textMuted },
  recu: { bg: colors.brandPale, fg: colors.brand },
  accepte: { bg: colors.successPale, fg: colors.success },
} as const;

export default function Devis() {
  const router = useRouter();
  const { quotes } = useStore();

  const total = useMemo(
    () => quotes.filter((q) => q.status === 'accepte').reduce((s, q) => s + (q.amount ?? 0), 0),
    [quotes]
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.head}>
        <Text style={styles.title}>Mes devis</Text>
        <Text style={styles.sub}>Mariage du 14 décembre 2026 · 180 invités</Text>
      </View>

      <FlatList
        data={quotes}
        keyExtractor={(q) => q.id}
        renderItem={({ item }) => <QuoteRow quote={item} onPress={() => router.push(`/prestataire/${item.vendorId}`)} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          quotes.length ? (
            <View style={styles.budget}>
              <View style={{ flex: 1 }}>
                <Text style={styles.budgetLabel}>Budget engagé</Text>
                <Text style={styles.budgetValue}>{formatFCFA(total)}</Text>
              </View>
              <Icon name="money" size={26} color={colors.brand} strokeWidth={1.6} />
            </View>
          ) : null
        }
        ListEmptyComponent={
          <EmptyState
            icon="doc"
            title="Aucune demande envoyée"
            text="Demandez jusqu'à 5 devis gratuits en une fois et comparez-les ici."
            action={
              <Button label="Trouver un prestataire" onPress={() => router.push('/(tabs)')} style={{ marginTop: space.md }} />
            }
          />
        }
      />
    </SafeAreaView>
  );
}

function QuoteRow({ quote, onPress }: { quote: Quote; onPress: () => void }) {
  const vendor = findVendor(quote.vendorId);
  if (!vendor) return null;
  const st = STATUS_STYLE[quote.status];

  return (
    <Pressable style={styles.row} onPress={onPress} accessibilityRole="button">
      <Image source={{ uri: vendor.photos[0] }} style={styles.thumb} />
      <View style={{ flex: 1, gap: 3 }}>
        <Text style={styles.name} numberOfLines={1}>{vendor.name}</Text>
        <Text style={styles.meta} numberOfLines={1}>
          {vendor.categoryLabel} · {vendor.commune}
        </Text>
        <View style={[styles.pill, { backgroundColor: st.bg }]}>
          <Text style={[styles.pillTxt, { color: st.fg }]}>{STATUS_LABEL[quote.status]}</Text>
        </View>
        {quote.amount != null && <Text style={styles.amount}>{formatFCFA(quote.amount)}</Text>}
        <Text style={styles.sent}>Demande envoyée le {quote.sentAt}</Text>
      </View>
      <Icon name="next" size={18} color={colors.textLight} strokeWidth={2} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  head: { paddingHorizontal: space.lg, paddingTop: space.md, paddingBottom: space.md },
  title: { ...type.h1 },
  sub: { ...type.muted, marginTop: 2 },
  list: { paddingHorizontal: space.lg, paddingBottom: space.xl },
  budget: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.brandPale, borderRadius: radius.lg,
    padding: space.lg, marginBottom: space.lg,
  },
  budgetLabel: { ...type.small, color: colors.brandDark },
  budgetValue: { fontSize: 22, fontWeight: '700', color: colors.text, marginTop: 2 },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: space.md,
    paddingVertical: space.md,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.borderLight,
  },
  thumb: { width: 76, height: 76, borderRadius: radius.md, backgroundColor: colors.bgAlt },
  name: { fontSize: 16, fontWeight: '700', color: colors.text },
  meta: { ...type.small },
  pill: { alignSelf: 'flex-start', paddingHorizontal: 9, paddingVertical: 3, borderRadius: radius.sm, marginTop: 2 },
  pillTxt: { fontSize: 12, fontWeight: '700' },
  amount: { fontSize: 15, fontWeight: '700', color: colors.text, marginTop: 2 },
  sent: { fontSize: 12, color: colors.textLight },
});
