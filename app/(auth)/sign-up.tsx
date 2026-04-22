import { useState } from 'react';
import { Link, Redirect, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth, useSignUp } from '@clerk/clerk-expo';
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

export default function SignUp() {
  const { t } = useTranslation(['auth', 'common', 'errors']);
  const { signUp, setActive, isLoaded } = useSignUp();
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const schemas = buildAuthSchemas(t);

  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ firstName?: string; email?: string; password?: string }>(
    {},
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState<string | undefined>();

  if (isSignedIn) return <Redirect href="/(app)" />;

  async function onSubmit() {
    if (!isLoaded) return;
    const parsed = schemas.signUp.safeParse({ firstName, email, password });
    setErrors({});
    setFormError(null);
    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors;
      setErrors({
        firstName: flat.firstName?.[0],
        email: flat.email?.[0],
        password: flat.password?.[0],
      });
      return;
    }

    setLoading(true);
    try {
      await signUp.create({
        emailAddress: parsed.data.email,
        password: parsed.data.password,
        firstName: parsed.data.firstName,
      });
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (err) {
      if (isSessionExistsError(err)) {
        router.replace('/(app)');
        return;
      }
      setFormError(formatClerkError(err, t));
    } finally {
      setLoading(false);
    }
  }

  async function onVerify() {
    if (!isLoaded) return;
    const parsed = schemas.verifyCode.safeParse({ code });
    setCodeError(undefined);
    if (!parsed.success) {
      setCodeError(parsed.error.flatten().fieldErrors.code?.[0]);
      return;
    }
    setLoading(true);
    try {
      const attempt = await signUp.attemptEmailAddressVerification({ code: parsed.data.code });
      if (attempt.status === 'complete') {
        await setActive({ session: attempt.createdSessionId });
        router.replace('/(app)');
      } else {
        setFormError(t('errors:generic'));
      }
    } catch (err) {
      setFormError(formatClerkError(err, t));
    } finally {
      setLoading(false);
    }
  }

  if (pendingVerification) {
    return (
      <ScreenContainer>
        <AuthHeader
          title={t('auth:verification_title')}
          subtitle={t('auth:verification_subtitle')}
        />
        <View style={styles.form}>
          <TextField
            label={t('auth:verification_code')}
            keyboardType="number-pad"
            value={code}
            onChangeText={setCode}
            error={codeError}
            testID="sign-up-code"
          />
          {formError ? <Text style={styles.formError}>{formError}</Text> : null}
          <Button
            label={t('auth:verify_cta')}
            onPress={onVerify}
            loading={loading}
            testID="sign-up-verify-submit"
          />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <AuthHeader title={t('auth:sign_up_title')} subtitle={t('auth:sign_up_subtitle')} />

      <View style={styles.form}>
        <TextField
          label={t('auth:first_name')}
          value={firstName}
          onChangeText={setFirstName}
          error={errors.firstName}
          autoComplete="given-name"
          textContentType="givenName"
          testID="sign-up-first-name"
        />
        <TextField
          label={t('auth:email')}
          placeholder={t('auth:email_placeholder')}
          keyboardType="email-address"
          textContentType="emailAddress"
          autoComplete="email"
          value={email}
          onChangeText={setEmail}
          error={errors.email}
          testID="sign-up-email"
        />
        <TextField
          label={t('auth:password')}
          placeholder={t('auth:password_placeholder')}
          secure
          textContentType="newPassword"
          autoComplete="password-new"
          value={password}
          onChangeText={setPassword}
          error={errors.password}
          testID="sign-up-password"
        />

        {formError ? (
          <Text style={styles.formError} testID="sign-up-form-error">
            {formError}
          </Text>
        ) : null}

        <Button
          label={t('auth:sign_up_cta')}
          onPress={onSubmit}
          loading={loading}
          testID="sign-up-submit"
        />
      </View>

      <Divider label={t('auth:auth_separator')} />
      <SocialAuthRow testIDPrefix="sign-up-social" />

      <View style={styles.footer}>
        <Text style={[typography.body, styles.footerText]}>{t('auth:have_account')} </Text>
        <Link href="/(auth)/sign-in" asChild>
          <Pressable accessibilityRole="button" testID="sign-up-go-sign-in">
            <Text style={[typography.bodyStrong, styles.footerLink]}>{t('auth:sign_in_cta')}</Text>
          </Pressable>
        </Link>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.md },
  formError: { color: colors.danger, ...typography.caption },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  footerText: { color: colors.textMuted },
  footerLink: { color: colors.primary },
});
