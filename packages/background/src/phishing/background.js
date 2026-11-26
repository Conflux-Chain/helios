import browser from 'webextension-polyfill'
import {createDomainService} from './service.js'

const domains = createDomainService({
  storage: browser.storage.local,
  fetchFn: (...args) => fetch(...args),
})

// Background only. The caller supplies a live wallet lock-state getter, not a DApp parameter.
export const checkPhishingOrigin = domains.checkOrigin

export function withDomainRefresh(afterUnlock, refresh = domains.refreshIfDue) {
  return {
    ...afterUnlock,
    permissions: {
      ...afterUnlock.permissions,
      db: [...afterUnlock.permissions.db, 'getLocked'],
    },
    main(args) {
      // No wallet lock/unlock side effect waits on the network. No periodic wakeups.
      void refresh(args.db.getLocked)
      return afterUnlock.main(args)
    },
  }
}
