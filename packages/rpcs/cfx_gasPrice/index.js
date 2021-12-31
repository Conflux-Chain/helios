import {optParam} from '@fluent-wallet/spec'
import {CFX_MAINNET_NAME} from '@fluent-wallet/consts'
import {TLRUCache} from '@thi.ng/cache'

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

const Cache = new TLRUCache(null, {ttl: 1000 * 60 * 60 * 2})

export const main = async ({network, f}) => {
  if (network.name === CFX_MAINNET_NAME) {
    let c = Cache.get('default gas price')
    if (c) return c
    if (typeof window !== undefined && typeof window.fetch === 'function') {
      try {
        c = await window
          .fetch(
            'https://cdn.jsdelivr.net/gh/conflux-fans/fluent-default-config/config.json',
          )
          .then(res => res.json())
          .then(res => res.gasPrice)
        if (Number.isInteger(c)) c = `0x${c.toString(16)}`
      } catch (err) {} // eslint-disable-line no-empty

      if (c) {
        Cache.set('default gas price', c)
        return c
      }
    }
  }
  return await f()
}
