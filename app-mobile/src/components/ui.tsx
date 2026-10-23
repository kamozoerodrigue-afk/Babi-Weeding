/**
 * Petits composants partagés : bouton, puce, séparateur, en-tête d'écran,
 * ligne d'information et état vide.
 */
import React from 'react';
import { View, Text, Pressable, StyleSheet, type ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import Icon, { type IconName } from './Icon';
import { colors, radius, space, type } from '@/theme';

/* ---------- Bouton ---------- */
export function Button({
  label, onPress, variant = 'primary', icon, style, disabled,
}: {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'outline' | 'dark';
  icon?: IconName;
  style?: ViewStyle;
  disabled?: boolean;
}) {
  const bg =
    variant === 'primary' ? colors.brand : variant === 'dark' ? colors.text : colors.white;
  const fg = variant === 'outline' ? colors.text : colors.white;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: bg, opacity: disabled ? 0.5 : pressed ? 0.86 : 1 },
        variant === 'outline' && { borderWidth: 1, borderColor: colors.text },
        style,
      ]}
    >
      {icon && <Icon name={icon} size={18} color={fg} strokeWidth={2} />}
      <Text style={[styles.btnTxt, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

/* ---------- Puce sélectionnable ---------- */
export function Chip({
  label, on, onPress,
}: { label: string; on?: boolean; onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!on }}
      style={[styles.chip, on && styles.chipOn]}
    >
      <Text style={[styles.chipTxt, on && styles.chipTxtOn]}>{label}</Text>
    </Pressable>
  );
}

/* ---------- Séparateur ---------- */
export function Divider({ style }: { style?: ViewStyle }) {
  return <View style={[styles.divider, style]} />;
}

/* ---------- En-tête d'écran secondaire ---------- */
export function ScreenHeader({
  title, right, onBack,
}: { title?: string; right?: React.ReactNode; onBack?: () => void }) {
  const router = useRouter();
  return (
    <View style={styles.header}>
      <Pressable
        onPress={onBack ?? (() => router.back())}
        hitSlop={12}
        style={styles.headerBtn}
        accessibilityRole="button"
        accessibilityLabel="Retour"
      >
        <Icon name="back" size={20} color={colors.text} strokeWidth={2.2} />
      </Pressable>
      {title ? <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text> : <View style={{ flex: 1 }} />}
      {right ?? <View style={styles.headerBtn} />}
    </View>
  );
}

/* ---------- Ligne icône + texte ---------- */
export function InfoRow({
  icon, title, subtitle,
}: { icon: IconName; title: string; subtitle?: string }) {
  return (
    <View style={styles.infoRow}>
      <Icon name={icon} size={22} color={colors.text} strokeWidth={1.7} />
      <View style={{ flex: 1 }}>
        <Text style={styles.infoTitle}>{title}</Text>
        {subtitle ? <Text style={styles.infoSub}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

/* ---------- État vide ---------- */
export function EmptyState({
  icon, title, text, action,
}: { icon: IconName; title: string; text: string; action?: React.ReactNode }) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Icon name={icon} size={30} color={colors.brand} strokeWidth={1.5} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyTxt}>{text}</Text>
      {action}
    </View>
  );
}

/* ---------- Titre de section ---------- */
export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <Text style={styles.section}>{children}</Text>;
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    minHeight: 50, paddingHorizontal: space.xl, borderRadius: radius.md,
  },
  btnTxt: { fontSize: 16, fontWeight: '700' },

  chip: {
    paddingHorizontal: space.lg, paddingVertical: 9,
    borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.white,
  },
  chipOn: { backgroundColor: colors.text, borderColor: colors.text },
  chipTxt: { fontSize: 14, color: colors.text, fontWeight: '500' },
  chipTxtOn: { color: colors.white, fontWeight: '600' },

  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: space.lg,
  },

  header: {
    flexDirection: 'row', alignItems: 'center', gap: space.md,
    paddingHorizontal: space.lg, paddingVertical: space.md,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.borderLight,
    backgroundColor: colors.bg,
  },
  headerBtn: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontSize: 16, fontWeight: '700', color: colors.text, textAlign: 'center' },

  infoRow: { flexDirection: 'row', gap: space.lg, alignItems: 'flex-start', paddingVertical: space.md },
  infoTitle: { fontSize: 15, fontWeight: '600', color: colors.text },
  infoSub: { ...type.small, marginTop: 2 },

  empty: { alignItems: 'center', paddingHorizontal: space.xl, paddingTop: 60, gap: space.md },
  emptyIcon: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: colors.brandPale,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  emptyTitle: { ...type.h3, textAlign: 'center' },
  emptyTxt: { ...type.muted, textAlign: 'center', maxWidth: 300 },

  section: { ...type.h2, fontSize: 20, marginBottom: space.md },
});
