import {optParam} from '@fluent-wallet/spec'

export const NAME = 'wallet_enrichConfluxTxs'

export const schemas = {
  input: optParam,
}

export const permissions = {
  external: [],
  locked: true,
  methods: ['wallet_enrichConfluxTx'],
  db: ['getCfxTxsToEnrich'],
}

export const main = ({
  db: {getCfxTxsToEnrich},
  rpcs: {wallet_enrichConfluxTx},
}) => {
  const txsToEnrich = getCfxTxsToEnrich()
  txsToEnrich.forEach(({tx}) => {
    try {
      wallet_enrichConfluxTx({errorFallThrough: true}, {txhash: tx.hash})
    } catch (err) {} // eslint-disable-line no-empty
  })
}
