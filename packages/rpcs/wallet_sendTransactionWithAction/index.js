import {Bytes32, Uint, enums, map, or} from '@fluent-wallet/spec'
import {schemas as CfxSendTxSchema} from '@fluent-wallet/cfx_send-transaction'
import {decodeEthRawTransaction} from '@fluent-wallet/signature'

import {buildEthereumReplacementTransaction} from './ethereum.js'

export const NAME = 'wallet_sendTransactionWithAction'

const actionSchema = [enums, 'cancel', 'speedup']

const cfxReplacementSchema = [
  map,
  {closed: true},
  ['tx', CfxSendTxSchema.input],
  ['action', actionSchema],
]

const ethereumReplacementSchema = [
  map,
  {closed: true},
  ['originalTxHash', Bytes32],
  ['action', actionSchema],
  ['gas', {optional: true}, Uint],
  ['gasPrice', {optional: true}, Uint],
  ['maxFeePerGas', {optional: true}, Uint],
  ['maxPriorityFeePerGas', {optional: true}, Uint],
]

export const schemas = {
  input: [or, cfxReplacementSchema, ethereumReplacementSchema],
}

export const permissions = {
  external: ['popup'],
  methods: ['wallet_sendTransaction'],
  db: ['queryqueryTx'],
}

export const main = ({
  Err: {InvalidParams},
  db: {queryqueryTx},
  rpcs: {wallet_sendTransaction},
  params,
  network,
}) => {
  if (network.type === 'cfx') {
    if (!params.tx) {
      throw InvalidParams('Invalid Conflux replacement parameters')
    }

    return wallet_sendTransaction({_sendAction: params.action}, params.tx)
  }

  if (network.type !== 'eth') {
    throw InvalidParams(`Unsupported network type ${network.type}`)
  }

  if (!params.originalTxHash) {
    throw InvalidParams('Invalid Ethereum replacement parameters')
  }

  const {
    action,
    originalTxHash,
    gas,
    gasPrice,
    maxFeePerGas,
    maxPriorityFeePerGas,
  } = params

  const storedTransaction = queryqueryTx({hash: originalTxHash})

  if (!storedTransaction?.raw) {
    throw InvalidParams(`Invalid original transaction ${originalTxHash}`)
  }

  const originalTransaction = decodeEthRawTransaction(
    storedTransaction.raw,
    network.chainId,
  )

  const transaction = buildEthereumReplacementTransaction({
    action,
    originalTransaction,
    gas,
    gasPrice,
    maxFeePerGas,
    maxPriorityFeePerGas,
  })

  return wallet_sendTransaction({_sendAction: action}, [transaction])
}
