import {Bytes32, Uint, enums, map} from '@fluent-wallet/spec'
import {
  decodeCfxRawTransaction,
  decodeEthRawTransaction,
} from '@fluent-wallet/signature'

import {buildConfluxReplacementTransaction} from './conflux.js'
import {buildEthereumReplacementTransaction} from './ethereum.js'

export const NAME = 'wallet_sendTransactionWithAction'

const actionSchema = [enums, 'cancel', 'speedup']

export const schemas = {
  input: [
    map,
    {closed: true},
    ['originalTxHash', Bytes32],
    ['action', actionSchema],
    ['gas', {optional: true}, Uint],
    ['gasPrice', {optional: true}, Uint],
    ['storageLimit', {optional: true}, Uint],
    ['maxFeePerGas', {optional: true}, Uint],
    ['maxPriorityFeePerGas', {optional: true}, Uint],
  ],
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
  if (network.type !== 'cfx' && network.type !== 'eth') {
    throw InvalidParams(`Unsupported network type ${network.type}`)
  }

  const {
    action,
    originalTxHash,
    gas,
    gasPrice,
    storageLimit,
    maxFeePerGas,
    maxPriorityFeePerGas,
  } = params

  const storedTransaction = queryqueryTx({hash: originalTxHash})

  if (!storedTransaction?.raw) {
    throw InvalidParams(`Invalid original transaction ${originalTxHash}`)
  }

  const originalTransaction =
    network.type === 'cfx'
      ? decodeCfxRawTransaction(storedTransaction.raw)
      : decodeEthRawTransaction(storedTransaction.raw, network.chainId)

  const transaction =
    network.type === 'cfx'
      ? buildConfluxReplacementTransaction({
          action,
          originalTransaction,
          gas,
          gasPrice,
          storageLimit,
          maxFeePerGas,
          maxPriorityFeePerGas,
        })
      : buildEthereumReplacementTransaction({
          action,
          originalTransaction,
          gas,
          gasPrice,
          maxFeePerGas,
          maxPriorityFeePerGas,
        })

  return wallet_sendTransaction({_sendAction: action}, [transaction])
}
