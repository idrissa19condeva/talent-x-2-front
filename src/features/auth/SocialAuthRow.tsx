import { Platform, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SocialButton } from '@/components/SocialButton';
import { useSocialAuth } from './useSocialAuth';
import { useAppleAvailable } from './useAppleAuth';
import { spacing } from '@/theme';

interface Props {
  testIDPrefix?: string;
}

export function SocialAuthRow({ testIDPrefix = 'social' }: Props) {
  const { t } = useTranslation('auth');
  const google = useSocialAuth('oauth_google');
  const facebook = useSocialAuth('oauth_facebook');
  const apple = useSocialAuth('oauth_apple');
  const appleAvailable = useAppleAvailable();

  return (
    <View style={styles.stack}>
      <SocialButton
        provider="google"
        label={t('continue_with_google')}
        onPress={google.startFlow}
        loading={google.loading}
        testID={`${testIDPrefix}-google`}
      />
      <SocialButton
        provider="facebook"
        label={t('continue_with_facebook')}
        onPress={facebook.startFlow}
        loading={facebook.loading}
        testID={`${testIDPrefix}-facebook`}
      />
      {Platform.OS === 'ios' && appleAvailable ? (
        <SocialButton
          provider="apple"
          label={t('continue_with_apple')}
          onPress={apple.startFlow}
          loading={apple.loading}
          testID={`${testIDPrefix}-apple`}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: spacing.sm },
});
