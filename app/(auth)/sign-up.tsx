import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, Redirect, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useAuth, useClerk, useSignUp } from '@clerk/clerk-expo';
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
  firstName: string;
  email: string;
  password: string;
}

export default function SignUp() {
  const { t } = useTranslation(['auth', 'errors']);
  const { signUp, isLoaded } = useSignUp();
  const { isSignedIn } = useAuth();
  const clerk = useClerk();
  const router = useRouter();
  const schemas = buildAuthSchemas(t);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schemas.signUp),
    mode: 'onTouched',
    defaultValues: { firstName: '', email: '', password: '' },
  });

  if (isSignedIn) return <Redirect href="/" />;

  async function onSubmit(values: FormValues) {
    if (!isLoaded || !signUp) return;
    Sentry.addBreadcrumb({ category: 'auth', message: 'signup.start', level: 'info' });
    try {
      await signUp.create({
        emailAddress: values.email,
        password: values.password,
        firstName: values.firstName,
      });
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      Sentry.addBreadcrumb({ category: 'auth', message: 'signup.code_sent', level: 'info' });
      router.replace('/(auth)/verify-email');
    } catch (err) {
      if (isSessionExistsError(err)) {
        await clerk.signOut().catch(() => undefined);
        try {
          await signUp.create({
            emailAddress: values.email,
            password: values.password,
            firstName: values.firstName,
          });
          await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
          router.replace('/(auth)/verify-email');
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
          <Pressable accessibilityRole="button" hitSlop={8} testID="sign-up-back">
            <ChevronLeft color={colors.text} size={24} />
          </Pressable>
        </Link>
      </View>

      <AuthCard testID="sign-up-card">
        <Text style={[typography.display, styles.title]}>{t('auth:sign_up_title')}</Text>
        <Text style={[typography.body, styles.subtitle]}>{t('auth:sign_up_subtitle')}</Text>

        <Controller
          control={control}
          name="firstName"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextField
              label={t('auth:first_name')}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.firstName?.message}
              autoComplete="given-name"
              textContentType="givenName"
              autoCapitalize="words"
              testID="sign-up-first-name"
            />
          )}
        />

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
              testID="sign-up-email"
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
              helperText={!errors.password ? t('auth:password_hint') : undefined}
              secure
              autoComplete="password-new"
              textContentType="newPassword"
              testID="sign-up-password"
            />
          )}
        />

        {errors.root?.message ? (
          <Text style={styles.formError} testID="sign-up-form-error">
            {errors.root.message}
          </Text>
        ) : null}

        <Button
          label={t('auth:sign_up_cta')}
          onPress={handleSubmit(onSubmit)}
          loading={isSubmitting}
          testID="sign-up-submit"
        />

        <Divider label={t('auth:auth_separator')} />
        <SocialAuthRow testIDPrefix="sign-up-social" />
      </AuthCard>

      <View style={styles.footer}>
        <Text style={[typography.body, styles.footerText]}>{t('auth:have_account')} </Text>
        <Link href="/(auth)/sign-in" asChild>
          <Pressable accessibilityRole="button" testID="sign-up-go-sign-in">
            <Text style={[typography.bodyStrong, styles.footerLink]}>{t('auth:sign_in_cta')}</Text>
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
  formError: { color: colors.danger, ...typography.caption },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl },
  footerText: { color: colors.textMuted },
  footerLink: { color: colors.primary },
  trust: { alignItems: 'center', marginTop: spacing.lg },
});
