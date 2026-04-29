import { fireEvent, waitFor } from '@testing-library/react-native';
import { renderWithProviders } from './test-utils';

const signUpCreate = jest.fn();
const prepare = jest.fn();
const replace = jest.fn();

jest.mock('expo-router', () => ({
  Link: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Redirect: () => null,
  useRouter: () => ({ push: jest.fn(), replace, back: jest.fn() }),
}));

jest.mock('@clerk/clerk-expo', () => ({
  useAuth: () => ({ isLoaded: true, isSignedIn: false }),
  useClerk: () => ({ signOut: jest.fn() }),
  useSignUp: () => ({
    signUp: {
      create: signUpCreate,
      prepareEmailAddressVerification: prepare,
    },
    setActive: jest.fn(),
    isLoaded: true,
  }),
  useOAuth: () => ({ startOAuthFlow: jest.fn() }),
}));

import SignUp from '../app/(auth)/sign-up';

describe('Sign-up screen', () => {
  beforeEach(() => {
    signUpCreate.mockReset();
    prepare.mockReset();
    replace.mockReset();
  });

  it('shows validation errors on empty submit', async () => {
    const { getByTestId } = renderWithProviders(<SignUp />);
    fireEvent.press(getByTestId('sign-up-submit'));
    await waitFor(() => {
      expect(getByTestId('sign-up-first-name-error')).toBeTruthy();
      expect(getByTestId('sign-up-email-error')).toBeTruthy();
      expect(getByTestId('sign-up-password-error')).toBeTruthy();
    });
    expect(signUpCreate).not.toHaveBeenCalled();
  });

  it('rejects a weak password', async () => {
    const { getByTestId } = renderWithProviders(<SignUp />);
    fireEvent.changeText(getByTestId('sign-up-first-name'), 'Ada');
    fireEvent.changeText(getByTestId('sign-up-email'), 'a@b.com');
    fireEvent.changeText(getByTestId('sign-up-password'), 'short');
    fireEvent.press(getByTestId('sign-up-submit'));
    await waitFor(() => {
      expect(getByTestId('sign-up-password-error')).toBeTruthy();
    });
    expect(signUpCreate).not.toHaveBeenCalled();
  });

  it('starts verification and routes to verify-email on success', async () => {
    signUpCreate.mockResolvedValue({});
    prepare.mockResolvedValue({});

    const { getByTestId } = renderWithProviders(<SignUp />);
    fireEvent.changeText(getByTestId('sign-up-first-name'), 'Ada');
    fireEvent.changeText(getByTestId('sign-up-email'), 'a@b.com');
    fireEvent.changeText(getByTestId('sign-up-password'), 'abcdefg1');
    fireEvent.press(getByTestId('sign-up-submit'));

    await waitFor(() => {
      expect(signUpCreate).toHaveBeenCalledWith({
        emailAddress: 'a@b.com',
        password: 'abcdefg1',
        firstName: 'Ada',
      });
      expect(prepare).toHaveBeenCalledWith({ strategy: 'email_code' });
      expect(replace).toHaveBeenCalledWith('/(auth)/verify-email');
    });
  });
});
