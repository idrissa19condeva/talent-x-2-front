import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, radius, spacing, typography } from '@/theme';
import { SUPPORTED_LANGUAGES, SupportedLanguage, setLanguage } from '@/i18n';

export function LanguagePicker({ testID }: { testID?: string }) {
  const { t, i18n } = useTranslation('common');
  const current = i18n.language as SupportedLanguage;

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
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text style={[typography.label, active ? styles.textActive : styles.text]}>
              {t(lng === 'en' ? 'english' : 'french')}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  chipActive: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  text: { color: colors.textMuted },
  textActive: { color: colors.primary },
});
