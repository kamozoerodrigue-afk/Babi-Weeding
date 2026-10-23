/**
 * Onglet Explorer — le fil principal.
 * Structure Airbnb : pilule de recherche collante, bandeau de catégories,
 * puis flux vertical de grandes cartes.
 */
import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import SearchPill from '@/components/SearchPill';
import CategoryStrip from '@/components/CategoryStrip';
import VendorCard from '@/components/VendorCard';
import FiltersSheet, { EMPTY_FILTERS, type Filters } from '@/components/FiltersSheet';
import { EmptyState, Button } from '@/components/ui';
import { colors, space, type } from '@/theme';
import { applyFilters } from '@/lib/filter';

export default function Explorer() {
  const router = useRouter();
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [sheetOpen, setSheetOpen] = useState(false);

  const results = useMemo(() => applyFilters(filters), [filters]);

  /* Les sponsorisés remontent en tête, comme les annonces mises en avant. */
  const feed = useMemo(
    () => [...results].sort((a, b) => Number(b.sponsored) - Number(a.sponsored)),
    [results]
  );

  const subtitle = [
    filters.cities.length ? filters.cities.join(', ') : 'Toute la Côte d\'Ivoire',
    filters.categoryId
      ? results[0]?.categoryLabel ?? 'Catégorie choisie'
      : 'Toutes catégories',
  ].join(' · ');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <SearchPill
        subtitle={subtitle}
        onPress={() => router.push('/recherche')}
        onFilters={() => setSheetOpen(true)}
      />

      <CategoryStrip
        active={filters.categoryId}
        onChange={(id) => setFilters((f) => ({ ...f, categoryId: id }))}
      />

      <FlatList
        data={feed}
        keyExtractor={(v) => v.id}
        renderItem={({ item }) => <VendorCard vendor={item} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.head}>
            <Text style={styles.count}>
              {feed.length} prestataire{feed.length > 1 ? 's' : ''} disponible{feed.length > 1 ? 's' : ''}
            </Text>
            <Text style={styles.note}>Profils vérifiés · Devis gratuits · Paiement Mobile Money</Text>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="search"
            title="Aucun prestataire ne correspond"
            text="Élargissez la zone géographique ou le budget pour voir plus de résultats."
            action={
              <Button
                label="Réinitialiser les filtres"
                variant="outline"
                onPress={() => setFilters(EMPTY_FILTERS)}
                style={{ marginTop: space.md }}
              />
            }
          />
        }
      />

      <FiltersSheet
        visible={sheetOpen}
        initial={filters}
        resultCount={results.length}
        onClose={() => setSheetOpen(false)}
        onApply={(f) => { setFilters(f); setSheetOpen(false); }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  list: { paddingTop: space.lg, paddingBottom: space.xl },
  head: { paddingHorizontal: space.lg, marginBottom: space.lg },
  count: { ...type.h3 },
  note: { ...type.small, marginTop: 2 },
});
