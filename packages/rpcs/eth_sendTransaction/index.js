import {or, map, dbid, cat} from '@fluent-wallet/spec'
import {txSchema} from '@fluent-wallet/eth_sign-transaction'

export const NAME = 'eth_sendTransaction'

export const schemas = {
  input: [
    or,
    [cat, txSchema],
    [map, {closed: true}, ['authReqId', dbid], ['tx', [cat, txSchema]]],
  ],
}

export const permissions = {
  external: ['popup', 'inpage'],
  methods: ['wallet_sendTransaction'],
  db: [],
}

export const main = ({rpcs: {wallet_sendTransaction}, params}) => {
  return wallet_sendTransaction(params)
}
