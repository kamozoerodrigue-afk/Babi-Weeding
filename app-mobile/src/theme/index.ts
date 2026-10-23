/**
 * Babi Wedding — thème de l'application mobile
 *
 * Structure et rythme visuel repris de l'application Airbnb :
 * fond blanc, cartes à grande image arrondie, typographie compacte,
 * barre d'onglets basse à filet fin, aucune ombre décorative.
 *
 * Couleurs reprises du site vitrine babiwedding.ci (corail #E64A5D).
 */
import { Platform } from 'react-native';

export const colors = {
  /* marque */
  brand: '#E64A5D',
  brandDark: '#C93A4C',
  brandLight: '#F76C6F',
  brandPale: '#FDEEF0',
  gold: '#C9A84C',
  goldPale: '#FBF4E2',
  star: '#222222',

  /* neutres */
  text: '#222222',
  textMuted: '#6C6C6C',
  textLight: '#8E8E8E',
  border: '#DDDDDD',
  borderLight: '#EBEBEB',
  bg: '#FFFFFF',
  bgAlt: '#F7F7F7',
  overlay: 'rgba(0,0,0,0.45)',
  white: '#FFFFFF',
  black: '#222222',
  success: '#2E7D5B',
  successPale: '#E7F3EE',
};

export const radius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  pill: 999,
};

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

/**
 * Airbnb utilise Cereal, une géométrique propriétaire.
 * On s'appuie sur la police système : San Francisco sur iOS,
 * Roboto sur Android — le rendu reste proche et évite un
 * téléchargement de fonte au démarrage.
 */
export const font = {
  regular: Platform.select({ ios: 'System', default: 'sans-serif' }) as string,
  medium: Platform.select({ ios: 'System', default: 'sans-serif-medium' }) as string,
};

export const type = {
  h1: { fontSize: 26, fontWeight: '700' as const, lineHeight: 32, color: colors.text },
  h2: { fontSize: 22, fontWeight: '700' as const, lineHeight: 28, color: colors.text },
  h3: { fontSize: 17, fontWeight: '600' as const, lineHeight: 23, color: colors.text },
  body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22, color: colors.text },
  muted: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20, color: colors.textMuted },
  small: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18, color: colors.textMuted },
  tiny: { fontSize: 11, fontWeight: '500' as const, lineHeight: 14, color: colors.textMuted },
  price: { fontSize: 15, fontWeight: '700' as const, color: colors.text },
};

/** Ombre discrète, uniquement pour les éléments flottants (pilule de recherche, barre d'action). */
export const shadow = {
  soft: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOpacity: 0.12,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
    },
    android: { elevation: 3 },
    default: {},
  }) as object,
};

export const layout = {
  gutter: 20,
  tabBarHeight: 56,
};
