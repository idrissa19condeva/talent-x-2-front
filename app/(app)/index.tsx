import { StyleSheet, Text, View } from 'react-native';
import { Link, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useUser } from '@clerk/clerk-expo';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Button } from '@/components/Button';
import { colors, spacing, typography } from '@/theme';

export default function Home() {
  const { t } = useTranslation('profile');
  const { user } = useUser();

  return (
    <ScreenContainer>
      <Stack.Screen options={{ title: t('home_title') }} />
      <View style={styles.hero}>
        <Text style={[typography.display, styles.title]}>{t('home_title')}</Text>
        <Text style={[typography.body, styles.subtitle]} testID="home-subtitle">
          {t('home_subtitle')}
        </Text>
        {user?.firstName ? (
          <Text style={[typography.bodyStrong, styles.hi]} testID="home-greeting">
            — {user.firstName}
          </Text>
        ) : null}
      </View>

      <Link href="/(app)/profile" asChild>
        <Button label={t('go_to_profile')} testID="go-to-profile" />
      </Link>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  hero: { flex: 1, justifyContent: 'center', gap: spacing.sm },
  title: { color: colors.text },
  subtitle: { color: colors.textMuted },
  hi: { color: colors.primary, marginTop: spacing.md },
});
