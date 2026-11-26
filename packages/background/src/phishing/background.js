import browser from 'webextension-polyfill'
import {createDomainService} from './service.js'

const domains = createDomainService({
  storage: browser.storage.local,
  fetchFn: (...args) => fetch(...args),
})

export const checkPhishingOrigin = domains.checkOrigin

// Internal RPC, just like other refetch methods called by wallet_afterUnlock.
// Only start the check here: neither unlocking nor refreshing balances waits for HTTP.
export const walletRefetchPhishingList = {
  NAME: 'wallet_refetchPhishingList',
  schemas: {},
  permissions: {external: [], db: ['getLocked']},
  main: ({db: {getLocked}}) => {
    void domains.refreshIfDue(getLocked)
  },
}
