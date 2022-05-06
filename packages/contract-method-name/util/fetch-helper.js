import {initFetcher} from '@fluent-wallet/fetch-rpc'

const fetcher = initFetcher()

function fetchHelper(url) {
  return fetcher
    .get(url)
    .json()
    .catch(() => null)
}

export default fetchHelper
