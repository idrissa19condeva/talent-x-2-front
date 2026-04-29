import { buildAuthSchemas } from '@/features/auth/validators';

// Minimal translator so zod messages are deterministic in tests.
const t = ((key: string) => key) as unknown as Parameters<typeof buildAuthSchemas>[0];

describe('auth validators', () => {
  const s = buildAuthSchemas(t);

  it('rejects empty email', () => {
    const r = s.signIn.safeParse({ email: '', password: 'something' });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.flatten().fieldErrors.email?.[0]).toBe('email_required');
  });

  it('rejects malformed email', () => {
    const r = s.signIn.safeParse({ email: 'nope', password: 'something' });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.flatten().fieldErrors.email?.[0]).toBe('email_invalid');
  });

  it('rejects short passwords on sign-up', () => {
    const r = s.signUp.safeParse({
      email: 'a@b.com',
      password: 'short1',
      firstName: 'Ada',
    });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.flatten().fieldErrors.password?.[0]).toBe('password_too_short');
  });

  it('requires letters and digits', () => {
    const r = s.signUp.safeParse({
      email: 'a@b.com',
      password: 'allletters',
      firstName: 'Ada',
    });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.flatten().fieldErrors.password?.[0]).toBe('password_needs_variety');
  });

  it('accepts a valid sign-up payload', () => {
    const r = s.signUp.safeParse({
      email: 'a@b.com',
      password: 'abcdefg1',
      firstName: 'Ada',
    });
    expect(r.success).toBe(true);
  });
});
