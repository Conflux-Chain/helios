import {base32Address, cat, epochRefNoMined} from '@fluent-wallet/spec'

export const NAME = 'cfx_getVoteList'

export const schemas = {
  input: [cat, base32Address, epochRefNoMined],
}

export const permissions = {
  external: ['popup', 'inpage'],
  locked: true,
}

export const main = ({f, params}) => {
  return f(params)
}
