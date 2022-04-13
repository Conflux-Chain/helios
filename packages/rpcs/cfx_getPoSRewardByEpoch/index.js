import {cat, Uint} from '@fluent-wallet/spec'

export const NAME = 'cfx_getPoSRewardByEpoch'

export const schemas = {
  input: [cat, Uint],
}

export const permissions = {
  external: ['popup', 'inpage'],
  locked: true,
  methods: [],
  db: [],
}

export const main = ({f, params}) => {
  return f(params)
}
