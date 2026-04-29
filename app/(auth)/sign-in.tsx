import { useState } from 'react';
import { Link, Redirect } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth, useClerk, useSignIn } from '@clerk/clerk-expo';
import { useTranslation } from 'react-i18next';
import { ScreenContainer } from '@/components/ScreenContainer';
import { AuthHeader } from '@/components/AuthHeader';
import { TextField } from '@/components/TextField';
import { Button } from '@/components/Button';
import { Divider } from '@/components/Divider';
import { SocialAuthRow } from '@/features/auth/SocialAuthRow';
import { buildAuthSchemas } from '@/features/auth/validators';
import { formatClerkError, isSessionExistsError } from '@/utils/errors';
import { colors, spacing, typography } from '@/theme';

export default function SignIn() {
  const { t } = useTranslation(['auth', 'common', 'errors']);
  const { signIn, setActive, isLoaded } = useSignIn();
  const { isSignedIn } = useAuth();
  const clerk = useClerk();
  const schemas = buildAuthSchemas(t);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>();
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (isSignedIn) return <Redirect href="/" />;

  async function onSubmit() {
    if (!isLoaded) return;
    const parsed = schemas.signIn.safeParse({ email, password });
    setEmailError(undefined);
    setPasswordError(undefined);
    setFormError(null);

    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors;
      setEmailError(flat.email?.[0]);
      setPasswordError(flat.password?.[0]);
      return;
    }

    setLoading(true);
    try {
      await attemptSignIn(parsed.data.email, parsed.data.password);
    } catch (err) {
      if (isSessionExistsError(err)) {
        try {
          await clerk.signOut();
          await attemptSignIn(parsed.data.email, parsed.data.password);
        } catch (retryErr) {
          setFormError(formatClerkError(retryErr, t));
        }
        return;
      }
      setFormError(formatClerkError(err, t));
    } finally {
      setLoading(false);
    }
  }

  async function attemptSignIn(identifier: string, password: string) {
    const attempt = await signIn!.create({ identifier, password });
    if (attempt.status === 'complete') {
      await setActive!({ session: attempt.createdSessionId });
    } else {
      setFormError(t('errors:generic'));
    }
  }

  return (
    <ScreenContainer>
      <AuthHeader title={t('auth:sign_in_title')} subtitle={t('auth:sign_in_subtitle')} />

      <View style={styles.form}>
        <TextField
          label={t('auth:email')}
          placeholder={t('auth:email_placeholder')}
          keyboardType="email-address"
          textContentType="emailAddress"
          autoComplete="email"
          value={email}
          onChangeText={setEmail}
          error={emailError}
          testID="sign-in-email"
        />
        <TextField
          label={t('auth:password')}
          placeholder={t('auth:password_placeholder')}
          secure
          textContentType="password"
          autoComplete="password"
          value={password}
          onChangeText={setPassword}
          error={passwordError}
          testID="sign-in-password"
        />

        <Link href="/(auth)/forgot-password" asChild>
          <Pressable style={styles.forgot} accessibilityRole="button">
            <Text style={[typography.caption, styles.forgotText]}>
              {t('auth:forgot_password')}
            </Text>
          </Pressable>
        </Link>

        {formError ? (
          <Text style={styles.formError} testID="sign-in-form-error">
            {formError}
          </Text>
        ) : null}

        <Button
          label={t('auth:sign_in_cta')}
          onPress={onSubmit}
          loading={loading}
          testID="sign-in-submit"
        />
      </View>

      <Divider label={t('auth:auth_separator')} />
      <SocialAuthRow testIDPrefix="sign-in-social" />

      <View style={styles.footer}>
        <Text style={[typography.body, styles.footerText]}>{t('auth:no_account')} </Text>
        <Link href="/(auth)/sign-up" asChild>
          <Pressable accessibilityRole="button" testID="sign-in-go-sign-up">
            <Text style={[typography.bodyStrong, styles.footerLink]}>{t('auth:sign_up_cta')}</Text>
          </Pressable>
        </Link>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.md },
  forgot: { alignSelf: 'flex-end', paddingVertical: spacing.xs },
  forgotText: { color: colors.primary },
  formError: { color: colors.danger, ...typography.caption },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  footerText: { color: colors.textMuted },
  footerLink: { color: colors.primary },
});
