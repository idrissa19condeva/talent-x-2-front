import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { GradientBackground } from '@/components/GradientBackground';
import { Button } from '@/components/Button';
import { LanguagePicker } from '@/components/LanguagePicker';
import { TrustBadge } from '@/components/TrustBadge';
import { spacing, typography } from '@/theme';

export default function Welcome() {
  const { t } = useTranslation(['auth']);
  const { height } = useWindowDimensions();
  const isCompact = height < 700;

  const fade = useRef(new Animated.Value(0)).current;
  const lift = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 480, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
      Animated.timing(lift, { toValue: 0, duration: 520, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
    ]).start();
  }, [fade, lift]);

  return (
    <GradientBackground>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.topRow}>
          <View style={styles.brandRow}>
            <View style={styles.logoDot} />
            <Text style={styles.eyebrow}>{t('auth:welcome_eyebrow')}</Text>
          </View>
          <LanguagePicker testID="lang-picker-welcome" tone="dark" />
        </View>

        <Animated.View
          style={[styles.hero, { opacity: fade, transform: [{ translateY: lift }] }]}
        >
          <Text style={[styles.title, isCompact && styles.titleCompact]} testID="welcome-title">
            {t('auth:welcome_title')}
          </Text>
          <Text style={styles.subtitle}>{t('auth:welcome_subtitle')}</Text>
        </Animated.View>

        <Animated.View style={[styles.actions, { opacity: fade }]}>
          <Link href="/(auth)/sign-up" asChild>
            <Button
              label={t('auth:welcome_get_started')}
              variant="primaryOnDark"
              testID="cta-get-started"
            />
          </Link>
          <Link href="/(auth)/sign-in" asChild>
            <Button
              label={t('auth:welcome_have_account')}
              variant="ghostOnDark"
              testID="cta-have-account"
            />
          </Link>

          <View style={styles.trust}>
            <TrustBadge label={t('auth:welcome_trust')} tone="light" />
          </View>
        </Animated.View>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, paddingHorizontal: spacing.xl },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  logoDot: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    opacity: 0.95,
  },
  eyebrow: {
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '700',
    letterSpacing: 1.4,
    fontSize: 13,
  },
  hero: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.md,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 44,
    lineHeight: 50,
    fontWeight: '800',
    letterSpacing: -1,
  },
  titleCompact: { fontSize: 36, lineHeight: 42 },
  subtitle: {
    color: 'rgba(255,255,255,0.78)',
    ...typography.body,
    fontSize: 17,
    lineHeight: 24,
    maxWidth: 360,
  },
  actions: { gap: spacing.sm, paddingBottom: spacing.lg },
  trust: { alignItems: 'center', marginTop: spacing.md },
});
