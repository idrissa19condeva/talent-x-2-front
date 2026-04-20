import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSignIn } from '@clerk/clerk-expo';
import { useTranslation } from 'react-i18next';
import { ScreenContainer } from '@/components/ScreenContainer';
import { AuthHeader } from '@/components/AuthHeader';
import { TextField } from '@/components/TextField';
import { Button } from '@/components/Button';
import { buildAuthSchemas } from '@/features/auth/validators';
import { formatClerkError } from '@/utils/errors';
import { colors, spacing, typography } from '@/theme';

export default function ForgotPassword() {
  const { t } = useTranslation(['auth', 'errors']);
  const { signIn, isLoaded } = useSignIn();
  const router = useRouter();
  const schemas = buildAuthSchemas(t);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function onSubmit() {
    if (!isLoaded) return;
    const parsed = schemas.forgot.safeParse({ email });
    setEmailError(undefined);
    setFormError(null);
    if (!parsed.success) {
      setEmailError(parsed.error.flatten().fieldErrors.email?.[0]);
      return;
    }
    setLoading(true);
    try {
      await signIn.create({ strategy: 'reset_password_email_code', identifier: parsed.data.email });
      setSent(true);
    } catch (err) {
      setFormError(formatClerkError(err, t));
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer>
      <AuthHeader title={t('auth:forgot_password_title')} />
      <View style={styles.form}>
        <TextField
          label={t('auth:email')}
          keyboardType="email-address"
          textContentType="emailAddress"
          autoComplete="email"
          value={email}
          onChangeText={setEmail}
          error={emailError}
          testID="forgot-email"
        />
        {sent ? (
          <Text style={styles.info} testID="forgot-sent">
            {t('auth:forgot_password_sent')}
          </Text>
        ) : null}
        {formError ? <Text style={styles.error}>{formError}</Text> : null}
        <Button
          label={t('auth:continue', { defaultValue: 'Continue' })}
          onPress={onSubmit}
          loading={loading}
          testID="forgot-submit"
        />
        <Pressable onPress={() => router.back()} accessibilityRole="button" style={styles.back}>
          <Text style={[typography.caption, { color: colors.primary }]}>← {t('auth:back', { defaultValue: 'Back' })}</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.md },
  info: { color: colors.success },
  error: { color: colors.danger },
  back: { alignSelf: 'flex-start', paddingVertical: spacing.sm },
});
