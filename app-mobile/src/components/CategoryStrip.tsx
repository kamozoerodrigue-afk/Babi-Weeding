/**
 * Bandeau de catégories horizontal, calqué sur celui d'Airbnb :
 * icône en trait au-dessus d'un libellé court, l'onglet actif passe en noir
 * et gagne un soulignement de 2 px.
 */
import React from 'react';
import { ScrollView, Pressable, Text, View, StyleSheet } from 'react-native';
import Icon, { type IconName } from './Icon';
import { colors, space } from '@/theme';
import { CATEGORIES } from '@/data/catalogue';

type Props = {
  active: string | null;
  onChange: (id: string | null) => void;
};

export default function CategoryStrip({ active, onChange }: Props) {
  return (
    <View style={styles.wrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.inner}
      >
        <Item
          label="Tous"
          icon="star"
          on={active === null}
          onPress={() => onChange(null)}
        />
        {CATEGORIES.map((cat) => (
          <Item
            key={cat.id}
            label={cat.label}
            icon={cat.icon}
            on={active === cat.id}
            onPress={() => onChange(cat.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

function Item({
  label, icon, on, onPress,
}: { label: string; icon: IconName; on: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={styles.item}
      accessibilityRole="tab"
      accessibilityState={{ selected: on }}
    >
      <Icon name={icon} size={24} color={on ? colors.text : colors.textLight} strokeWidth={1.6} />
      <Text style={[styles.label, on && styles.labelOn]} numberOfLines={1}>{label}</Text>
      <View style={[styles.underline, on && styles.underlineOn]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.bg,
  },
  inner: { paddingHorizontal: space.lg, gap: space.xl },
  item: { alignItems: 'center', gap: 6, paddingTop: space.md, minWidth: 62 },
  label: { fontSize: 11, fontWeight: '500', color: colors.textLight },
  labelOn: { color: colors.text, fontWeight: '700' },
  underline: { height: 2, width: '100%', backgroundColor: 'transparent', marginTop: 6 },
  underlineOn: { backgroundColor: colors.text },
});
