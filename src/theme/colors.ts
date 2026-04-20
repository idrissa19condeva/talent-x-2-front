export const colors = {
  // Brand
  primary: '#4F46E5',
  primaryDark: '#4338CA',
  primarySoft: '#EEF2FF',
  accent: '#F59E0B',

  // Surfaces
  background: '#FFFFFF',
  surface: '#FAFAFB',
  surfaceAlt: '#F3F4F7',
  overlay: 'rgba(11, 11, 16, 0.48)',

  // Text
  text: '#0B0B10',
  textMuted: '#5B5F6A',
  textSubtle: '#9AA0AE',
  textInverse: '#FFFFFF',

  // Lines
  border: '#E5E7EB',
  borderStrong: '#D1D5DB',

  // State
  danger: '#DC2626',
  warning: '#D97706',
  success: '#16A34A',
} as const;

export type ColorToken = keyof typeof colors;
