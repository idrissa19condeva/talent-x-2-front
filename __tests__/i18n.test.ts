import { i18n } from './test-utils';

describe('i18n', () => {
  it('falls back to English for unsupported locales', () => {
    expect(i18n.language).toBe('en');
    expect(i18n.t('auth:sign_in_cta')).toBe('Sign in');
  });

  it('switches to French correctly', async () => {
    await i18n.changeLanguage('fr');
    expect(i18n.t('auth:sign_in_cta')).toBe('Se connecter');
    await i18n.changeLanguage('en');
  });
});
