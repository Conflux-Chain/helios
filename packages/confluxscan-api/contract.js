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
    const res = await fetch(getURL(networkId, '/api'), {
      searchParams: {
        module: 'contract',
        action: 'getabi',
        address,
      },
    }).json()
    if (res.status === '1') return JSON.parse(res.result)
    throw new Error(res.message)
  } catch (err) {
    return
  }
}

export async function decodeContractMethods({
  networkId,
  contractAddress,
  inputData,
}) {
  try {
    const res = await fetch(getURL(networkId, '/util/decode/method/raw'), {
      searchParams: {contracts: contractAddress, inputs: inputData},
    }).json()

    // Core Space and eSpace Scan APIs use different response formats.
    if (isCoreNetworkId(networkId)) {
      return res.code === 0 ? res.data : []
    }

    return res.status === '1' ? res.result : []
  } catch {
    return []
  }
}
