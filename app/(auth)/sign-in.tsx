import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, Redirect } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useAuth, useClerk, useSignIn } from '@clerk/clerk-expo';
import { useTranslation } from 'react-i18next';
import { ScreenContainer } from '@/components/ScreenContainer';
import { AuthCard } from '@/components/AuthCard';
import { TextField } from '@/components/TextField';
import { Button } from '@/components/Button';
import { Divider } from '@/components/Divider';
import { TrustBadge } from '@/components/TrustBadge';
import { SocialAuthRow } from '@/features/auth/SocialAuthRow';
import { buildAuthSchemas } from '@/features/auth/validators';
import { formatClerkError, isSessionExistsError } from '@/utils/errors';
import { Sentry } from '@/config/sentry';
import { colors, spacing, typography } from '@/theme';

interface FormValues {
  email: string;
  password: string;
}

export default function SignIn() {
  const { t } = useTranslation(['auth', 'errors']);
  const { signIn, setActive, isLoaded } = useSignIn();
  const { isSignedIn } = useAuth();
  const clerk = useClerk();
  const schemas = buildAuthSchemas(t);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schemas.signIn),
    mode: 'onTouched',
    defaultValues: { email: '', password: '' },
  });

  if (isSignedIn) return <Redirect href="/" />;

  async function attemptSignIn(values: FormValues) {
    const attempt = await signIn!.create({
      identifier: values.email,
      password: values.password,
    });
    if (attempt.status === 'complete') {
      await setActive!({ session: attempt.createdSessionId });
    } else {
      setError('root', { message: t('errors:generic') });
    }
  }

  async function onSubmit(values: FormValues) {
    if (!isLoaded) return;
    Sentry.addBreadcrumb({ category: 'auth', message: 'signin.start', level: 'info' });
    try {
      await attemptSignIn(values);
    } catch (err) {
      if (isSessionExistsError(err)) {
        try {
          await clerk.signOut();
          await attemptSignIn(values);
          return;
        } catch (retryErr) {
          Sentry.captureException(retryErr);
          setError('root', { message: formatClerkError(retryErr, t) });
          return;
        }
      }
      Sentry.captureException(err);
      setError('root', { message: formatClerkError(err, t) });
    }
  }

  return (
    <ScreenContainer>
      <View style={styles.headerRow}>
        <Link href="/(auth)/welcome" asChild>
          <Pressable accessibilityRole="button" hitSlop={8} testID="sign-in-back">
            <ChevronLeft color={colors.text} size={24} />
          </Pressable>
        </Link>
      </View>

      <AuthCard testID="sign-in-card">
        <Text style={[typography.display, styles.title]}>{t('auth:sign_in_title')}</Text>
        <Text style={[typography.body, styles.subtitle]}>{t('auth:sign_in_subtitle')}</Text>

        <Controller
          control={control}
          name="email"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextField
              label={t('auth:email')}
              placeholder={t('auth:email_placeholder')}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.email?.message}
              keyboardType="email-address"
              textContentType="emailAddress"
              autoComplete="email"
              testID="sign-in-email"
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextField
              label={t('auth:password')}
              placeholder={t('auth:password_placeholder')}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.password?.message}
              secure
              autoComplete="password"
              textContentType="password"
              testID="sign-in-password"
            />
          )}
        />

        <Link href="/(auth)/forgot-password" asChild>
          <Pressable style={styles.forgot} accessibilityRole="button" hitSlop={6}>
            <Text style={[typography.caption, styles.forgotText]}>{t('auth:forgot_password')}</Text>
          </Pressable>
        </Link>

        {errors.root?.message ? (
          <Text style={styles.formError} testID="sign-in-form-error">
            {errors.root.message}
          </Text>
        ) : null}

        <Button
          label={t('auth:sign_in_cta')}
          onPress={handleSubmit(onSubmit)}
          loading={isSubmitting}
          testID="sign-in-submit"
        />

        <Divider label={t('auth:auth_separator')} />
        <SocialAuthRow testIDPrefix="sign-in-social" />
      </AuthCard>

      <View style={styles.footer}>
        <Text style={[typography.body, styles.footerText]}>{t('auth:no_account')} </Text>
        <Link href="/(auth)/sign-up" asChild>
          <Pressable accessibilityRole="button" testID="sign-in-go-sign-up">
            <Text style={[typography.bodyStrong, styles.footerLink]}>{t('auth:sign_up_cta')}</Text>
          </Pressable>
        </Link>
      </View>

      <View style={styles.trust}>
        <TrustBadge label={t('auth:welcome_trust')} tone="muted" />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerRow: { paddingBottom: spacing.sm },
  title: { color: colors.text },
  subtitle: { color: colors.textMuted, marginBottom: spacing.sm },
  forgot: { alignSelf: 'flex-end', paddingVertical: spacing.xs },
  forgotText: { color: colors.primary },
  formError: { color: colors.danger, ...typography.caption },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl },
  footerText: { color: colors.textMuted },
  footerLink: { color: colors.primary },
  trust: { alignItems: 'center', marginTop: spacing.lg },
});
