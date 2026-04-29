# TalentX — Mobile (Expo)

React Native · Expo Router · TypeScript · Clerk · i18next · Sentry · Jest · Maestro

The mobile app is the user-facing half of the TalentX starter. It delivers a
premium, localized authentication experience backed by Clerk and syncs the
authenticated user with the NestJS backend in `talent-x-2-back`.

## Stack highlights

- **Expo SDK 54+** (new architecture enabled, typed routes)
- **Expo Router v6** for file-based navigation (auth group + protected group)
- **Clerk Expo** (`@clerk/clerk-expo`) with the official `tokenCache`, full
  email-code verification flow, and pending-task handling
- **i18next + react-i18next + expo-localization** with `en` + `fr`, device-language
  detection, manual switcher, `AsyncStorage` persistence
- **Sentry** (`@sentry/react-native`) wired into `RootLayout` with breadcrumbs
  for the auth lifecycle (no passwords, no codes logged)
- **Theme system** — colors, spacing, typography tokens, gradient hero, soft cards
- **Forms** — `react-hook-form` + `zod` (`@hookform/resolvers`) for validation
- **Icons / visuals** — `lucide-react-native`, `expo-linear-gradient`,
  inline SVG glyphs for social providers
- **Haptics** — `expo-haptics` on primary CTAs and success/failure transitions
- **Testing** — Jest + `jest-expo` + `@testing-library/react-native`
- **E2E** — Maestro flows covering launch, sign-up + verification, sign-in,
  logout, session restore, protected-route guarding, social-button visibility

## Project structure

```
app/                        # Expo Router routes
├── _layout.tsx             # ClerkProvider + taskUrls + i18n + Sentry bootstrap
├── (auth)/
│   ├── _layout.tsx         # Redirects signed-in users out
│   ├── welcome.tsx         # Gradient hero, animated entrance, CTAs
│   ├── sign-in.tsx         # react-hook-form + zod
│   ├── sign-up.tsx         # react-hook-form + routes to verify-email on success
│   ├── verify-email.tsx    # 6-digit OTP, resend with cooldown, self-heal
│   ├── forgot-password.tsx
│   └── tasks/[task].tsx    # Pending-task router (Clerk taskUrls)
└── (app)/                  # Protected group
    ├── _layout.tsx         # Redirects signed-out users out
    ├── index.tsx           # First authenticated landing
    └── profile.tsx         # Session + language + verification status + sign-out

src/
├── components/             # Button, TextField, SocialButton, ScreenContainer,
│                           # AuthCard, GradientBackground, OtpField,
│                           # TrustBadge, SocialGlyphs (inline SVG), LanguagePicker
├── features/auth/          # validators (zod), SocialAuthRow, useSocialAuth, useAppleAuth
├── hooks/                  # useMe (backend sync, exposes user.emailVerified)
├── services/               # api.ts (fetch wrapper, attaches Clerk Bearer token)
├── config/                 # env, sentry
├── theme/                  # colors, spacing, typography
├── utils/                  # errors.ts (Clerk error mapper, isSessionExistsError)
└── i18n/                   # locales/en, locales/fr, index.ts (init + switcher)

__tests__/                  # Unit + integration tests
.maestro/                   # Maestro E2E flows
assets/                     # icon / splash / adaptive-icon
```

## Prerequisites

- Node 20+
- A working Expo dev environment (`npx expo --help`)
- For iOS Apple Sign In + Google/Facebook OAuth you need a **development build**
  (not Expo Go) because `expo-apple-authentication` requires a native module.
  Use `eas build --profile development` or `npx expo prebuild` + `npx expo run:ios/android`.

## Setup

```bash
npm install

cp .env.example .env
# Fill in EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY and EXPO_PUBLIC_API_BASE_URL.

npx expo start
```

For a local dev build with Clerk social login:

```bash
npx expo prebuild
npx expo run:ios        # or run:android
```

