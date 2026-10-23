import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import VendorCard from '@/components/VendorCard';
import { Button, EmptyState } from '@/components/ui';
import { colors, space, type } from '@/theme';
import { VENDORS } from '@/data/catalogue';
import { useStore } from '@/store/useFavorites';

export default function Favoris() {
  const router = useRouter();
  const { favorites } = useStore();
  const list = VENDORS.filter((v) => favorites.includes(v.id));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.head}>
        <Text style={styles.title}>Favoris</Text>
        {list.length > 0 && (
          <Text style={styles.sub}>
            {list.length} prestataire{list.length > 1 ? 's' : ''} enregistré{list.length > 1 ? 's' : ''}
          </Text>
        )}
      </View>

      <FlatList
        data={list}
        keyExtractor={(v) => v.id}
        renderItem={({ item }) => <VendorCard vendor={item} compact />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            icon="heart"
            title="Aucun favori pour l'instant"
            text="Touchez le cœur sur un prestataire pour le retrouver ici et comparer vos coups de cœur."
            action={
              <Button
                label="Explorer les prestataires"
                onPress={() => router.push('/(tabs)')}
                style={{ marginTop: space.md }}
              />
            }
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  head: { paddingHorizontal: space.lg, paddingTop: space.md, paddingBottom: space.lg },
  title: { ...type.h1 },
  sub: { ...type.muted, marginTop: 2 },
  list: { paddingBottom: space.xl },
});
