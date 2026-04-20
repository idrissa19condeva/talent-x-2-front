import { Platform } from 'react-native';
import { renderWithProviders } from './test-utils';

jest.mock('expo-router', () => ({
  Link: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
}));

jest.mock('@clerk/clerk-expo', () => ({
  useAuth: () => ({ isLoaded: true, isSignedIn: false, signOut: jest.fn() }),
  useSignIn: () => ({ signIn: {}, setActive: jest.fn(), isLoaded: true }),
  useSignUp: () => ({ signUp: {}, setActive: jest.fn(), isLoaded: true }),
  useOAuth: () => ({ startOAuthFlow: jest.fn() }),
  useUser: () => ({ user: null }),
}));

import Welcome from '../app/(auth)/welcome';

describe('Welcome screen', () => {
  it('renders brand title and CTAs', () => {
    const { getByTestId, getByText } = renderWithProviders(<Welcome />);
    expect(getByTestId('welcome-title')).toBeTruthy();
    expect(getByTestId('cta-get-started')).toBeTruthy();
    expect(getByTestId('cta-have-account')).toBeTruthy();
    expect(getByText(/Build your talent story/i)).toBeTruthy();
  });

  it('renders language switcher', () => {
    const { getByTestId } = renderWithProviders(<Welcome />);
    expect(getByTestId('lang-picker-welcome')).toBeTruthy();
    expect(getByTestId('lang-en')).toBeTruthy();
    expect(getByTestId('lang-fr')).toBeTruthy();
  });
});

describe('Platform flag (sanity)', () => {
  it('reports a valid OS', () => {
    expect(['ios', 'android', 'web', 'windows', 'macos']).toContain(Platform.OS);
  });
});