## Environment variables

| Name                                 | Required | Purpose                              |
| ------------------------------------ | -------- | ------------------------------------ |
| `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`  | ✅       | Clerk Expo client                    |
| `EXPO_PUBLIC_API_BASE_URL`           | ✅       | NestJS backend base URL              |
| `EXPO_PUBLIC_SENTRY_DSN`             | optional | Enables Sentry when set              |
| `EXPO_PUBLIC_ENV`                    | optional | `development` \| `staging` \| `production` |

## Clerk Dashboard configuration checklist

1. Create a Clerk application → pick **Development**.
2. **API Keys** → copy the **Publishable** key into `.env` and the **Secret** key
   into the backend `.env`.
3. **User & Authentication → Email, phone, username**:
   - Enable **Sign-up with email**.
   - Mark **Require email address** as required (forced when email is the only
     identifier).
   - Enable **Verify at sign-up** with the **Email verification code** method.
   - Enable **Sign-in with email** + **Email verification code**.
   - Enable **Password** sign-up.
   - **Disable** any required field the app does not collect (phone, username,
     custom fields) to avoid Clerk pending tasks.
4. **User & Authentication → Multi-factor**: leave disabled unless your app
   ships an MFA setup screen — otherwise sign-in stalls on a pending task.
5. **Configure → Organizations**: leave **Membership optional** (the starter
   does not collect an organization). If you enable orgs, also wire up the
   `choose-organization` task URL — the starter already declares one in
   `app/_layout.tsx`.
6. **Social Connections**: enable **Google**, **Facebook**, **Apple** (see
   provider notes below).
7. **Paths / Redirect URLs**: allowlist `talentx://oauth-callback` and
   `talentx://` (and any staging/prod variants).
8. **Webhooks**: create an endpoint pointing at your backend
   (`<backend>/webhooks/clerk`). Subscribe to `user.created`, `user.updated`,
   `user.deleted`. Copy the signing secret into the backend `.env` as
   `CLERK_WEBHOOK_SECRET`.

### Provider-specific setup

- **Google** — Google Cloud Console OAuth client IDs. For iOS, add
  `com.googleusercontent.apps.<client-id>` as a URL scheme in Xcode once you
  eject. Add `talentx://oauth-callback` to Clerk's allowed redirect URLs.
- **Facebook** — Meta Developer App, copy app id + secret into Clerk. Add the
  OAuth redirect URI that Clerk provides to the Meta app.
- **Apple** — Apple Developer Program required. In your Apple Developer account:
  1. Enable **Sign In with Apple** on the bundle ID `com.talentx.app`.
  2. Create a **Services ID**, a **Key**, and paste the key id + team id into Clerk.
  Apple Sign In only appears on iOS because `expo-apple-authentication`
  reports `isAvailableAsync() === false` elsewhere.

## Scripts

| Script              | What it does                       |
| ------------------- | ---------------------------------- |
| `npm start`         | `expo start`                       |
| `npm run ios`       | Build + open iOS sim               |
| `npm run android`   | Build + open Android emulator      |
| `npm run typecheck` | `tsc --noEmit`                     |
| `npm run lint`      | ESLint --fix                       |
| `npm run format`    | Prettier                           |
| `npm test`          | Jest                               |
| `npm run test:cov`  | Jest + coverage                    |
| `npm run maestro:test` | Run every `.maestro/*.yml` flow |

## Email verification flow

Sign-up requires a verifiable email. The flow is:

1. User submits the sign-up form (`app/(auth)/sign-up.tsx`).
2. We call `signUp.create({ emailAddress, password, firstName })` and then
   `signUp.prepareEmailAddressVerification({ strategy: 'email_code' })`.
3. We `router.replace('/(auth)/verify-email')`.
4. The user enters the 6-digit code on `app/(auth)/verify-email.tsx`. The
   `OtpField` component supports paste and auto-submit on the 6th digit.
