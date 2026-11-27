import browser from 'webextension-polyfill'
import {PhishingListCache} from './list-cache.js'

// The unlock RPC and domain checks share the same background cache.
const cache = new PhishingListCache({storage: browser.storage.local})
export const refreshIfDue = isLocked => cache.refreshIfDue(isLocked)
export const checkPhishingOrigin = (origin, isLocked, pendingSignal) =>
  cache.checkOrigin(origin, isLocked, pendingSignal)
