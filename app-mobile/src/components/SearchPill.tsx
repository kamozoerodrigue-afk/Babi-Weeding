/**
 * Pilule de recherche flottante, reprise de l'en-tête Airbnb :
 * capsule blanche à ombre douce, loupe à gauche, deux lignes de texte,
 * bouton de filtres cerclé à droite.
 */
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from './Icon';
import { colors, radius, shadow, space } from '@/theme';

type Props = {
  title?: string;
  subtitle?: string;
  onPress: () => void;
  onFilters?: () => void;
};

export default function SearchPill({
  title = 'Quel prestataire cherchez-vous ?',
  subtitle = 'Toute la Côte d\'Ivoire · Toutes catégories',
  onPress,
  onFilters,
}: Props) {
  return (
    <View style={styles.wrap}>
      <Pressable
        style={[styles.pill, shadow.soft]}
        onPress={onPress}
        accessibilityRole="search"
        accessibilityLabel="Lancer une recherche"
      >
        <Icon name="search" size={18} color={colors.text} strokeWidth={2.4} />
        <View style={styles.texts}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          <Text style={styles.sub} numberOfLines={1}>{subtitle}</Text>
        </View>
      </Pressable>

      {onFilters && (
        <Pressable
          style={styles.filters}
          onPress={onFilters}
          accessibilityRole="button"
          accessibilityLabel="Ouvrir les filtres"
        >
          <Icon name="sliders" size={18} color={colors.text} strokeWidth={2} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
    backgroundColor: colors.bg,
  },
  pill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radius.pill,
    paddingHorizontal: space.lg,
    paddingVertical: 11,
  },
  texts: { flex: 1 },
  title: { fontSize: 14, fontWeight: '600', color: colors.text },
  sub: { fontSize: 12, color: colors.textMuted, marginTop: 1 },
  filters: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
});
