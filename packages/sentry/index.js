import * as Sentry from '@sentry/browser'
import {Integrations} from '@sentry/tracing'
import {keccak256} from '@ethersproject/keccak256'

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

export function capture(err, cpatureContext) {
  Sentry.captureException(err, cpatureContext)
}

export function captureMessage(message) {
  if (!message || typeof message !== 'string') return
  Sentry.captureMessage(message)
}

export function updateUserId(id) {
  if (typeof id !== 'string') return
  Sentry.configureScope(scope => {
    scope.setUser({id: keccak256(id)})
  })
}

export function addBreadcrumb(opts = {}) {
  Sentry.addBreadcrumb(opts)
}

export {Sentry}
