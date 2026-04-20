# TalentX — Mobile (Expo)

React Native · Expo Router · TypeScript · Clerk · i18next · Sentry · Jest · Maestro

The mobile app is the user-facing half of the TalentX starter. It delivers a
premium, localized authentication experience backed by Clerk and syncs the
authenticated user with the NestJS backend in `talent-x-2-back`.

## Stack highlights

- **Expo SDK 52+** (new architecture enabled, typed routes)
- **Expo Router** for file-based navigation (auth group + protected group)
- **Clerk Expo** (`@clerk/clerk-expo`) with `expo-secure-store` token cache
- **i18next + react-i18next + expo-localization** with `en` + `fr`, device-language
  detection, manual switcher, `AsyncStorage` persistence
- **Sentry** (`@sentry/react-native/expo`) wired into `RootLayout`
- **Theme system** — colors, spacing, typography tokens
- **Testing** — Jest + `jest-expo` + `@testing-library/react-native`
- **E2E** — Maestro flows covering launch, sign-up, sign-in, logout, session
  restore, protected-route guarding, social-button visibility

## Project structure

```
app/                        # Expo Router routes
├── _layout.tsx             # ClerkProvider + i18n + Sentry bootstrap
├── index.tsx               # Auth bootstrap + redirect
├── (auth)/
│   ├── _layout.tsx         # Redirects signed-in users out
│   ├── welcome.tsx
│   ├── sign-in.tsx
│   ├── sign-up.tsx
│   └── forgot-password.tsx
└── (app)/                  # Protected group
    ├── _layout.tsx         # Redirects signed-out users out
    ├── index.tsx           # First authenticated landing
    └── profile.tsx         # Session + language + sign-out

src/
├── components/             # Button, TextField, SocialButton, ScreenContainer, etc.
├── features/auth/          # validators, SocialAuthRow, useSocialAuth, useAppleAuth
├── hooks/                  # useMe (backend sync)
├── services/               # api.ts (fetch wrapper)
├── config/                 # env, sentry, clerk-token-cache
├── theme/                  # colors, spacing, typography
├── utils/                  # errors.ts
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
3. **User & Authentication → Email, phone, username**: enable **Email** + **Password**.
4. **User & Authentication → Social Connections**: enable **Google**, **Facebook**,
   **Apple** (see provider notes below).
5. **Paths** / **Redirect URLs**: allowlist `talentx://oauth-callback` and
   `talentx://` (and any staging/prod variants).
6. **Webhooks**: create an endpoint pointing at your backend
   (`<backend>/webhooks/clerk`). Subscribe to `user.created`, `user.updated`,
   `user.deleted`. Copy the signing secret into the backend `.env`.

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

## Testing strategy

- **Unit / integration** (`__tests__/`): validators, auth screens, protected
  routing, i18n, conditional Apple button. Clerk, Apple, Secure Store,
  Localization, Sentry are mocked in `jest.setup.ts` — CI needs no real
  provider credentials.
- **E2E** (`.maestro/`): designed to run against a dev build on a simulator or
  emulator. Requires either:
  - Clerk's **test mode** verification code (set
    `VERIFICATION_CODE` in `.maestro/config.yml` to Clerk's dev fixed code), or
  - a real inbox that the test harness can read.
  Social-auth flows are **not** driven end-to-end in Maestro — only button
  visibility is asserted, because OAuth goes through browser chrome.

## Observability

- `RootLayout` calls `initSentry()` before rendering. Disabled when `EXPO_PUBLIC_SENTRY_DSN` is blank.
- `useSocialAuth` and `useMe` both forward unexpected errors to Sentry.
- `Sentry.wrap(RootLayout)` enables React error boundary reporting.
- Breadcrumbs: add `Sentry.addBreadcrumb({ ... })` in feature code as it grows.

## Deep linking

- **Scheme**: `talentx://`
- Clerk OAuth redirect used by `useSocialAuth`: `talentx://oauth-callback`
- Expo Router auto-handles deep links for any route path, so
  `talentx:///(app)/profile` is honored (and bounced by the protected layout
  if the user is signed out).

## Security notes

- JWTs are stored in `expo-secure-store` (Keychain / Keystore), never in AsyncStorage.
- `.env` is gitignored; only `EXPO_PUBLIC_*` vars are bundled.
- All user-facing strings go through i18n; no UI copy is hardcoded.
