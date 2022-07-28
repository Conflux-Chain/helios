import {optParam} from '@fluent-wallet/spec'

export const NAME = 'wallet_enrichTxs'

export const schemas = {
  input: optParam,
}

export const permissions = {
  external: [],
  locked: true,
  methods: ['wallet_enrichConfluxTx', 'wallet_enrichEthereumTx'],
  db: ['getTxsToEnrich'],
}

export const main = ({
  db: {getTxsToEnrich},
  rpcs: {wallet_enrichConfluxTx, wallet_enrichEthereumTx},
}) => {
  const enrichFn = {cfx: wallet_enrichConfluxTx, eth: wallet_enrichEthereumTx}
  const txsToEnrich = getTxsToEnrich()
  txsToEnrich.forEach(({tx, network}) => {
    try {
      enrichFn[network.type]({errorFallThrough: true}, {txhash: tx.hash})
    } catch (err) {} // eslint-disable-line no-empty
  })
}
