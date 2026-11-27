import {initFetcher} from '@fluent-wallet/fetch-rpc'
import {createDomainSets} from './domain.js'
import {parseMetaMaskFullList, applyMetaMaskDiffs} from './metamask-list.js'

// MetaMask/core phishing-controller: v1 full list plus ordered v2 mutations.
const METAMASK_API = 'https://phishing-detection.api.cx.metamask.io'
export const METAMASK_FULL_LIST_URL = `${METAMASK_API}/v1/stalelist`

export const getMetaMaskDiffsUrl = cursor =>
  `${METAMASK_API}/v2/diffsSince/${cursor}`
export const FLUENT_LIST_URL =
  'https://cdn.jsdelivr.net/gh/conflux-fans/phishing-detect@main/config.json'

function parseFluentFullList(payload) {
  return {
    lists: createDomainSets({
      allowlist: payload?.whitelist,
      blocklist: payload?.blacklist,
    }),
  }
}

// Read the body only on 200; 304 means the cached list still applies.
export function createListFetcher(
  fetcher = initFetcher({
    retry: 0,
    timeout: 30_000,
    throwHttpErrors: false,
    cache: 'no-cache',
    redirect: 'error',
    referrerPolicy: 'no-referrer',
  }),
) {
  async function fetchFullList(url, etag, parse) {
    const response = await fetcher(url, {
      headers: etag ? {'If-None-Match': etag} : {},
    })
    if (etag && response.status === 304) return null
    if (response.status !== 200)
      throw new Error(`List request failed: ${response.status}`)
    return {...parse(await response.json()), etag: response.headers.get('etag')}
  }

  return {
    fetchMetaMaskFullList: etag =>
      fetchFullList(METAMASK_FULL_LIST_URL, etag, parseMetaMaskFullList),
    fetchFluentFullList: etag =>
      fetchFullList(FLUENT_LIST_URL, etag, parseFluentFullList),
    async fetchMetaMaskDiffs(current) {
      const response = await fetcher(getMetaMaskDiffsUrl(current.cursor))
      if (response.status !== 200)
        throw new Error(`Diff request failed: ${response.status}`)
      const {data} = await response.json()
      return applyMetaMaskDiffs(current, data)
    },
  }
}
