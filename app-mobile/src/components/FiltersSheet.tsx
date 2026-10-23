/**
 * Panneau de filtres en feuille basse, comme celui d'Airbnb :
 * modal glissant depuis le bas, en-tête avec croix et titre centré,
 * barre d'action fixe en pied avec « Tout effacer » et le bouton de validation.
 */
import React, { useState } from 'react';
import { Modal, View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from './Icon';
import { Button, Chip, Divider } from './ui';
import { colors, radius, space, type } from '@/theme';
import { BUDGETS, CATEGORIES, CITIES } from '@/data/catalogue';

export type Filters = {
  categoryId: string | null;
  cities: string[];
  budgetId: string | null;
  certifiedOnly: boolean;
  minRating: number | null;
};

export const EMPTY_FILTERS: Filters = {
  categoryId: null, cities: [], budgetId: null, certifiedOnly: false, minRating: null,
};

export default function FiltersSheet({
  visible, initial, resultCount, onClose, onApply,
}: {
  visible: boolean;
  initial: Filters;
  resultCount: number;
  onClose: () => void;
  onApply: (f: Filters) => void;
}) {
  const [draft, setDraft] = useState<Filters>(initial);

  React.useEffect(() => { if (visible) setDraft(initial); }, [visible, initial]);

  const toggleCity = (city: string) =>
    setDraft((d) => ({
      ...d,
      cities: d.cities.includes(city) ? d.cities.filter((c) => c !== city) : [...d.cities, city],
    }));

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.head}>
          <Pressable onPress={onClose} hitSlop={12} style={styles.close} accessibilityLabel="Fermer les filtres">
            <Icon name="x" size={18} color={colors.text} strokeWidth={2.2} />
          </Pressable>
          <Text style={styles.headTitle}>Filtres</Text>
          <View style={styles.close} />
        </View>

        <ScrollView contentContainerStyle={styles.body}>
          <Text style={styles.label}>Type de prestataire</Text>
          <View style={styles.wrapRow}>
            <Chip label="Tous" on={draft.categoryId === null} onPress={() => setDraft({ ...draft, categoryId: null })} />
            {CATEGORIES.map((cat) => (
              <Chip
                key={cat.id}
                label={cat.label}
                on={draft.categoryId === cat.id}
                onPress={() => setDraft({ ...draft, categoryId: cat.id })}
              />
            ))}
          </View>

          <Divider />

          <Text style={styles.label}>Ville ou commune</Text>
          <View style={styles.wrapRow}>
            {CITIES.map((city) => (
              <Chip key={city} label={city} on={draft.cities.includes(city)} onPress={() => toggleCity(city)} />
            ))}
          </View>

          <Divider />

          <Text style={styles.label}>Budget de départ</Text>
          <View style={styles.wrapRow}>
            {BUDGETS.map((b) => (
              <Chip
                key={b.id}
                label={b.label}
                on={draft.budgetId === b.id}
                onPress={() => setDraft({ ...draft, budgetId: draft.budgetId === b.id ? null : b.id })}
              />
            ))}
          </View>

          <Divider />

          <Text style={styles.label}>Note minimale</Text>
          <View style={styles.wrapRow}>
            {[4, 4.5, 4.8].map((n) => (
              <Chip
                key={n}
                label={`${n.toFixed(1).replace('.', ',')} et plus`}
                on={draft.minRating === n}
                onPress={() => setDraft({ ...draft, minRating: draft.minRating === n ? null : n })}
              />
            ))}
          </View>

          <Divider />

          <Pressable
            style={styles.switchRow}
            onPress={() => setDraft({ ...draft, certifiedOnly: !draft.certifiedOnly })}
            accessibilityRole="switch"
            accessibilityState={{ checked: draft.certifiedOnly }}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.switchTitle}>Prestataires Certifiés Or uniquement</Text>
              <Text style={styles.switchSub}>Pièce d'identité et portfolio vérifiés par notre équipe</Text>
            </View>
            <View style={[styles.box, draft.certifiedOnly && styles.boxOn]}>
              {draft.certifiedOnly && <Icon name="check" size={14} color={colors.white} strokeWidth={3} />}
            </View>
          </Pressable>
        </ScrollView>

        <View style={styles.foot}>
          <Pressable onPress={() => setDraft(EMPTY_FILTERS)} hitSlop={8}>
            <Text style={styles.clear}>Tout effacer</Text>
          </Pressable>
          <Button
            label={`Afficher ${resultCount} prestataire${resultCount > 1 ? 's' : ''}`}
            onPress={() => onApply(draft)}
            style={{ flex: 1, marginLeft: space.lg }}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  head: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: space.lg, paddingVertical: space.md,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border,
  },
  close: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  headTitle: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700', color: colors.text },
  body: { padding: space.xl, paddingBottom: 40 },
  label: { ...type.h3, marginBottom: space.md },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: space.lg },
  switchTitle: { fontSize: 15, fontWeight: '600', color: colors.text },
  switchSub: { ...type.small, marginTop: 2 },
  box: {
    width: 26, height: 26, borderRadius: radius.sm,
    borderWidth: 2, borderColor: colors.text,
    alignItems: 'center', justifyContent: 'center',
  },
  boxOn: { backgroundColor: colors.text },
  foot: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: space.lg, paddingVertical: space.md,
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border,
    backgroundColor: colors.bg,
  },
  clear: { fontSize: 15, fontWeight: '700', color: colors.text, textDecorationLine: 'underline' },
});
