import { fireEvent, waitFor } from '@testing-library/react-native';
import { renderWithProviders } from './test-utils';

const signInCreate = jest.fn();
const setActive = jest.fn();

jest.mock('expo-router', () => ({
  Link: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Redirect: () => null,
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
}));

jest.mock('@clerk/clerk-expo', () => ({
  useAuth: () => ({ isLoaded: true, isSignedIn: false }),
  useClerk: () => ({ signOut: jest.fn() }),
  useSignIn: () => ({
    signIn: { create: signInCreate },
    setActive,
    isLoaded: true,
  }),
  useOAuth: () => ({ startOAuthFlow: jest.fn(async () => ({ createdSessionId: null })) }),
}));

import SignIn from '../app/(auth)/sign-in';

describe('Sign-in screen', () => {
  beforeEach(() => {
    signInCreate.mockReset();
    setActive.mockReset();
  });

  it('shows validation errors when submitting empty form', async () => {
    const { getByTestId } = renderWithProviders(<SignIn />);
    fireEvent.press(getByTestId('sign-in-submit'));
    await waitFor(() => {
      expect(getByTestId('sign-in-email-error')).toBeTruthy();
    });
  });

  it('submits credentials and activates session on success', async () => {
    signInCreate.mockResolvedValue({ status: 'complete', createdSessionId: 'sess_1' });
    const { getByTestId } = renderWithProviders(<SignIn />);
    fireEvent.changeText(getByTestId('sign-in-email'), 'user@example.com');
    fireEvent.changeText(getByTestId('sign-in-password'), 'secret123');
    fireEvent.press(getByTestId('sign-in-submit'));

    await waitFor(() => {
      expect(signInCreate).toHaveBeenCalledWith({
        identifier: 'user@example.com',
        password: 'secret123',
      });
      expect(setActive).toHaveBeenCalledWith({ session: 'sess_1' });
    });
  });

  it('surfaces Clerk error messages in-form', async () => {
    signInCreate.mockRejectedValue({
      errors: [{ code: 'form_password_incorrect', message: 'bad' }],
    });
    const { getByTestId } = renderWithProviders(<SignIn />);
    fireEvent.changeText(getByTestId('sign-in-email'), 'user@example.com');
    fireEvent.changeText(getByTestId('sign-in-password'), 'whatever1');
    fireEvent.press(getByTestId('sign-in-submit'));

    await waitFor(() => {
      expect(getByTestId('sign-in-form-error')).toBeTruthy();
    });
  });

  it('renders Google + Facebook but not Apple on non-iOS', () => {
    const { getByTestId, queryByTestId } = renderWithProviders(<SignIn />);
    expect(getByTestId('sign-in-social-google')).toBeTruthy();
    expect(getByTestId('sign-in-social-facebook')).toBeTruthy();
    expect(queryByTestId('sign-in-social-apple')).toBeNull();
  });
});
