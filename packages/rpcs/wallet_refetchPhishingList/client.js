import browser from 'webextension-polyfill'
import {createListCache} from './list-cache.js'

// Share one background instance between post-unlock refresh and domain checks.
export const {refreshIfDue, checkOrigin: checkPhishingOrigin} = createListCache(
  {
    storage: browser.storage.local,
  },
)
