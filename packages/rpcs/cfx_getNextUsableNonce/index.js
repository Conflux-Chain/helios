import {cat, base32UserAddress} from '@fluent-wallet/spec'

export const NAME = 'cfx_getNextUsableNonce'

export const schemas = {
  input: [cat, base32UserAddress],
}

export const permissions = {
  external: ['popup', 'inpage'],
  locked: true,
  methods: ['cfx_getNextNonce', 'txpool_nextNonce'],
}

export const main = async ({
  rpcs: {cfx_getNextNonce, txpool_nextNonce},
  params,
}) => {
  try {
    return await txpool_nextNonce({errorFallThrough: true}, params)
  } catch (err) {
    return await cfx_getNextNonce({errorFallThrough: true}, params)
  }
}
