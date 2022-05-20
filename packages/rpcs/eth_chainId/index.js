import {optParam} from '@fluent-wallet/spec'

export const NAME = 'eth_chainId'

export const schemas = {
  input: optParam,
}

export const permissions = {
  external: ['popup', 'inpage'],
  db: ['getOneNetwork'],
  locked: true,
}

export const cache = {
  type: 'ttl',
  ttl: 24 * 60 * 60 * 1000, // 1 day
  key: () => NAME,
}

export const main = async ({f, db: {getOneNetwork}, params, _inpage, app}) => {
  if (
    _inpage &&
    ((app && app.currentNetwork.type === 'cfx') ||
      getOneNetwork({selected: true}).type === 'cfx')
  ) {
    return '0x' + Number.MAX_SAFE_INTEGER.toString(16)
  }
  return await f(params)
}
