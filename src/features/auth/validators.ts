import { z } from 'zod';
import type { TFunction } from 'i18next';

/**
 * Returns zod schemas that resolve their error messages through the active
 * i18n translator. The schemas run synchronously — callers just read `t`.
 */
export function buildAuthSchemas(t: TFunction<'errors'>) {
  const email = z
    .string({ required_error: t('email_required') })
    .min(1, { message: t('email_required') })
    .email({ message: t('email_invalid') });

  const password = z
    .string({ required_error: t('password_required') })
    .min(8, { message: t('password_too_short') })
    .regex(/[A-Za-z]/, { message: t('password_needs_variety') })
    .regex(/[0-9]/, { message: t('password_needs_variety') });

  const firstName = z
    .string({ required_error: t('first_name_required') })
    .trim()
    .min(1, { message: t('first_name_required') });

  const signIn = z.object({ email, password: z.string().min(1, { message: t('password_required') }) });

  const signUp = z.object({ email, password, firstName });

  const verifyCode = z.object({
    code: z.string().trim().min(4, { message: t('code_required') }),
  });

  const forgot = z.object({ email });

  return { email, password, firstName, signIn, signUp, verifyCode, forgot };
}

export type SignInInput = z.infer<ReturnType<typeof buildAuthSchemas>['signIn']>;
export type SignUpInput = z.infer<ReturnType<typeof buildAuthSchemas>['signUp']>;
