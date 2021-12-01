import {map, Bytes32} from '@fluent-wallet/spec'
import {decode} from '@fluent-wallet/base32-address'

export const NAME = 'wallet_enrichConfluxTx'

export const schemas = {
  input: [map, {closed: true}, ['txhash', Bytes32]],
}

export const permissions = {
  external: [],
  locked: true,
  methods: ['wallet_validate20Token', 'wallet_refetchBalance'],
  db: ['getCfxTxsToEnrich', 't', 'isTokenInAddr'],
}

export const main = async ({
  db: {getCfxTxsToEnrich, t, isTokenInAddr},
  rpcs: {wallet_validate20Token, wallet_refetchBalance},
  params: {txhash},
}) => {
  const txData = getCfxTxsToEnrich({txhash})
  if (!txData) return

  const {tx, address, network, token, app} = txData
  const txExtraEid = tx.extra.eid
  const txs = []
  const {to, data, receipt} = tx.payload

  let noError = true

  if (token) {
    txs.push({eid: token.eid, token: {tx: tx.eid}})
    if (!isTokenInAddr({tokenId: token.eid, addressId: address.eid})) {
      txs.push({eid: token.eid, token: {tx: tx.eid}})
      if (app) txs.push({eid: token.eid, token: {fromApp: true}})
      else txs.push({eid: token.eid, token: {fromUser: true}})
    }
  }

  if (to) {
    const decoded = decode(to)
    if (decoded.type !== 'contract')
      txs.push({eid: txExtraEid, txExtra: {simple: true, ok: true}})
    else if (decoded.type === 'contract')
      txs.push({
        eid: txExtraEid,
        txExtra: {contractInteraction: true, ok: true},
      })
  }

  if (!to && data) {
    if (receipt) txs.push({eid: txExtraEid, txExtra: {contractCreation: true}})
    else
      txs.push({eid: txExtraEid, txExtra: {contractCreation: true, ok: true}})
  }

  if (to && data) {
    const contractAddress = to
    try {
      const {valid, symbol, name, decimals} = await wallet_validate20Token(
        {network, networkName: network.name, errorFallThrough: true},
        {tokenAddress: contractAddress},
      )
      if (valid) {
        txs.push(
          {eid: txExtraEid, txExtra: {token20: true}},
          {
            eid: 'newtoken',
            token: {
              name,
              symbol,
              decimals,
              tx: tx.eid,
              address: contractAddress,
            },
          },
          {eid: address.eid, address: {token: 'newtoken'}},
          {eid: network.eid, network: {token: 'newtoken'}},
        )
        if (app) txs.push({eid: 'newtoken', token: {fromApp: true}})
        else txs.push({eid: 'newtoken', token: {fromUser: true}})

        wallet_refetchBalance(
          {
            network,
            networkName: network.name,
            errorFallThrough: true,
          },
          [],
        )
      }
    } catch (err) {
      noError = false
    }
  }

  if (noError) {
    txs.length && t(txs)
  }
}
