import {map, dbid, or, cat} from '@fluent-wallet/spec'
import {txSchema} from '@fluent-wallet/cfx_sign-transaction'

export const NAME = 'cfx_sendTransaction'

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

export const main = ({
  rpcs: {wallet_sendTransaction},
  params,
  _inpage,
  _popup,
  _internal,
}) => {
  return wallet_sendTransaction({_inpage, _popup, _internal}, params)
}
