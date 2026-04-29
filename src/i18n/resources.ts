import enCommon from './locales/en/common.json';
import enAuth from './locales/en/auth.json';
import enProfile from './locales/en/profile.json';
import enErrors from './locales/en/errors.json';
import frCommon from './locales/fr/common.json';
import frAuth from './locales/fr/auth.json';
import frProfile from './locales/fr/profile.json';
import frErrors from './locales/fr/errors.json';

export const SUPPORTED_LANGUAGES = ['en', 'fr'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const resources = {
  en: { common: enCommon, auth: enAuth, profile: enProfile, errors: enErrors },
  fr: { common: frCommon, auth: frAuth, profile: frProfile, errors: frErrors },
} as const;
