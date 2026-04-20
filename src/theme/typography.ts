import { Platform, TextStyle } from 'react-native';

const systemFont = Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' });

export const typography: Record<string, TextStyle> = {
  displayLg: {
    fontFamily: systemFont,
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -0.6,
    lineHeight: 40,
  },
  display: {
    fontFamily: systemFont,
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.4,
    lineHeight: 34,
  },
  h1: { fontFamily: systemFont, fontSize: 22, fontWeight: '700', lineHeight: 28 },
  h2: { fontFamily: systemFont, fontSize: 18, fontWeight: '600', lineHeight: 24 },
  body: { fontFamily: systemFont, fontSize: 16, fontWeight: '400', lineHeight: 22 },
  bodyStrong: { fontFamily: systemFont, fontSize: 16, fontWeight: '600', lineHeight: 22 },
  caption: { fontFamily: systemFont, fontSize: 13, fontWeight: '400', lineHeight: 18 },
  label: {
    fontFamily: systemFont,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    letterSpacing: 0.2,
  },
};
