/**
 * Barre d'onglets basse, comme celle d'Airbnb : fond blanc, filet fin en haut,
 * icônes en trait de 24 px surmontant un libellé de 10 px, onglet actif en corail.
 */
import React from 'react';
import { Tabs } from 'expo-router';
import Icon, { type IconName } from '@/components/Icon';
import { colors } from '@/theme';

function tabIcon(name: IconName) {
  return ({ color, focused }: { color: string; focused: boolean }) => (
    <Icon name={name} size={24} color={color} filled={focused && name === 'heart'} strokeWidth={focused ? 2.1 : 1.7} />
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: {
          backgroundColor: colors.bg,
          borderTopColor: colors.borderLight,
          height: 60,
          paddingBottom: 6,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600', marginTop: 2 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Explorer', tabBarIcon: tabIcon('search') }} />
      <Tabs.Screen name="favoris" options={{ title: 'Favoris', tabBarIcon: tabIcon('heart') }} />
      <Tabs.Screen name="devis" options={{ title: 'Mes devis', tabBarIcon: tabIcon('doc') }} />
      <Tabs.Screen name="messages" options={{ title: 'Messages', tabBarIcon: tabIcon('message') }} />
      <Tabs.Screen name="profil" options={{ title: 'Profil', tabBarIcon: tabIcon('user') }} />
    </Tabs>
  );
}
