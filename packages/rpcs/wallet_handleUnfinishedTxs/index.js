/* eslint-disable no-empty */
import {optParam} from '@fluent-wallet/spec'

export const NAME = 'wallet_handleUnfinishedTxs'

export const schemas = {
  input: optParam,
}

export const permissions = {
  locked: true,
  methods: [
    'wallet_handleUnfinishedCFXTx',
    'wallet_handleUnfinishedETHTx',
    'wallet_handleUserOperation',
  ],
  db: ['getUnfinishedTx', 'getUnfinishedUserOperations'],
}

export const main = ({
  db: {getUnfinishedTx, getUnfinishedUserOperations},
  rpcs: {
    wallet_handleUnfinishedCFXTx,
    wallet_handleUnfinishedETHTx,
    wallet_handleUserOperation,
  },
}) => {
  const txs = getUnfinishedTx()
  txs.forEach(({tx, address, network}) => {
    if (network.type === 'cfx') {
      try {
        wallet_handleUnfinishedCFXTx(
          {network, networkName: network.name},
          {tx, address: address.eid},
        )
      } catch (err) {}
    } else {
      try {
        wallet_handleUnfinishedETHTx(
          {network, networkName: network.name},
          {tx, address: address.eid},
        )
      } catch (err) {}
    }
  })

  getUnfinishedUserOperations().forEach(({hash, networkId}) => {
    try {
      void wallet_handleUserOperation(
        {errorFallThrough: true},
        {hash, networkId},
      ).catch(() => {})
    } catch (err) {}
  })
}
