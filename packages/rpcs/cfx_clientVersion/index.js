import {optParam} from '@fluent-wallet/spec'

export const NAME = 'cfx_clientVersion'

export const schemas = {
  input: optParam,
}

export const permissions = {
  external: ['popup', 'inpage'],
  locked: true,
}

export const main = ({f, params}) => {
  return f(params)
}