5. We call `signUp.attemptEmailAddressVerification({ code })`. If `status ===
   'complete'`, we `setActive({ session: createdSessionId })` — Clerk's state
   flips to `isSignedIn=true` and the `(auth)` layout guard redirects to `/`.
6. If the user abandons mid-flow, the screen offers "Use a different email"
   which signs the partial sign-up out via `useClerk().signOut()`.

Resend has a 30-second cooldown. Errors (expired/invalid code, network) are
translated through the `errors` namespace.

Backend mirroring of `emailVerifiedAt` happens via the Clerk webhook (see
backend README) — the frontend never marks a user as verified directly.

## Testing strategy

- **Unit / integration** (`__tests__/`): validators, welcome, sign-in, sign-up,
  verify-email, protected routing, i18n, conditional Apple button. Clerk,
  Apple, Secure Store, Localization, Sentry, expo-linear-gradient,
  lucide-react-native and react-native-svg are all mocked in `jest.setup.ts` —
  CI needs no real provider credentials.
- **E2E** (`.maestro/`): designed to run against a dev build on a simulator or
  emulator. The verification step requires either:
  - Clerk's **test instance fixed code** (set `VERIFICATION_CODE` in
    `.maestro/config.yml` to the value from the Clerk dashboard), or
  - a real inbox that the test harness can read.
  Social-auth flows are **not** driven end-to-end in Maestro — only button
  visibility is asserted, because OAuth opens browser chrome.

## Observability

- `RootLayout` calls `initSentry()` before rendering. Disabled when
  `EXPO_PUBLIC_SENTRY_DSN` is blank.
- `useSocialAuth`, `useMe`, sign-in, sign-up and verify-email screens all
  forward unexpected errors to Sentry via `Sentry.captureException(err)`.
- Breadcrumbs are emitted at: `signin.start`, `signup.start`,
  `signup.code_sent`, `verification.attempt`, `verification.success`,
  `verification.failure`, `verification.resend`. **Passwords and verification
  codes are never included** — only the event name.
- `Sentry.wrap(RootLayout)` enables React error boundary reporting (only when a
  DSN is set, to avoid noisy warnings in dev).

## Deep linking

- **Scheme**: `talentx://`
- Clerk OAuth redirect used by `useSocialAuth`: `talentx://oauth-callback`
- Expo Router auto-handles deep links for any route path, so
  `talentx:///(app)/profile` is honored (and bounced by the protected layout
  if the user is signed out).

## Security notes

- JWTs are stored in `expo-secure-store` (Keychain / Keystore) via Clerk's
  official `tokenCache` from `@clerk/clerk-expo/token-cache` — never AsyncStorage.
- `.env` is gitignored; only `EXPO_PUBLIC_*` vars are bundled into the app.
- All user-facing strings go through i18n; no UI copy is hardcoded.
- Clerk is the single source of truth for identity and verification state.
  The backend mirrors `emailVerifiedAt` via the Clerk webhook — the app never
  marks itself as verified.
- Passwords are never stored or logged anywhere outside Clerk. The frontend
  never logs raw verification codes; breadcrumbs only emit the event name.

## Production hardening checklist

Before flipping the switch:

- [ ] Switch Clerk to a **production** instance and rotate keys.
- [ ] Move the backend behind HTTPS with a verified domain and set
      `EXPO_PUBLIC_API_BASE_URL` accordingly.
- [ ] Configure the Clerk webhook against the production domain and copy the
      signing secret into the backend.
- [ ] Set `EXPO_PUBLIC_SENTRY_DSN` and tighten `tracesSampleRate` (default 0.2 in prod).
- [ ] Run an EAS build with the production profile; submit to TestFlight /
      Play Internal Testing.
- [ ] Verify Apple Sign In in a TestFlight build (Expo Go cannot test it).
- [ ] Run the full Maestro suite against a release build.
