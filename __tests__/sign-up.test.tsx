import { fireEvent, waitFor } from '@testing-library/react-native';
import { renderWithProviders } from './test-utils';

const signUpCreate = jest.fn();
const prepare = jest.fn();
const attempt = jest.fn();
const setActive = jest.fn();

jest.mock('expo-router', () => ({
  Link: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
}));

jest.mock('@clerk/clerk-expo', () => ({
  useAuth: () => ({ isLoaded: true, isSignedIn: false }),
  useSignUp: () => ({
    signUp: {
      create: signUpCreate,
      prepareEmailAddressVerification: prepare,
      attemptEmailAddressVerification: attempt,
    },
    setActive,
    isLoaded: true,
  }),
  useOAuth: () => ({ startOAuthFlow: jest.fn() }),
}));

import SignUp from '../app/(auth)/sign-up';

describe('Sign-up screen', () => {
  beforeEach(() => {
    signUpCreate.mockReset();
    prepare.mockReset();
    attempt.mockReset();
    setActive.mockReset();
  });

  it('validates all fields on empty submit', async () => {
    const { getByTestId } = renderWithProviders(<SignUp />);
    fireEvent.press(getByTestId('sign-up-submit'));
    await waitFor(() => {
      expect(getByTestId('sign-up-first-name-error')).toBeTruthy();
      expect(getByTestId('sign-up-email-error')).toBeTruthy();
      expect(getByTestId('sign-up-password-error')).toBeTruthy();
    });
  });

  it('creates account and moves to verification', async () => {
    signUpCreate.mockResolvedValue({});
    prepare.mockResolvedValue({});

    const { getByTestId } = renderWithProviders(<SignUp />);
    fireEvent.changeText(getByTestId('sign-up-first-name'), 'Ada');
    fireEvent.changeText(getByTestId('sign-up-email'), 'a@b.com');
    fireEvent.changeText(getByTestId('sign-up-password'), 'abcdefg1');
    fireEvent.press(getByTestId('sign-up-submit'));

    await waitFor(() => {
      expect(signUpCreate).toHaveBeenCalled();
      expect(prepare).toHaveBeenCalledWith({ strategy: 'email_code' });
      expect(getByTestId('sign-up-code')).toBeTruthy();
    });
  });

  it('verifies the code and activates the session', async () => {
    signUpCreate.mockResolvedValue({});
    prepare.mockResolvedValue({});
    attempt.mockResolvedValue({ status: 'complete', createdSessionId: 'sess_2' });

    const { getByTestId } = renderWithProviders(<SignUp />);
    fireEvent.changeText(getByTestId('sign-up-first-name'), 'Ada');
    fireEvent.changeText(getByTestId('sign-up-email'), 'a@b.com');
    fireEvent.changeText(getByTestId('sign-up-password'), 'abcdefg1');
    fireEvent.press(getByTestId('sign-up-submit'));

    await waitFor(() => getByTestId('sign-up-code'));

    fireEvent.changeText(getByTestId('sign-up-code'), '123456');
    fireEvent.press(getByTestId('sign-up-verify-submit'));

    await waitFor(() => {
      expect(attempt).toHaveBeenCalledWith({ code: '123456' });
      expect(setActive).toHaveBeenCalledWith({ session: 'sess_2' });
    });
  });
});
