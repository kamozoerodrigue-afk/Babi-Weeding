import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StoreProvider } from '@/store/useFavorites';
import { SessionProvider } from '@/store/useSession';
import { hydrater } from '@/data/catalogue';
import { colors } from '@/theme';

export default function RootLayout() {
  /* Le catalogue est chargé avant le premier écran : les écrans lisent
     ensuite des données déjà présentes, sans état de chargement à gérer. */
  const [pret, setPret] = useState(false);

  useEffect(() => {
    hydrater().finally(() => setPret(true));
  }, []);

  if (!pret) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator size="large" color={colors.brand} />
        <Text style={{ marginTop: 14, color: colors.textMuted }}>Chargement du catalogue…</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SessionProvider>
        <StoreProvider>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.bg },
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="prestataire/[id]" />
            <Stack.Screen name="recherche" options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="devis/[id]" options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="messages/[id]" />
            <Stack.Screen name="connexion" options={{ animation: 'slide_from_bottom' }} />
          </Stack>
        </StoreProvider>
        </SessionProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
