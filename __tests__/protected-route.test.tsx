import { renderWithProviders } from './test-utils';

const redirectSpy = jest.fn();

jest.mock('expo-router', () => ({
  Redirect: (props: { href: string }) => {
    redirectSpy(props.href);
    return null;
  },
  Stack: Object.assign(
    ({ children }: { children?: React.ReactNode }) => <>{children}</>,
    { Screen: () => null },
  ),
  Link: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
}));

const mockUseAuth = jest.fn();
jest.mock('@clerk/clerk-expo', () => ({
  useAuth: () => mockUseAuth(),
  useUser: () => ({ user: null }),
}));

import ProtectedLayout from '../app/(app)/_layout';

describe('Protected layout', () => {
  beforeEach(() => redirectSpy.mockReset());

  it('redirects signed-out users to /(auth)/welcome', () => {
    mockUseAuth.mockReturnValue({ isLoaded: true, isSignedIn: false });
    renderWithProviders(<ProtectedLayout />);
    expect(redirectSpy).toHaveBeenCalledWith('/(auth)/welcome');
  });

  it('allows render when signed in (no redirect)', () => {
    mockUseAuth.mockReturnValue({ isLoaded: true, isSignedIn: true });
    renderWithProviders(<ProtectedLayout />);
    expect(redirectSpy).not.toHaveBeenCalled();
  });
});
