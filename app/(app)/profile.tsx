import { Alert, StyleSheet, Text, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useTranslation } from 'react-i18next';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Button } from '@/components/Button';
import { LanguagePicker } from '@/components/LanguagePicker';
import { useMe } from '@/hooks/useMe';
import { colors, radius, spacing, typography } from '@/theme';

export default function Profile() {
  const { t } = useTranslation(['profile', 'common']);
  const { signOut } = useAuth();
  const { user } = useUser();
  const { data: me } = useMe();
  const router = useRouter();

  const onSignOut = () => {
    Alert.alert(t('profile:confirm_sign_out'), undefined, [
      { text: t('profile:keep_session'), style: 'cancel' },
      {
        text: t('profile:confirm_sign_out_cta'),
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/welcome');
        },
      },
    ]);
  };

  return (
    <ScreenContainer>
      <Stack.Screen options={{ title: t('profile:profile_title') }} />

      <View style={styles.card}>
        <Text style={[typography.caption, styles.label]}>{t('profile:signed_in_as')}</Text>
        <Text style={[typography.h1, styles.name]} testID="profile-name">
          {user?.firstName ?? user?.username ?? user?.primaryEmailAddress?.emailAddress}
        </Text>
        <Text style={[typography.caption, styles.label]}>{t('profile:email_label')}</Text>
        <Text style={[typography.body, styles.value]} testID="profile-email">
          {user?.primaryEmailAddress?.emailAddress}
        </Text>
        {me?.user?.createdAt ? (
          <>
            <Text style={[typography.caption, styles.label]}>{t('profile:joined_label')}</Text>
            <Text style={[typography.body, styles.value]}>
              {new Date(me.user.createdAt).toLocaleDateString()}
            </Text>
          </>
        ) : null}
      </View>

      <View style={styles.section}>
        <Text style={[typography.label, styles.sectionLabel]}>{t('profile:language_setting')}</Text>
        <LanguagePicker testID="lang-picker-profile" />
      </View>

      <View style={styles.footer}>
        <Button
          variant="secondary"
          label={t('profile:sign_out')}
          onPress={onSignOut}
          testID="sign-out-button"
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: { color: colors.textSubtle, textTransform: 'uppercase', letterSpacing: 0.4 },
  name: { color: colors.text, marginBottom: spacing.sm },
  value: { color: colors.text, marginBottom: spacing.sm },
  section: { marginTop: spacing.xl, gap: spacing.sm },
  sectionLabel: { color: colors.textMuted },
  footer: { marginTop: 'auto' },
});
