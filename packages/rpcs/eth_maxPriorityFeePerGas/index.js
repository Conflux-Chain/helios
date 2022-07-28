import {optParam} from '@fluent-wallet/spec'

export const NAME = 'eth_maxPriorityFeePerGas'

export const schemas = {
  input: optParam,
}

export const permissions = {
  external: ['popup', 'inpage'],
  locked: true,
}

export const main = async ({f}) => {
  return await f([])
}
