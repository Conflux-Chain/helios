import 'cross-fetch/dist/node-polyfill.js'
import {fetch} from './fetcher.js'
import {getURL, isCoreNetworkId} from './utils.js'

export async function abi(opts = {}) {
  if (!Number.isInteger(opts.networkId))
    throw new Error('invalid networkId, must be a integer')

  if (isCoreNetworkId(opts.networkId)) return abiCoreSpace(opts)
  return abiESpace(opts)
}

export async function abiCoreSpace({
  networkId = undefined,
  address = undefined,
}) {
  try {
    const res = await fetch(getURL(networkId, 'contract', '/getabi'), {
      searchParams: {address},
    }).json()
    if (res.code === 0) return JSON.parse(res.data)
    throw new Error(res.message)
  } catch (err) {
    return
  }
}

export async function abiESpace({networkId = undefined, address = undefined}) {
  try {
    const res = await fetch(
      getURL(networkId, {module: 'contract', action: 'getabi', address}),
    ).json()
    if (res.status === '1') return JSON.parse(res.result)
    throw new Error(res.message)
  } catch (err) {
    return
  }
}
