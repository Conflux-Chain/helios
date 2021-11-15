import {enums, cat, or, Uint} from '@fluent-wallet/spec'

export const NAME = 'cfx_getBlockRewardInfo'

export const schemas = {
  input: [cat, [or, [enums, 'latest_checkpoint'], Uint]],
}

export const permissions = {
  external: ['popup', 'inpage'],
  locked: true,
}

export const main = ({f, params}) => {
  return f(params)
}
