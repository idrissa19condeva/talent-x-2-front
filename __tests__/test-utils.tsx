import { ReactElement } from 'react';
import { render } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { resources } from '@/i18n/resources';

// Synchronous i18n init used by every test. Avoids AsyncStorage + Localization deps.
if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    ns: ['common', 'auth', 'profile', 'errors'],
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
    compatibilityJSON: 'v4',
  });
}

export function renderWithProviders(ui: ReactElement) {
  return render(
    <SafeAreaProvider initialMetrics={{ frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 0, bottom: 0, left: 0, right: 0 } }}>
      <I18nextProvider i18n={i18n}>{ui}</I18nextProvider>
    </SafeAreaProvider>,
  );
}

export { i18n };
