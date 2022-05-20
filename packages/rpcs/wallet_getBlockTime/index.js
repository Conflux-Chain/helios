import {optParam} from '@fluent-wallet/spec'

export const NAME = 'wallet_getBlockTime'

export const schemas = {
  input: optParam,
}

export const permissions = {
  external: ['popup', 'inpage'],
  locked: true,
  methods: ['cfx_epochNumber', 'eth_blockNumber'],
  db: [],
}

async function waitms(ms = 200) {
  return new Promise(r => setTimeout(r, ms))
}

async function waitTillChanged(initial, getFn, interval) {
  let rst
  let changed = false
  while (!changed) {
    rst = await getFn({_cacheConf: {type: null}}, [])
    if (rst !== initial) {
      changed = true
      break
    }
    await waitms(interval)
  }

  return rst
}

export const main = async ({
  rpcs: {cfx_epochNumber, eth_blockNumber},
  network,
}) => {
  const getNumber = network.type === 'cfx' ? cfx_epochNumber : eth_blockNumber
  const waitms = network.type === 'cfx' ? 200 : 500

  let initial = await getNumber({_cacheConf: {type: null}}, [])
  initial = await waitTillChanged(initial, getNumber, waitms)

  const initTime = new Date().getTime()
  initial = await waitTillChanged(initial, getNumber, waitms)
  await waitTillChanged(initial, getNumber, waitms)

  return Math.floor((new Date().getTime() - initTime) / 2)
}
