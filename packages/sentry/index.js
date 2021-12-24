import * as Sentry from '@sentry/browser'
import {Integrations} from '@sentry/tracing'

const defaultOpts = {
  integrations: [new Integrations.BrowserTracing()],
  environment: 'unknown',
  release: 'unknown',

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
  attachStacktrace: false,
  autoSessionTracking: true,
}

export function init(opts = {}) {
  Sentry.init(Object.assign(defaultOpts, opts))
}

export function capture(err) {
  Sentry.captureException(err)
}
