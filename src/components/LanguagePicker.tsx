import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, radius, spacing, typography } from '@/theme';
import { SUPPORTED_LANGUAGES, SupportedLanguage, setLanguage } from '@/i18n';

interface Props {
  testID?: string;
  /** "light" → muted on light background. "dark" → glass-on-gradient. */
  tone?: 'light' | 'dark';
}

export function LanguagePicker({ testID, tone = 'light' }: Props) {
  const { t, i18n } = useTranslation('common');
  const current = i18n.language as SupportedLanguage;
  const palette = tone === 'dark' ? darkPalette : lightPalette;

  return (
    <View testID={testID} style={styles.wrap} accessibilityLabel={t('language')}>
      {SUPPORTED_LANGUAGES.map((lng) => {
        const active = current.startsWith(lng);
        return (
          <Pressable
            key={lng}
            onPress={() => setLanguage(lng)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            testID={`lang-${lng}`}
            style={[styles.chip, palette.chip, active && palette.chipActive]}
          >
            <Text
              style={[
                typography.label,
                active ? palette.textActive : palette.text,
              ]}
            >
              {t(lng === 'en' ? 'english' : 'french')}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', gap: spacing.xs },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
});

const lightPalette = {
  chip: { borderColor: colors.border, backgroundColor: colors.background },
  chipActive: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  text: { color: colors.textMuted },
  textActive: { color: colors.primary },
};

const darkPalette = {
  chip: { borderColor: 'rgba(255,255,255,0.18)', backgroundColor: 'rgba(255,255,255,0.08)' },
  chipActive: { backgroundColor: 'rgba(255,255,255,0.18)', borderColor: 'rgba(255,255,255,0.6)' },
  text: { color: 'rgba(255,255,255,0.7)' },
  textActive: { color: '#FFFFFF', fontWeight: '700' as const },
};
