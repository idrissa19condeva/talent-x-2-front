import { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { useAuth, useClerk, useSignUp } from '@clerk/clerk-expo';
import { useTranslation } from 'react-i18next';
import { Mail } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { ScreenContainer } from '@/components/ScreenContainer';
import { AuthCard } from '@/components/AuthCard';
import { Button } from '@/components/Button';
import { OtpField } from '@/components/OtpField';
import { TrustBadge } from '@/components/TrustBadge';
import { buildAuthSchemas } from '@/features/auth/validators';
import { formatClerkError } from '@/utils/errors';
import { Sentry } from '@/config/sentry';
import { colors, radius, spacing, typography } from '@/theme';

const RESEND_COOLDOWN_SECONDS = 30;
const CODE_LEN = 6;

/**
 * Dedicated email verification screen. Reuses the in-flight `signUp` resource
 * from Clerk's React context. We do NOT keep our own copy of the credentials
 * — Clerk holds the sign-up state.
 */
export default function VerifyEmail() {
  const { t } = useTranslation(['auth', 'errors']);
  const { signUp, setActive, isLoaded } = useSignUp();
  const { isSignedIn } = useAuth();
  const clerk = useClerk();
  const router = useRouter();
  const schemas = buildAuthSchemas(t);

  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Clean up the interval on unmount.
  useEffect(() => {
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, []);

  // Already signed in (e.g. social user) — bail to home.
  if (isSignedIn) return <Redirect href="/" />;

  // No in-flight sign-up to verify (deep-link / refresh / no prior sign-up).
  // Send the user to sign-up so they can start a fresh flow.
  if (isLoaded && !signUp?.emailAddress) {
    return <Redirect href="/(auth)/sign-up" />;
  }

  const email = signUp?.emailAddress ?? '';

  function startCooldown() {
    setCooldown(RESEND_COOLDOWN_SECONDS);
    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = setInterval(() => {
      setCooldown((s) => {
        if (s <= 1) {
          if (tickRef.current) clearInterval(tickRef.current);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }

  async function onVerify(rawCode?: string) {
    if (!isLoaded || !signUp) return;
    const candidate = (rawCode ?? code).trim();
    const parsed = schemas.verifyCode.safeParse({ code: candidate });
    if (!parsed.success) {
      setError(parsed.error.flatten().fieldErrors.code?.[0] ?? null);
      return;
    }
    setError(null);
    setInfo(null);
    setSubmitting(true);
    Sentry.addBreadcrumb({ category: 'auth', message: 'verification.attempt', level: 'info' });
    try {
      const attempt = await signUp.attemptEmailAddressVerification({ code: parsed.data.code });
      if (attempt.status === 'complete') {
        Sentry.addBreadcrumb({ category: 'auth', message: 'verification.success', level: 'info' });
        await setActive!({ session: attempt.createdSessionId });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
        // (auth) layout sees isSignedIn=true on next render and redirects to "/".
      } else {
        setError(t('auth:verify_invalid_code'));
      }
    } catch (err) {
      Sentry.addBreadcrumb({ category: 'auth', message: 'verification.failure', level: 'warning' });
      Sentry.captureException(err);
      setError(formatClerkError(err, t));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => undefined);
    } finally {
      setSubmitting(false);
    }
  }

  async function onResend() {
    if (!isLoaded || !signUp || cooldown > 0) return;
    setResending(true);
    setError(null);
    setInfo(null);
    Sentry.addBreadcrumb({ category: 'auth', message: 'verification.resend', level: 'info' });
    try {
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setInfo(t('auth:verify_resent'));
      startCooldown();
    } catch (err) {
      Sentry.captureException(err);
      setError(formatClerkError(err, t));
    } finally {
      setResending(false);
    }
  }

  async function onAbandon() {
    Alert.alert(t('auth:verify_back'), undefined, [
      { text: t('errors:generic'), style: 'cancel' },
      {
        text: t('auth:verify_back'),
        style: 'destructive',
        onPress: async () => {
          await clerk.signOut().catch(() => undefined);
          router.replace('/(auth)/sign-up');
        },
      },
    ]);
  }

  return (
    <ScreenContainer>
      <AuthCard testID="verify-email-card">
        <View style={styles.iconWrap}>
          <Mail color={colors.primary} size={28} />
        </View>

        <Text style={[typography.display, styles.title]}>{t('auth:verify_title')}</Text>
        <Text style={[typography.body, styles.subtitle]}>
          {t('auth:verify_subtitle', { email })}
        </Text>

        <OtpField
          value={code}
          onChange={(v) => {
            setCode(v);
            if (error) setError(null);
          }}
          onComplete={(full) => onVerify(full)}
          error={error ?? undefined}
          autoFocus
          testID="verify-code"
        />

        {info ? (
          <Text style={[typography.caption, styles.info]} testID="verify-info">
            {info}
          </Text>
        ) : null}

        <Button
          label={t('auth:verify_cta')}
          onPress={() => onVerify()}
          loading={submitting}
          disabled={code.length < CODE_LEN}
          testID="verify-submit"
        />

        <View style={styles.resendRow}>
          <Pressable
            onPress={onResend}
            disabled={cooldown > 0 || resending}
            accessibilityRole="button"
            testID="verify-resend"
          >
            <Text style={[typography.bodyStrong, styles.resendText, cooldown > 0 && styles.resendDisabled]}>
              {cooldown > 0
                ? t('auth:verify_resend_cooldown', { seconds: cooldown })
                : t('auth:verify_resend')}
            </Text>
          </Pressable>
        </View>

        <Text style={[typography.caption, styles.help]}>{t('auth:verify_help')}</Text>
      </AuthCard>

      <View style={styles.footer}>
        <Pressable onPress={onAbandon} testID="verify-abandon">
          <Text style={[typography.caption, styles.abandon]}>{t('auth:verify_back')}</Text>
        </Pressable>
        <View style={styles.trustWrap}>
          <TrustBadge label={t('auth:welcome_trust')} tone="muted" />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  title: { color: colors.text },
  subtitle: { color: colors.textMuted, marginBottom: spacing.sm },
  info: { color: colors.success },
  resendRow: { alignItems: 'center', marginTop: spacing.sm },
  resendText: { color: colors.primary },
  resendDisabled: { color: colors.textSubtle },
  help: { color: colors.textSubtle, textAlign: 'center' },
  footer: { alignItems: 'center', marginTop: spacing.xl, gap: spacing.md },
  abandon: { color: colors.textMuted, textDecorationLine: 'underline' },
  trustWrap: { marginTop: spacing.xs },
});
