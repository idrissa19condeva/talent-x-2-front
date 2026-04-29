import { fireEvent, waitFor } from '@testing-library/react-native';
import { renderWithProviders } from './test-utils';

const attempt = jest.fn();
const prepare = jest.fn();
const setActive = jest.fn();

jest.mock('expo-router', () => ({
  Link: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Redirect: () => null,
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
}));

jest.mock('@clerk/clerk-expo', () => ({
  useAuth: () => ({ isLoaded: true, isSignedIn: false }),
  useClerk: () => ({ signOut: jest.fn() }),
  useSignUp: () => ({
    signUp: {
      emailAddress: 'a@b.com',
      attemptEmailAddressVerification: attempt,
      prepareEmailAddressVerification: prepare,
    },
    setActive,
    isLoaded: true,
  }),
}));

import VerifyEmail from '../app/(auth)/verify-email';

describe('Verify email screen', () => {
  beforeEach(() => {
    attempt.mockReset();
    prepare.mockReset();
    setActive.mockReset();
  });

  it('renders title, subtitle with email, and OTP cells', () => {
    const { getByText, getByTestId } = renderWithProviders(<VerifyEmail />);
    expect(getByText(/Verify your email/i)).toBeTruthy();
    expect(getByText(/a@b.com/)).toBeTruthy();
    expect(getByTestId('verify-code')).toBeTruthy();
    expect(getByTestId('verify-code-cell-0')).toBeTruthy();
    expect(getByTestId('verify-code-cell-5')).toBeTruthy();
  });

  it('rejects a short code with a translated error', async () => {
    const { getByTestId } = renderWithProviders(<VerifyEmail />);
    fireEvent.changeText(getByTestId('verify-code'), '12');
    fireEvent.press(getByTestId('verify-submit'));
    await waitFor(() => {
      expect(getByTestId('verify-code-error')).toBeTruthy();
    });
    expect(attempt).not.toHaveBeenCalled();
  });

  it('completes verification and activates the session', async () => {
    attempt.mockResolvedValue({ status: 'complete', createdSessionId: 'sess_42' });

    const { getByTestId } = renderWithProviders(<VerifyEmail />);
    fireEvent.changeText(getByTestId('verify-code'), '654321');
    // Auto-complete should fire after 6 digits, but we also click submit explicitly.
    fireEvent.press(getByTestId('verify-submit'));

    await waitFor(() => {
      expect(attempt).toHaveBeenCalledWith({ code: '654321' });
      expect(setActive).toHaveBeenCalledWith({ session: 'sess_42' });
    });
  });

  it('shows a translated error when Clerk rejects the code', async () => {
    attempt.mockRejectedValue({ errors: [{ code: 'verification_failed', longMessage: 'Bad code' }] });

    const { getByTestId } = renderWithProviders(<VerifyEmail />);
    fireEvent.changeText(getByTestId('verify-code'), '111111');
    fireEvent.press(getByTestId('verify-submit'));

    await waitFor(() => {
      expect(getByTestId('verify-code-error')).toBeTruthy();
    });
    expect(setActive).not.toHaveBeenCalled();
  });

  it('resends the verification code', async () => {
    prepare.mockResolvedValue({});

    const { getByTestId } = renderWithProviders(<VerifyEmail />);
    fireEvent.press(getByTestId('verify-resend'));

    await waitFor(() => {
      expect(prepare).toHaveBeenCalledWith({ strategy: 'email_code' });
      expect(getByTestId('verify-info')).toBeTruthy();
    });
  });
});
