/**
 * Fil de conversation — bulles alignées à droite pour l'utilisateur,
 * à gauche pour le prestataire, barre de saisie fixe en pied.
 */
import React, { useState } from 'react';
import {
  View, Text, Image, TextInput, Pressable, FlatList, StyleSheet,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Icon from '@/components/Icon';
import { colors, radius, space, type } from '@/theme';
import { CONVERSATIONS, findVendor } from '@/data/catalogue';
import { envoyerMessage } from '@/lib/api';

type Msg = { from: 'me' | 'them'; text: string; at: string };

export default function Conversation() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const conversation = CONVERSATIONS.find((c) => c.id === String(id));
  const vendor = conversation ? findVendor(conversation.vendorId) : undefined;

  const [messages, setMessages] = useState<Msg[]>(conversation?.messages ?? []);
  const [draft, setDraft] = useState('');

  if (!conversation || !vendor) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.center}><Text style={type.h3}>Conversation introuvable</Text></View>
      </SafeAreaView>
    );
  }

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    const at = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    setMessages((m) => [...m, { from: 'me', text, at }]);
    /* Le message part vers la base ; le fil reste fluide en attendant. */
    envoyerMessage(conversation.id, text).catch(() => {});
    setDraft('');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.head}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.back} accessibilityLabel="Retour">
          <Icon name="back" size={20} color={colors.text} strokeWidth={2.2} />
        </Pressable>
        <Pressable
          style={styles.headInfo}
          onPress={() => router.push(`/prestataire/${vendor.id}`)}
          accessibilityRole="button"
        >
          <Image source={{ uri: vendor.owner.avatar }} style={styles.avatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.name} numberOfLines={1}>{vendor.name}</Text>
            <Text style={styles.status} numberOfLines={1}>{vendor.responseTime}</Text>
          </View>
        </Pressable>
        <Pressable hitSlop={10} style={styles.back} accessibilityLabel="Appeler">
          <Icon name="phone" size={19} color={colors.text} strokeWidth={1.9} />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={8}
      >
        <FlatList
          data={messages}
          keyExtractor={(_, i) => String(i)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => <Bubble msg={item} />}
          ListHeaderComponent={
            <View style={styles.intro}>
              <Icon name="lock" size={16} color={colors.textMuted} strokeWidth={1.8} />
              <Text style={styles.introTxt}>
                Messagerie sécurisée. Vos coordonnées personnelles ne sont pas transmises.
              </Text>
            </View>
          }
        />

        <View style={styles.composer}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Écrire un message"
            placeholderTextColor={colors.textLight}
            style={styles.input}
            multiline
            accessibilityLabel="Écrire un message"
          />
          <Pressable
            onPress={send}
            style={[styles.send, !draft.trim() && styles.sendOff]}
            disabled={!draft.trim()}
            accessibilityRole="button"
            accessibilityLabel="Envoyer"
          >
            <Icon name="send" size={18} color={colors.white} strokeWidth={1.9} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Bubble({ msg }: { msg: Msg }) {
  const mine = msg.from === 'me';
  return (
    <View style={[styles.bubbleRow, mine && { justifyContent: 'flex-end' }]}>
      <View style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
        <Text style={[styles.bubbleTxt, mine && { color: colors.white }]}>{msg.text}</Text>
        <Text style={[styles.at, mine && { color: 'rgba(255,255,255,0.75)' }]}>{msg.at}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  head: {
    flexDirection: 'row', alignItems: 'center', gap: space.sm,
    paddingHorizontal: space.md, paddingVertical: space.sm,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.borderLight,
  },
  back: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: space.sm },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.bgAlt },
  name: { fontSize: 15.5, fontWeight: '700', color: colors.text },
  status: { fontSize: 12, color: colors.textMuted },

  list: { padding: space.lg, gap: space.sm },
  intro: {
    flexDirection: 'row', alignItems: 'center', gap: space.sm,
    backgroundColor: colors.bgAlt, borderRadius: radius.md,
    padding: space.md, marginBottom: space.md,
  },
  introTxt: { flex: 1, fontSize: 12.5, color: colors.textMuted, lineHeight: 17 },

  bubbleRow: { flexDirection: 'row' },
  bubble: { maxWidth: '80%', borderRadius: radius.xl, paddingHorizontal: space.md, paddingVertical: 10 },
  theirs: { backgroundColor: colors.bgAlt, borderBottomLeftRadius: radius.sm },
  mine: { backgroundColor: colors.brand, borderBottomRightRadius: radius.sm },
  bubbleTxt: { fontSize: 15, lineHeight: 21, color: colors.text },
  at: { fontSize: 11, color: colors.textLight, marginTop: 4, alignSelf: 'flex-end' },

  composer: {
    flexDirection: 'row', alignItems: 'flex-end', gap: space.sm,
    paddingHorizontal: space.md, paddingVertical: space.sm,
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border,
  },
  input: {
    flex: 1, minHeight: 44, maxHeight: 120,
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl,
    paddingHorizontal: space.md, paddingTop: 11, paddingBottom: 11,
    fontSize: 15, color: colors.text,
  },
  send: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: colors.brand,
    alignItems: 'center', justifyContent: 'center',
  },
  sendOff: { backgroundColor: colors.border },
});
