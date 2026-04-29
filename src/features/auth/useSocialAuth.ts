import { useCallback, useState } from 'react';
import { useOAuth } from '@clerk/clerk-expo';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { useTranslation } from 'react-i18next';
import type { OAuthStrategy } from '@clerk/types';
import { Sentry } from '@/config/sentry';
import { formatClerkError } from '@/utils/errors';

// Ensures web browser auth sessions complete cleanly after redirect.
WebBrowser.maybeCompleteAuthSession();

type SupportedStrategy = Extract<
  OAuthStrategy,
  'oauth_google' | 'oauth_facebook' | 'oauth_apple'
>;

export function useSocialAuth(strategy: SupportedStrategy) {
  const { startOAuthFlow } = useOAuth({ strategy });
  const { t } = useTranslation('errors');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startFlow = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const redirectUrl = Linking.createURL('/oauth-callback');
      const result = await startOAuthFlow({ redirectUrl });
      if (result.createdSessionId && result.setActive) {
        await result.setActive({ session: result.createdSessionId });
        return { ok: true as const };
      }
      // If we reach here the user likely needs extra input (e.g. email capture)
      // or cancelled the flow mid-way.
      return { ok: false as const };
    } catch (err) {
      Sentry.captureException(err);
      setError(formatClerkError(err, t));
      return { ok: false as const };
    } finally {
      setLoading(false);
    }
  }, [startOAuthFlow, t]);

  return { startFlow, loading, error };
}
