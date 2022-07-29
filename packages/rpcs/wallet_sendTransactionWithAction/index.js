import {map, enums} from '@fluent-wallet/spec'

import {schemas as SendTxSchema} from '@fluent-wallet/wallet_send-transaction'

export const NAME = 'wallet_sendTransactionWithAction'

export const schemas = {
  input: [
    map,
    {closed: true},
    ['tx', SendTxSchema.input],
    ['action', [enums, 'cancel', 'speedUp']],
  ],
}

export const permissions = {
  external: ['popup'],
  methods: ['wallet_sendTransaction'],
}

export const main = ({
  rpcs: {wallet_sendTransaction},
  params: {action, tx},
}) => {
  return wallet_sendTransaction({_sendAction: action}, tx)
}
