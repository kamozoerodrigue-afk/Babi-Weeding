/**
 * Écran de recherche, ouvert en feuille depuis la pilule — équivalent
 * du panneau de recherche Airbnb : champ actif en haut, suggestions
 * récentes puis catégories populaires.
 */
import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Icon from '@/components/Icon';
import { Button } from '@/components/ui';
import { colors, radius, space, type } from '@/theme';
import { CATEGORIES, CITIES, VENDORS } from '@/data/catalogue';

const RECENTS = ['Photographe à Cocody', 'Traiteur 180 couverts', 'Salle Riviera Golf'];

export default function Recherche() {
  const router = useRouter();
  const [q, setQ] = useState('');

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (term.length < 2) return [];
    return VENDORS.filter(
      (v) =>
        v.name.toLowerCase().includes(term) ||
        v.categoryLabel.toLowerCase().includes(term) ||
        v.commune.toLowerCase().includes(term) ||
        v.city.toLowerCase().includes(term)
    );
  }, [q]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.top}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.close} accessibilityLabel="Fermer">
          <Icon name="x" size={20} color={colors.text} strokeWidth={2.2} />
        </Pressable>
        <View style={styles.field}>
          <Icon name="search" size={18} color={colors.textMuted} strokeWidth={2.2} />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Prestataire, catégorie ou commune"
            placeholderTextColor={colors.textLight}
            style={styles.input}
            autoFocus
            returnKeyType="search"
            accessibilityLabel="Champ de recherche"
          />
          {q.length > 0 && (
            <Pressable onPress={() => setQ('')} hitSlop={10} accessibilityLabel="Effacer">
              <Icon name="x" size={16} color={colors.textMuted} strokeWidth={2.4} />
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        {q.trim().length >= 2 ? (
          results.length ? (
            <>
              <Text style={styles.label}>
                {results.length} résultat{results.length > 1 ? 's' : ''}
              </Text>
              {results.map((v) => (
                <Pressable
                  key={v.id}
                  style={styles.result}
                  onPress={() => router.replace(`/prestataire/${v.id}`)}
                  accessibilityRole="button"
                >
                  <Image source={{ uri: v.photos[0] }} style={styles.thumb} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.resultName}>{v.name}</Text>
                    <Text style={styles.resultMeta}>{v.categoryLabel} · {v.commune}</Text>
                  </View>
                  <Icon name="next" size={17} color={colors.textLight} strokeWidth={2} />
                </Pressable>
              ))}
            </>
          ) : (
            <View style={styles.none}>
              <Text style={type.h3}>Aucun résultat pour « {q.trim()} »</Text>
              <Text style={[type.muted, { marginTop: 4 }]}>
                Essayez un nom de commune ou une catégorie, par exemple « traiteur » ou « Cocody ».
              </Text>
            </View>
          )
        ) : (
          <>
            <Text style={styles.label}>Recherches récentes</Text>
            {RECENTS.map((r) => (
              <Pressable key={r} style={styles.recent} onPress={() => setQ(r.split(' ')[0])} accessibilityRole="button">
                <View style={styles.recentIcon}>
                  <Icon name="clock" size={18} color={colors.textMuted} strokeWidth={1.8} />
                </View>
                <Text style={styles.recentTxt}>{r}</Text>
              </Pressable>
            ))}

            <Text style={[styles.label, { marginTop: space.xl }]}>Catégories populaires</Text>
            <View style={styles.grid}>
              {CATEGORIES.slice(0, 8).map((c) => (
                <Pressable key={c.id} style={styles.tile} onPress={() => setQ(c.label)} accessibilityRole="button">
                  <Icon name={c.icon} size={26} color={colors.brand} strokeWidth={1.6} />
                  <Text style={styles.tileTxt}>{c.label}</Text>
                  <Text style={styles.tileNb}>{c.count} pros</Text>
                </Pressable>
              ))}
            </View>

            <Text style={[styles.label, { marginTop: space.xl }]}>Où vous mariez-vous ?</Text>
            <View style={styles.chips}>
              {CITIES.map((city) => (
                <Pressable key={city} style={styles.chip} onPress={() => setQ(city)} accessibilityRole="button">
                  <Icon name="pin" size={14} color={colors.textMuted} strokeWidth={1.9} />
                  <Text style={styles.chipTxt}>{city}</Text>
                </Pressable>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      <View style={styles.foot}>
        <Button label="Voir tous les prestataires" variant="dark" onPress={() => router.back()} style={{ flex: 1 }} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  top: {
    flexDirection: 'row', alignItems: 'center', gap: space.md,
    paddingHorizontal: space.lg, paddingVertical: space.md,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.borderLight,
  },
  close: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  field: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: space.sm,
    borderWidth: 1, borderColor: colors.text, borderRadius: radius.pill,
    paddingHorizontal: space.lg, height: 48,
  },
  input: { flex: 1, fontSize: 15, color: colors.text, paddingVertical: 0 },
  body: { padding: space.lg, paddingBottom: 40 },
  label: { ...type.h3, marginBottom: space.md },

  recent: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: 10 },
  recentIcon: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: colors.bgAlt,
    alignItems: 'center', justifyContent: 'center',
  },
  recentTxt: { fontSize: 15, color: colors.text },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
  tile: {
    width: '47%', borderWidth: 1, borderColor: colors.borderLight, borderRadius: radius.lg,
    padding: space.md, gap: 6,
  },
  tileTxt: { fontSize: 14, fontWeight: '600', color: colors.text },
  tileNb: { fontSize: 12, color: colors.textLight },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.pill,
    paddingHorizontal: space.md, paddingVertical: 8,
  },
  chipTxt: { fontSize: 14, color: colors.text },

  result: {
    flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.sm,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.borderLight,
  },
  thumb: { width: 52, height: 52, borderRadius: radius.md, backgroundColor: colors.bgAlt },
  resultName: { fontSize: 15, fontWeight: '700', color: colors.text },
  resultMeta: { ...type.small, marginTop: 1 },
  none: { paddingTop: space.xl },

  foot: {
    flexDirection: 'row', paddingHorizontal: space.lg, paddingVertical: space.md,
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border,
  },
});
