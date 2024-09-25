import {optParam} from '@fluent-wallet/spec'

export const NAME = 'cfx_maxPriorityFeePerGas'

export const schemas = {
  input: optParam,
}

export const permissions = {
  locked: true,
  external: ['popup', 'inpage'],
}

export const main = async ({f, params}) => {
  return await f(params)
}
