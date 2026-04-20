import { Link, useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/Button';
import { LanguagePicker } from '@/components/LanguagePicker';
import { ScreenContainer } from '@/components/ScreenContainer';
import { colors, spacing, typography } from '@/theme';

export default function Welcome() {
  const { t } = useTranslation(['auth', 'common']);
  const router = useRouter();

  return (
    <ScreenContainer scrollable={false}>
      <View style={styles.topRow}>
        <LanguagePicker testID="lang-picker-welcome" />
      </View>

      <View style={styles.hero}>
        <View style={styles.logoDot} />
        <Text style={[typography.displayLg, styles.title]} testID="welcome-title">
          {t('auth:welcome_title')}
        </Text>
        <Text style={[typography.body, styles.subtitle]}>{t('auth:welcome_subtitle')}</Text>
      </View>

      <View style={styles.actions}>
        <Button
          label={t('auth:welcome_get_started')}
          onPress={() => router.push('/(auth)/sign-up')}
          testID="cta-get-started"
        />
        <Link href="/(auth)/sign-in" asChild>
          <Button
            variant="ghost"
            label={t('auth:welcome_have_account')}
            onPress={() => router.push('/(auth)/sign-in')}
            testID="cta-have-account"
          />
        </Link>
      </View>

      <Text style={[typography.caption, styles.legal]}>
        {t('auth:terms_prefix')} <Text style={styles.legalLink}>{t('auth:terms')}</Text>{' '}
        {t('auth:and')} <Text style={styles.legalLink}>{t('auth:privacy')}</Text>.
      </Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row', justifyContent: 'flex-end' },
  hero: { flex: 1, justifyContent: 'center', gap: spacing.md },
  logoDot: {
    height: 56,
    width: 56,
    borderRadius: 16,
    backgroundColor: colors.primary,
    marginBottom: spacing.lg,
  },
  title: { color: colors.text },
  subtitle: { color: colors.textMuted },
  actions: { gap: spacing.sm, marginTop: spacing.xl },
  legal: { color: colors.textSubtle, textAlign: 'center', marginTop: spacing.lg },
  legalLink: { color: colors.textMuted, textDecorationLine: 'underline' },
});
