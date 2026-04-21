import { ExpoConfig, ConfigContext } from 'expo/config';

const BUNDLE_ID = 'com.talentx.app';
const SCHEME = 'talentx';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'TalentX',
  slug: 'talentx',
  scheme: SCHEME,
  version: '0.1.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#0B0B10',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: BUNDLE_ID,
    usesAppleSignIn: true,
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#0B0B10',
    },
    package: BUNDLE_ID,
  },
  web: {
    bundler: 'metro',
    favicon: './assets/icon.png',
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    'expo-localization',
    'expo-apple-authentication',
    // To enable Sentry source map uploads, add the plugin once you have
    // SENTRY_ORG + SENTRY_PROJECT:
    //   ['@sentry/react-native/expo', { organization: 'YOUR_ORG', project: 'YOUR_PROJECT' }]
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    clerkPublishableKey: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
    apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
    sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
    env: process.env.EXPO_PUBLIC_ENV ?? 'development',
  },
});
