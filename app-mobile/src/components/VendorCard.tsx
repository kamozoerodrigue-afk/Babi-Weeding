/**
 * Carte prestataire — reprend la structure de la carte de logement Airbnb :
 * carrousel plein cadre en 1:1 arrondi, cœur en surimpression, badge en haut
 * à gauche, puis titre + note sur la même ligne, sous-titres gris, prix en gras.
 */
import React, { useRef, useState } from 'react';
import {
  View, Text, Image, Pressable, ScrollView, StyleSheet,
  useWindowDimensions, type NativeSyntheticEvent, type NativeScrollEvent,
} from 'react-native';
import { useRouter } from 'expo-router';
import Icon from './Icon';
import { colors, radius, space, type } from '@/theme';
import { formatFCFA, type Vendor } from '@/data/catalogue';
import { useStore } from '@/store/useFavorites';

export default function VendorCard({ vendor, compact = false }: { vendor: Vendor; compact?: boolean }) {
  const router = useRouter();
  const { isFavorite, toggleFavorite } = useStore();
  const { width } = useWindowDimensions();
  const cardWidth = width - space.lg * 2;
  const [page, setPage] = useState(0);
  const scroller = useRef<ScrollView>(null);
  const fav = isFavorite(vendor.id);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(e.nativeEvent.contentOffset.x / cardWidth);
    if (next !== page) setPage(next);
  };

  return (
    <Pressable
      style={styles.card}
      onPress={() => router.push(`/prestataire/${vendor.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`${vendor.name}, ${vendor.categoryLabel} à ${vendor.commune}`}
    >
      <View style={[styles.mediaWrap, { width: cardWidth, height: compact ? cardWidth * 0.66 : cardWidth }]}>
        <ScrollView
          ref={scroller}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
        >
          {vendor.photos.map((uri) => (
            <Image
              key={uri}
              source={{ uri }}
              style={{ width: cardWidth, height: '100%' }}
              resizeMode="cover"
            />
          ))}
        </ScrollView>

        {vendor.certified && (
          <View style={styles.badge}>
            <Icon name="check" size={12} color={colors.text} strokeWidth={2.6} />
            <Text style={styles.badgeTxt}>Certifié Or</Text>
          </View>
        )}

        <Pressable
          style={styles.heart}
          hitSlop={10}
          onPress={() => toggleFavorite(vendor.id)}
          accessibilityRole="button"
          accessibilityLabel={fav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          <Icon
            name="heart"
            size={26}
            color={fav ? colors.brand : colors.white}
            filled={fav}
            strokeWidth={2}
          />
        </Pressable>

        {vendor.photos.length > 1 && (
          <View style={styles.dots}>
            {vendor.photos.map((_, i) => (
              <View key={i} style={[styles.dot, i === page && styles.dotOn]} />
            ))}
          </View>
        )}
      </View>

      <View style={styles.info}>
        <View style={styles.row}>
          <Text style={styles.name} numberOfLines={1}>{vendor.name}</Text>
          <View style={styles.rating}>
            <Icon name="star" size={13} color={colors.star} filled />
            <Text style={styles.ratingTxt}>
              {vendor.rating.toFixed(1).replace('.', ',')}
            </Text>
            <Text style={styles.reviews}>({vendor.reviews})</Text>
          </View>
        </View>

        <Text style={styles.sub} numberOfLines={1}>
          {vendor.categoryLabel} · {vendor.commune}
        </Text>
        <Text style={styles.sub} numberOfLines={1}>{vendor.tagline}</Text>

        <Text style={styles.price}>
          À partir de {formatFCFA(vendor.priceFrom)}
          <Text style={styles.priceUnit}> · {vendor.priceUnit}</Text>
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: space.xl, paddingHorizontal: space.lg },
  mediaWrap: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.bgAlt,
  },
  badge: {
    position: 'absolute', top: 12, left: 12,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.white,
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: radius.pill,
  },
  badgeTxt: { fontSize: 12, fontWeight: '700', color: colors.text },
  heart: { position: 'absolute', top: 10, right: 10, padding: 4 },
  dots: {
    position: 'absolute', bottom: 12, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'center', gap: 5,
  },
  dot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  dotOn: { backgroundColor: colors.white },
  info: { marginTop: space.md, gap: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  name: { ...type.h3, flex: 1 },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingTxt: { fontSize: 14, fontWeight: '600', color: colors.text },
  reviews: { fontSize: 13, color: colors.textMuted },
  sub: { ...type.muted },
  price: { ...type.price, marginTop: 4 },
  priceUnit: { fontWeight: '400', color: colors.textMuted, fontSize: 14 },
});
