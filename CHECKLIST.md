# TalentX — delivery checklist (mobile)

## ✅ Fully implemented
- Expo SDK 52 app with new-architecture + typed routes
- Expo Router: `(auth)` group + protected `(app)` group with layout-level redirects
- Clerk Expo: `ClerkProvider` with `expo-secure-store` token cache
- Email/password sign-in, sign-up + email-code verification, forgot-password start
- Google, Facebook, Apple OAuth buttons (Apple hidden off-iOS)
- Session persistence via Secure Store (Keychain / Keystore)
- Welcome screen, Sign In, Sign Up (with verification step), Forgot Password,
  Home (authenticated landing), Profile + logout confirmation
- Premium UI: token-based theme, Button / TextField (show/hide) / SocialButton /
  Divider / ScreenContainer / AuthHeader / LanguagePicker
- i18next + react-i18next + expo-localization; EN + FR; AsyncStorage-persisted
  user choice; fallback to EN; strings organized by namespace (common, auth,
  profile, errors)
- In-app language switcher on Welcome + Profile
- Sentry init gated on `EXPO_PUBLIC_SENTRY_DSN`; `Sentry.wrap(RootLayout)`
- Typed API client (`apiCall`) attaching Clerk bearer + `Accept-Language`
- `useMe` hook consuming `/v1/users/me`
- Jest + jest-expo + Testing Library tests for: validators, welcome, sign-in,
  sign-up (incl. verification), protected route redirect, i18n EN↔FR
- Maestro flows (8): launch, sign-up, sign-in, logout, session restore,
  protected-route guard, social buttons visible, Apple button iOS-only
- GitHub Actions CI

## ⚠️ Needs external credentials / native build
- A Clerk publishable key → `.env`
- **Dev build** (not Expo Go) for Apple Sign In, native OAuth webview, and
  Secure Store — `npx expo prebuild && npx expo run:ios|android` or EAS
- Sentry DSN (optional)

## 🧩 Manual dashboard configuration required
- **Clerk**:
  - Enable Email + Password
  - Enable Google, Facebook, Apple social connections
  - Add redirect URL `talentx://oauth-callback`
  - Configure webhook endpoint → `<backend>/webhooks/clerk`
- **Google Cloud Console** — OAuth client IDs per platform
- **Meta for Developers** — Facebook App, redirect URIs from Clerk
- **Apple Developer** — Sign in with Apple capability on `com.talentx.app`,
  Services ID + Key, paste credentials into Clerk

## 🧪 Mocked vs real in tests
- **Mocked:** `@clerk/clerk-expo` (useAuth/useSignIn/useSignUp/useOAuth/useUser),
  `expo-apple-authentication`, `expo-secure-store`, `expo-localization`,
  `expo-haptics`, `expo-linking`, `@sentry/react-native`, `expo-router`
- **Real:** validators (zod), i18n resources, UI rendering, Testing Library
  interactions
- **Maestro E2E:** UI visibility is real; OAuth providers are **not**
  driven — only button visibility is asserted. Email verification requires
  Clerk test mode or a real inbox.

## 🔐 Production hardening TODO
- Replace placeholder `assets/icon.png`, `splash.png`, `adaptive-icon.png`
- Tune Sentry sample rates per environment; enable performance + session replay
- Add screen-level error boundaries or `ErrorBoundary` component that falls
  back to a localized error screen
- Add rate limit / retry to `apiCall` when failures are transient
- Gate biometric re-auth (`expo-local-authentication`) on resume for sensitive flows
- Implement full password-reset flow (code entry + new-password screen)
- EAS Build profiles (dev, staging, prod) with per-env `.env` values
- App Store / Play Store listing assets + metadata
- Replace `talentx://` with Universal Links / App Links for polish
