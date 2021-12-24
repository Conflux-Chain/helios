import {optParam} from '@fluent-wallet/spec'
import {CFX_MAINNET_NAME} from '@fluent-wallet/consts'

export const NAME = 'cfx_gasPrice'

export const schemas = {
  input: optParam,
}

export const permissions = {
  external: ['popup', 'inpage'],
  locked: true,
}

export const cache = {
  type: 'ttl',
  key: () => NAME,
}

async function gasStationFastest(gasPrice) {
  gasPrice = gasPrice || '0x0'
  if (typeof window !== undefined && typeof window.fetch === 'function') {
    const res = await fetch('https://main.confluxrpc.com/', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        id: 1,
        jsonrpc: '2.0',
        method: 'gasstation_price',
        params: [],
      }),
    }).then(res => res.json())
    if (res && res.result) {
      if (res.result.fastest > gasPrice) {
        gasPrice = res.result.fastest
      }
    } else {
      gasPrice = '0x3b9aca00'
    }
  } else {
    gasPrice = '0x3b9aca00'
  }

  return gasPrice
}

export const main = async ({network, f}) => {
  if (network.name === CFX_MAINNET_NAME) {
    return await gasStationFastest()
  }
  return await f()
}
