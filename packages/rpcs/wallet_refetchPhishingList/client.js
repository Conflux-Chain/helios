import browser from 'webextension-polyfill'
import {createDomainService} from './service.js'

// Share one background instance between post-unlock refresh and domain checks.
export const {refreshIfDue, checkOrigin: checkPhishingOrigin} =
  createDomainService({
    storage: browser.storage.local,
  })
