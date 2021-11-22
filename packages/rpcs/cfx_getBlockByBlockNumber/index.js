import {cat, epochTag, Uint, or, boolean} from '@fluent-wallet/spec'

export const NAME = 'cfx_getBlockByBlockNumber'

export const schemas = {
  input: [
    cat,
    [or, {doc: 'epoch tag or block number'}, epochTag, Uint],
    boolean,
  ],
}

export const permissions = {
  external: ['popup', 'inpage'],
  locked: true,
}

export const main = ({f, params}) => {
  return f(params)
}
