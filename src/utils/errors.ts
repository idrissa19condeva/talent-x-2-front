import type { TFunction } from 'i18next';

interface ClerkLikeError {
  errors?: { code?: string; message?: string; longMessage?: string }[];
  message?: string;
}

/** Convert a Clerk SDK error into a localized, user-safe string. */
export function formatClerkError(err: unknown, t: TFunction<'errors'>): string {
  const e = err as ClerkLikeError;
  const first = e?.errors?.[0];
  if (first?.code === 'form_identifier_not_found' || first?.code === 'form_password_incorrect') {
    return t('invalid_credentials');
  }
  if (first?.code === 'form_identifier_exists') {
    return t('account_exists');
  }
  if (first?.longMessage || first?.message) {
    return (first.longMessage ?? first.message) as string;
  }
  if (e?.message) return e.message;
  return t('generic');
}

/** True when Clerk refuses a sign-in/up because a session is already active. */
export function isSessionExistsError(err: unknown): boolean {
  const e = err as ClerkLikeError;
  const first = e?.errors?.[0];
  if (first?.code === 'session_exists') return true;
  const msg = (first?.longMessage ?? first?.message ?? e?.message ?? '').toLowerCase();
  return msg.includes("you're already signed in") || msg.includes('already signed in');
}
