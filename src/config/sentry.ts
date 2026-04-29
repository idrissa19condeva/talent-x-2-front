import * as Sentry from '@sentry/react-native';
import { env } from './env';

let initialized = false;

export function initSentry() {
  if (initialized || !env.sentryDsn) return;
  Sentry.init({
    dsn: env.sentryDsn,
    environment: env.env,
    enableAutoSessionTracking: true,
    tracesSampleRate: env.env === 'production' ? 0.2 : 1.0,
    debug: env.env !== 'production',
  });
  initialized = true;
}

export { Sentry };
