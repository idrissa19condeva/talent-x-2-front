import '@testing-library/jest-native/extend-expect';

// Silence reanimated warnings in tests
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

// Apple auth — jest environment has no native module.
jest.mock('expo-apple-authentication', () => ({
  isAvailableAsync: jest.fn(async () => false),
  signInAsync: jest.fn(),
  AppleAuthenticationScope: { FULL_NAME: 0, EMAIL: 1 },
  AppleAuthenticationButton: () => null,
  AppleAuthenticationButtonType: { SIGN_IN: 0 },
  AppleAuthenticationButtonStyle: { BLACK: 0, WHITE: 1, WHITE_OUTLINE: 2 },
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async () => null),
  setItemAsync: jest.fn(async () => undefined),
  deleteItemAsync: jest.fn(async () => undefined),
}));

jest.mock('expo-localization', () => ({
  getLocales: () => [{ languageCode: 'en', regionCode: 'US' }],
}));

jest.mock('expo-haptics', () => ({
  selectionAsync: jest.fn(),
  notificationAsync: jest.fn(),
  impactAsync: jest.fn(),
  NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' },
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
}));

jest.mock('expo-linking', () => ({
  createURL: (p: string) => `talentx://${p}`,
}));

jest.mock('@sentry/react-native', () => ({
  init: jest.fn(),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  addBreadcrumb: jest.fn(),
  wrap: (c: unknown) => c,
  ReactNativeTracing: class {},
  reactNavigationIntegration: () => ({}),
}));
