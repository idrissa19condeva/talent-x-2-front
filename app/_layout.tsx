import 'react-native-gesture-handler';
import { useEffect, useState } from 'react';
import { ClerkProvider, ClerkLoaded } from '@clerk/clerk-expo';
import { Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { env } from '@/config/env';
import { initSentry, Sentry } from '@/config/sentry';
import { tokenCache } from '@/config/clerk-token-cache';
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
        <ClerkProvider publishableKey={env.clerkPublishableKey} tokenCache={tokenCache}>
          <ClerkLoaded>
            <StatusBar style="auto" />
            <Slot />
          </ClerkLoaded>
        </ClerkProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default Sentry.wrap(RootLayout);
