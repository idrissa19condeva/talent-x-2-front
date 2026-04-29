import 'react-native-gesture-handler';
import { useEffect, useState } from 'react';
import { ClerkProvider, ClerkLoaded } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { env } from '@/config/env';
import { initSentry, Sentry } from '@/config/sentry';
import { initI18n } from '@/i18n';

initSentry();
SplashScreen.preventAutoHideAsync().catch(() => {
  // Splash may already be hidden in dev/fast-refresh; ignore.
});

function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initI18n()
      .catch((err) => Sentry.captureException(err))
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => undefined);
  }, [ready]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ClerkProvider
          publishableKey={env.clerkPublishableKey}
          tokenCache={tokenCache}
          taskUrls={{
            'choose-organization': '/(auth)/tasks/choose-organization',
            'reset-password': '/(auth)/tasks/reset-password',
            'setup-mfa': '/(auth)/tasks/setup-mfa',
          }}
        >
          <ClerkLoaded>
            <StatusBar style="auto" />
            <Slot />
          </ClerkLoaded>
        </ClerkProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default env.sentryDsn ? Sentry.wrap(RootLayout) : RootLayout;
