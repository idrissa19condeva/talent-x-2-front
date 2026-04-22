import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { resources, SupportedLanguage, SUPPORTED_LANGUAGES } from './resources';

const LANGUAGE_STORAGE_KEY = 'talentx.language';

export function detectDeviceLanguage(): SupportedLanguage {
  const locales = Localization.getLocales();
  const code = locales[0]?.languageCode ?? 'en';
  return SUPPORTED_LANGUAGES.includes(code as SupportedLanguage)
    ? (code as SupportedLanguage)
    : 'en';
}

export async function initI18n() {
  let stored: string | null = null;
  try {
    stored = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
  } catch {
    stored = null;
  }
  const lng: SupportedLanguage =
    (stored as SupportedLanguage | null) ?? detectDeviceLanguage();

  await i18n.use(initReactI18next).init({
    resources,
    lng,
    fallbackLng: 'en',
    ns: ['common', 'auth', 'profile', 'errors'],
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
    returnNull: false,
    compatibilityJSON: 'v3',
  });
}

export async function setLanguage(lng: SupportedLanguage) {
  await i18n.changeLanguage(lng);
  try {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lng);
  } catch {
    // Persistence is best-effort.
  }
}

export { i18n };
export * from './resources';
