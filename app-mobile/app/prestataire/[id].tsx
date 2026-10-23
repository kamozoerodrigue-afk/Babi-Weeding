/**
 * Fiche prestataire — structure de la page logement Airbnb :
 * galerie plein cadre avec boutons flottants, titre, ligne de note,
 * bloc hôte, sections séparées par des filets, puis barre d'action fixe
 * en pied avec le prix à gauche et le bouton principal à droite.
 */
import React, { useState } from 'react';
import {
  View, Text, Image, ScrollView, Pressable, StyleSheet,
  useWindowDimensions, type NativeSyntheticEvent, type NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Icon from '@/components/Icon';
import { Button, Divider, InfoRow } from '@/components/ui';
import { colors, radius, shadow, space, type } from '@/theme';
import { findVendor, formatFCFA, VENDORS } from '@/data/catalogue';
import { useStore } from '@/store/useFavorites';

export default function VendorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { isFavorite, toggleFavorite } = useStore();
  const [page, setPage] = useState(0);

  const vendor = findVendor(String(id));

  if (!vendor) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.notFound}>
          <Text style={type.h3}>Prestataire introuvable</Text>
          <Button label="Retour" variant="outline" onPress={() => router.back()} style={{ marginTop: space.lg }} />
        </View>
      </SafeAreaView>
    );
  }

  const fav = isFavorite(vendor.id);
  const similar = VENDORS.filter((v) => v.categoryId === vendor.categoryId && v.id !== vendor.id).slice(0, 4);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(e.nativeEvent.contentOffset.x / width);
    if (next !== page) setPage(next);
  };

  return (
    <View style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
        {/* Galerie */}
        <View style={{ height: width * 0.78 }}>
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} onScroll={onScroll} scrollEventThrottle={16}>
            {vendor.photos.map((uri) => (
              <Image key={uri} source={{ uri }} style={{ width, height: '100%' }} resizeMode="cover" />
            ))}
          </ScrollView>

          <SafeAreaView style={styles.floatBar} edges={['top']} pointerEvents="box-none">
            <Pressable style={[styles.circle, shadow.soft]} onPress={() => router.back()} accessibilityLabel="Retour">
              <Icon name="back" size={18} color={colors.text} strokeWidth={2.2} />
            </Pressable>
            <View style={{ flex: 1 }} />
            <Pressable style={[styles.circle, shadow.soft]} accessibilityLabel="Partager">
              <Icon name="share" size={18} color={colors.text} strokeWidth={2} />
            </Pressable>
            <Pressable
              style={[styles.circle, shadow.soft]}
              onPress={() => toggleFavorite(vendor.id)}
              accessibilityLabel={fav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            >
              <Icon name="heart" size={18} color={fav ? colors.brand : colors.text} filled={fav} strokeWidth={2} />
            </Pressable>
          </SafeAreaView>

          <View style={styles.counter}>
            <Text style={styles.counterTxt}>{page + 1} / {vendor.photos.length}</Text>
          </View>
        </View>

        <View style={styles.body}>
          <Text style={styles.title}>{vendor.name}</Text>
          <Text style={styles.subtitle}>
            {vendor.categoryLabel} · {vendor.commune}, {vendor.city}
          </Text>

          <View style={styles.ratingRow}>
            <Icon name="star" size={15} color={colors.star} filled />
            <Text style={styles.ratingVal}>{vendor.rating.toFixed(1).replace('.', ',')}</Text>
            <Text style={styles.ratingSep}>·</Text>
            <Text style={styles.ratingLink}>{vendor.reviews} avis certifiés</Text>
            {vendor.certified && (
              <>
                <Text style={styles.ratingSep}>·</Text>
                <View style={styles.gold}>
                  <Icon name="check" size={11} color={colors.white} strokeWidth={3} />
                  <Text style={styles.goldTxt}>Certifié Or</Text>
                </View>
              </>
            )}
          </View>

          <Divider />

          {/* Interlocuteur */}
          <View style={styles.owner}>
            <Image source={{ uri: vendor.owner.avatar }} style={styles.ownerAvatar} />
            <View style={{ flex: 1 }}>
              <Text style={styles.ownerName}>Votre contact : {vendor.owner.name}</Text>
              <Text style={styles.ownerRole}>
                {vendor.owner.role} · sur Babi Wedding depuis {vendor.owner.since}
              </Text>
            </View>
          </View>

          <Divider />

          <InfoRow icon="clock" title={vendor.responseTime} subtitle="Délai de réponse moyen constaté" />
          <InfoRow icon="shield" title="Profil vérifié" subtitle="Pièce d'identité et portfolio contrôlés par notre équipe" />
          <InfoRow
            icon="lock"
            title="Acompte sécurisé"
            subtitle="Conservé en séquestre via Paystack jusqu'à confirmation de la prestation"
          />
          {vendor.capacity && <InfoRow icon="users" title={vendor.capacity} subtitle="Capacité d'accueil" />}

          <Divider />

          <Text style={styles.section}>À propos</Text>
          <Text style={styles.para}>{vendor.about}</Text>

          <Divider />

          <Text style={styles.section}>Prestations incluses</Text>
          <View style={{ gap: space.sm }}>
            {vendor.services.map((s) => (
              <View key={s} style={styles.service}>
                <Icon name="checkCircle" size={19} color={colors.success} strokeWidth={1.8} />
                <Text style={styles.serviceTxt}>{s}</Text>
              </View>
            ))}
          </View>

          <Divider />

          <Text style={styles.section}>Moyens de paiement acceptés</Text>
          <View style={styles.pays}>
            {['Orange Money', 'MTN MoMo', 'Wave', 'Visa', 'Mastercard'].map((m) => (
              <View key={m} style={styles.pay}><Text style={styles.payTxt}>{m}</Text></View>
            ))}
          </View>

          {similar.length > 0 && (
            <>
              <Divider />
              <Text style={styles.section}>Prestataires similaires</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.md }}>
                {similar.map((v) => (
                  <Pressable
                    key={v.id}
                    style={styles.mini}
                    onPress={() => router.replace(`/prestataire/${v.id}`)}
                    accessibilityRole="button"
                  >
                    <Image source={{ uri: v.photos[0] }} style={styles.miniImg} />
                    <Text style={styles.miniName} numberOfLines={1}>{v.name}</Text>
                    <View style={styles.miniRow}>
                      <Icon name="star" size={12} color={colors.star} filled />
                      <Text style={styles.miniMeta}>
                        {v.rating.toFixed(1).replace('.', ',')} · {v.commune}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
            </>
          )}
        </View>
      </ScrollView>

      {/* Barre d'action fixe */}
      <SafeAreaView style={styles.actionBar} edges={['bottom']}>
        <View style={{ flex: 1 }}>
          <Text style={styles.actionPrice}>{formatFCFA(vendor.priceFrom)}</Text>
          <Text style={styles.actionUnit}>à partir de, {vendor.priceUnit}</Text>
        </View>
        <Button
          label="Demander un devis"
          onPress={() => router.push(`/devis/${vendor.id}`)}
          style={{ paddingHorizontal: space.xl }}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.xl },

  floatBar: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', gap: space.sm,
    paddingHorizontal: space.lg, paddingTop: space.sm,
  },
  circle: {
    width: 34, height: 34, borderRadius: 17, backgroundColor: colors.white,
    alignItems: 'center', justifyContent: 'center',
  },
  counter: {
    position: 'absolute', right: space.lg, bottom: space.lg,
    backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: radius.pill,
  },
  counterTxt: { color: colors.white, fontSize: 12, fontWeight: '600' },

  body: { padding: space.lg },
  title: { ...type.h1, fontSize: 24 },
  subtitle: { ...type.muted, marginTop: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: space.sm, flexWrap: 'wrap' },
  ratingVal: { fontSize: 14, fontWeight: '700', color: colors.text },
  ratingSep: { color: colors.textLight },
  ratingLink: { fontSize: 14, color: colors.text, textDecorationLine: 'underline' },
  gold: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.gold, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.sm,
  },
  goldTxt: { color: colors.white, fontSize: 11, fontWeight: '700' },

  owner: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  ownerAvatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: colors.bgAlt },
  ownerName: { fontSize: 16, fontWeight: '700', color: colors.text },
  ownerRole: { ...type.small, marginTop: 2 },

  section: { ...type.h2, fontSize: 19, marginBottom: space.sm },
  para: { ...type.body, color: colors.textMuted, lineHeight: 23 },
  service: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  serviceTxt: { fontSize: 15, color: colors.text },

  pays: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  pay: {
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  payTxt: { fontSize: 12.5, color: colors.textMuted, fontWeight: '600' },

  mini: { width: 150 },
  miniImg: { width: 150, height: 110, borderRadius: radius.md, backgroundColor: colors.bgAlt },
  miniName: { fontSize: 14, fontWeight: '700', color: colors.text, marginTop: 6 },
  miniRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  miniMeta: { fontSize: 12.5, color: colors.textMuted },

  actionBar: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    flexDirection: 'row', alignItems: 'center', gap: space.md,
    paddingHorizontal: space.lg, paddingTop: space.md, paddingBottom: space.md,
    backgroundColor: colors.white,
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border,
  },
  actionPrice: { fontSize: 17, fontWeight: '700', color: colors.text },
  actionUnit: { fontSize: 12.5, color: colors.textMuted },
});
