import {
  or,
  map,
  dbid,
  cat,
  enums,
  ethHexAddress,
  hex,
} from '@fluent-wallet/spec'
import {txSchema} from '@fluent-wallet/eth_sign-transaction'

export const NAME = 'eth_sendTransaction'

const tokenPaySchema = [
  map,
  {closed: true},
  ['gasTokenAddress', ethHexAddress],
  ['gasLevel', [enums, 'low', 'medium', 'high']],
  ['maxTokenCost', hex],
]

export const schemas = {
  input: [
    or,
    [cat, txSchema],
    [map, {closed: true}, ['authReqId', dbid], ['tx', [cat, txSchema]]],
    // Token pay gas
    [
      map,
      {closed: true},
      ['authReqId', dbid],
      ['tx', [cat, txSchema]],
      ['tokenPay', tokenPaySchema],
    ],
    // 4337 sponsored tx
    [
      map,
      {closed: true},
      ['authReqId', {optional: true}, dbid],
      ['tx', [cat, txSchema]],
      ['gasPayment', [enums, 'sponsored']],
      [
        'approvedDelegationAction',
        {optional: true},
        [enums, 'upgrade', 'switch'],
      ],
    ],
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
