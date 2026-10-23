import React from 'react';
import { View, Text, FlatList, Image, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { EmptyState, Button } from '@/components/ui';
import { colors, radius, space, type } from '@/theme';
import { CONVERSATIONS, findVendor, type Conversation } from '@/data/catalogue';

export default function Messages() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.head}>
        <Text style={styles.title}>Messages</Text>
        <Text style={styles.sub}>Vos échanges passent par la messagerie sécurisée</Text>
      </View>

      <FlatList
        data={CONVERSATIONS}
        keyExtractor={(c) => c.id}
        renderItem={({ item }) => (
          <Row conversation={item} onPress={() => router.push(`/messages/${item.id}`)} />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="message"
            title="Pas encore de conversation"
            text="Contactez un prestataire depuis sa fiche pour démarrer un échange."
            action={<Button label="Explorer" onPress={() => router.push('/(tabs)')} style={{ marginTop: space.md }} />}
          />
        }
      />
    </SafeAreaView>
  );
}

function Row({ conversation, onPress }: { conversation: Conversation; onPress: () => void }) {
  const vendor = findVendor(conversation.vendorId);
  if (!vendor) return null;
  const last = conversation.messages[conversation.messages.length - 1];

  return (
    <Pressable style={styles.row} onPress={onPress} accessibilityRole="button">
      <Image source={{ uri: vendor.owner.avatar }} style={styles.avatar} />
      <View style={{ flex: 1 }}>
        <View style={styles.rowTop}>
          <Text style={styles.name} numberOfLines={1}>{vendor.name}</Text>
          <Text style={styles.time}>{conversation.lastAt}</Text>
        </View>
        <Text
          style={[styles.preview, conversation.unread > 0 && styles.previewUnread]}
          numberOfLines={2}
        >
          {last.from === 'me' ? 'Vous : ' : ''}{last.text}
        </Text>
        <Text style={styles.cat}>{vendor.categoryLabel} · {vendor.commune}</Text>
      </View>
      {conversation.unread > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeTxt}>{conversation.unread}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  head: { paddingHorizontal: space.lg, paddingTop: space.md, paddingBottom: space.md },
  title: { ...type.h1 },
  sub: { ...type.muted, marginTop: 2 },
  list: { paddingHorizontal: space.lg, paddingBottom: space.xl },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: space.md,
    paddingVertical: space.md,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.borderLight,
  },
  avatar: { width: 54, height: 54, borderRadius: 27, backgroundColor: colors.bgAlt },
  rowTop: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  name: { flex: 1, fontSize: 16, fontWeight: '700', color: colors.text },
  time: { fontSize: 12, color: colors.textLight },
  preview: { ...type.small, marginTop: 2 },
  previewUnread: { color: colors.text, fontWeight: '600' },
  cat: { fontSize: 12, color: colors.textLight, marginTop: 2 },
  badge: {
    minWidth: 22, height: 22, borderRadius: 11, paddingHorizontal: 6,
    backgroundColor: colors.brand, alignItems: 'center', justifyContent: 'center',
  },
  badgeTxt: { color: colors.white, fontSize: 12, fontWeight: '700' },
});
