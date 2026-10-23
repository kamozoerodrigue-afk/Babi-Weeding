/**
 * Demande de devis — formulaire en feuille, structure de la page de
 * réservation Airbnb : récapitulatif du prestataire en haut, champs
 * regroupés par bloc, mention de sécurité, puis bouton de confirmation
 * plein largeur en pied.
 */
import React, { useState } from 'react';
import {
  View, Text, TextInput, ScrollView, Image, StyleSheet,
  KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Icon from '@/components/Icon';
import { Button, Chip, Divider, ScreenHeader } from '@/components/ui';
import { colors, radius, space, type } from '@/theme';
import { findVendor, formatFCFA } from '@/data/catalogue';
import { useStore } from '@/store/useFavorites';

const GUEST_RANGES = ['Moins de 100', '100 à 200', '200 à 400', 'Plus de 400'];

export default function DemandeDevis() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { addQuote } = useStore();
  const vendor = findVendor(String(id));

  const [date, setDate] = useState('14/12/2026');
  const [guests, setGuests] = useState(GUEST_RANGES[1]);
  const [budget, setBudget] = useState('');
  const [note, setNote] = useState('');

  if (!vendor) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader title="Demande de devis" />
        <View style={styles.center}><Text style={type.h3}>Prestataire introuvable</Text></View>
      </SafeAreaView>
    );
  }

  const submit = () => {
    if (!date.trim()) {
      Alert.alert('Date manquante', 'Indiquez la date prévue de votre mariage.');
      return;
    }
    /* La saisie est au format JJ/MM/AAAA ; la base attend AAAA-MM-JJ. */
    const [j, m, a] = date.trim().split(/[\/\-.]/);
    const isoDate = a && m && j
      ? `${a}-${m.padStart(2, '0')}-${j.padStart(2, '0')}`
      : date.trim();

    addQuote({
      vendorId: vendor.id,
      eventDate: isoDate,
      guests: parseInt(guests, 10) || 180,
      message: [note.trim(), budget.trim() && `Budget indicatif : ${budget.trim()}`]
        .filter(Boolean).join('\n') || 'Demande envoyée depuis l\'application mobile.',
    }).catch(() => {});

    Alert.alert(
      'Demande envoyée',
      `${vendor.name} vous répond généralement ${vendor.responseTime.toLowerCase()}. Vous suivrez la réponse dans l'onglet Mes devis.`,
      [{ text: 'Voir mes devis', onPress: () => router.replace('/(tabs)/devis') }]
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Demande de devis" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={8}
      >
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <View style={styles.summary}>
            <Image source={{ uri: vendor.photos[0] }} style={styles.thumb} />
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{vendor.name}</Text>
              <Text style={styles.meta}>{vendor.categoryLabel} · {vendor.commune}</Text>
              <View style={styles.ratingRow}>
                <Icon name="star" size={12} color={colors.star} filled />
                <Text style={styles.rating}>
                  {vendor.rating.toFixed(1).replace('.', ',')} ({vendor.reviews})
                </Text>
              </View>
              <Text style={styles.price}>À partir de {formatFCFA(vendor.priceFrom)}</Text>
            </View>
          </View>

          <Divider />

          <Text style={styles.label}>Date prévue du mariage</Text>
          <TextInput
            value={date}
            onChangeText={setDate}
            placeholder="JJ/MM/AAAA"
            placeholderTextColor={colors.textLight}
            style={styles.input}
            keyboardType="numbers-and-punctuation"
            accessibilityLabel="Date prévue du mariage"
          />

          <Text style={[styles.label, { marginTop: space.lg }]}>Nombre d'invités</Text>
          <View style={styles.chips}>
            {GUEST_RANGES.map((g) => (
              <Chip key={g} label={g} on={guests === g} onPress={() => setGuests(g)} />
            ))}
          </View>

          <Text style={[styles.label, { marginTop: space.lg }]}>Budget envisagé (facultatif)</Text>
          <TextInput
            value={budget}
            onChangeText={setBudget}
            placeholder="Par exemple 350 000 FCFA"
            placeholderTextColor={colors.textLight}
            style={styles.input}
            keyboardType="numeric"
            accessibilityLabel="Budget envisagé"
          />

          <Text style={[styles.label, { marginTop: space.lg }]}>Votre message</Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Précisez le déroulé de la journée, le lieu et vos attentes."
            placeholderTextColor={colors.textLight}
            style={[styles.input, styles.textarea]}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            accessibilityLabel="Votre message"
          />

          <View style={styles.notice}>
            <Icon name="lock" size={20} color={colors.success} strokeWidth={1.8} />
            <Text style={styles.noticeTxt}>
              Vos coordonnées restent masquées. Les échanges passent par la messagerie
              sécurisée et l'acompte est conservé en séquestre jusqu'à la prestation.
            </Text>
          </View>

          <Text style={styles.free}>
            La demande est gratuite et sans engagement. {vendor.responseTime.toLowerCase()}.
          </Text>
        </ScrollView>

        <View style={styles.foot}>
          <Button label="Envoyer la demande" onPress={submit} style={{ flex: 1 }} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  body: { padding: space.lg, paddingBottom: space.xl },
  summary: { flexDirection: 'row', gap: space.md, alignItems: 'center' },
  thumb: { width: 92, height: 92, borderRadius: radius.lg, backgroundColor: colors.bgAlt },
  name: { fontSize: 17, fontWeight: '700', color: colors.text },
  meta: { ...type.small, marginTop: 2 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  rating: { fontSize: 13, color: colors.text, fontWeight: '600' },
  price: { fontSize: 14, fontWeight: '700', color: colors.text, marginTop: 3 },

  label: { ...type.h3, marginBottom: space.sm },
  input: {
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.md,
    paddingHorizontal: space.md, minHeight: 50, fontSize: 15, color: colors.text,
  },
  textarea: { minHeight: 110, paddingTop: space.md },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },

  notice: {
    flexDirection: 'row', gap: space.md, alignItems: 'flex-start',
    backgroundColor: colors.successPale, borderRadius: radius.lg,
    padding: space.md, marginTop: space.xl,
  },
  noticeTxt: { flex: 1, fontSize: 13.5, color: colors.text, lineHeight: 19 },
  free: { ...type.small, marginTop: space.md, textAlign: 'center' },

  foot: {
    flexDirection: 'row', paddingHorizontal: space.lg, paddingVertical: space.md,
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border,
    backgroundColor: colors.bg,
  },
});
