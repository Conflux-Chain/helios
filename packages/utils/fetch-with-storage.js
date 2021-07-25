import {getStorageItem, setStorageItem} from './storage-helper'
import {MINUTE} from '@cfxjs/fluent-wallet-consts'

import {initFetcher} from '@cfxjs/fetch-rpc'

const fetcher = initFetcher()

export default async (
  method,
  url,
  fetchOptions = {},
  {cacheRefreshTime = MINUTE * 6} = {},
) => {
  const currentTime = Date.now()
  const cacheKey = `cachedFetch:${url}`
  const {cachedResponse, cachedTime} = getStorageItem(cacheKey) || {}
  if (cachedResponse && currentTime - cachedTime < cacheRefreshTime) {
    return cachedResponse
  }
  const response = await fetcher[method.toLowerCase()](url, {
    referrerPolicy: 'no-referrer-when-downgrade',
    body: null,
    ...fetchOptions,
  })
  if (response?.ok) {
    const responseJson = await response.json()
    const cacheEntry = {
      cachedResponse: responseJson,
      cachedTime: currentTime,
    }

    setStorageItem(cacheKey, cacheEntry)
    return responseJson
  }
  return null
}
