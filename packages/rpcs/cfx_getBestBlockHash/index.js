import {optParam} from '@fluent-wallet/spec'

export const NAME = 'cfx_getBestBlockHash'

export const schemas = {
  input: optParam,
}

export const permissions = {
  external: ['popup', 'inpage'],
  locked: true,
}

export const cache = {
  type: 'epoch',
  key: () => NAME,
}

export const main = ({f, params}) => {
  return f(params)
}
