import Constants from 'expo-constants';

interface Extra {
  clerkPublishableKey?: string;
  apiBaseUrl?: string;
  sentryDsn?: string;
  env?: string;
}

const extra = (Constants.expoConfig?.extra ?? {}) as Extra;

function required(key: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Missing required env var ${key}. Set it in .env (EXPO_PUBLIC_${key.toUpperCase()}).`,
    );
  }
  return value;
}

export const env = {
  clerkPublishableKey: required(
    'clerkPublishableKey',
    extra.clerkPublishableKey ?? process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
  ),
  apiBaseUrl:
    extra.apiBaseUrl ?? process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:4000',
  sentryDsn: extra.sentryDsn ?? process.env.EXPO_PUBLIC_SENTRY_DSN ?? '',
  env: (extra.env ?? process.env.EXPO_PUBLIC_ENV ?? 'development') as
    | 'development'
    | 'staging'
    | 'production',
};
