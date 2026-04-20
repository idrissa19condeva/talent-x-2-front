import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { useTranslation } from 'react-i18next';
import { apiCall, ApiError } from '@/services/api';
import { Sentry } from '@/config/sentry';

export interface MeUser {
  id: string;
  clerkUserId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
  createdAt: string;
  lastSeenAt: string | null;
}

export interface MeResponse {
  user: MeUser;
  profile: { id: string; headline: string | null; bio: string | null } | null;
}

/**
 * Loads the authenticated user's mirror row from our backend. Surfaces a 404
 * (webhook hasn't run yet) as a retryable state rather than a fatal error.
 */
export function useMe() {
  const { getToken, isSignedIn } = useAuth();
  const { i18n } = useTranslation();
  const [data, setData] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!isSignedIn) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiCall<MeResponse>({
        path: '/users/me',
        getToken,
        language: i18n.language,
      });
      setData(res);
    } catch (err) {
      if (!(err instanceof ApiError && err.status === 404)) {
        Sentry.captureException(err);
      }
      setError(err instanceof Error ? err.message : 'failed');
    } finally {
      setLoading(false);
    }
  }, [getToken, i18n.language, isSignedIn]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, reload: load };
}
