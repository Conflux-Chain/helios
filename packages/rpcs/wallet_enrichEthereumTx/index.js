import {map, Bytes32} from '@fluent-wallet/spec'
import {getEthContractMethodSignature} from '@fluent-wallet/contract-method-name'

export const NAME = 'wallet_enrichEthereumTx'

export const schemas = {
  input: [map, {closed: true}, ['txhash', Bytes32]],
}

export const permissions = {
  external: [],
  locked: true,
  methods: [
    'wallet_validate20Token',
    'wallet_refetchBalance',
    'wallet_detectAddressType',
  ],
  db: ['getTxsToEnrich', 't', 'isTokenInAddr', 'newtokenTx'],
}

export const main = async ({
  db: {getTxsToEnrich, t, isTokenInAddr, newtokenTx},
  rpcs: {
    wallet_validate20Token,
    wallet_refetchBalance,
    wallet_detectAddressType,
  },
  params: {txhash},
}) => {
  const txData = getTxsToEnrich({txhash, type: 'eth'})
  if (!txData) return

  const {tx, address, network, token, app} = txData
  const txExtraEid = tx.txExtra.eid
  const txs = []
  const {to, data, receipt} = tx.txPayload

  let noError = true

  if (token) {
    txs.push({eid: token.eid, token: {tx: tx.eid}})
    if (!isTokenInAddr({tokenId: token.eid, addressId: address.eid})) {
      txs.push({eid: token.eid, token: {tx: tx.eid}})
      if (app) txs.push({eid: token.eid, token: {fromApp: true}})
      else txs.push({eid: token.eid, token: {fromUser: true}})
    }
  }

  let toAddressType

  if (to) {
    toAddressType = await wallet_detectAddressType(
      {networkName: network.name},
      {address: to},
    )
    if (!toAddressType.contract || !data)
      txs.push({eid: txExtraEid, txExtra: {simple: true, ok: true}})
    else if (toAddressType.contract)
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

  if (to && data && toAddressType.contract) {
    const contractAddress = to
    try {
      const {valid, symbol, name, decimals} = await wallet_validate20Token(
        {network, networkName: network.name, errorFallThrough: true},
        {tokenAddress: contractAddress},
      )
      if (valid) {
        const tokenTx = newtokenTx({
          eid: 'newtoken',
          name,
          symbol,
          decimals,
          tx: tx.eid,
          network: network.eid,
          address: contractAddress,
        })
        txs.push({eid: txExtraEid, txExtra: {token20: true}}, tokenTx, {
          eid: address.eid,
          address: {token: tokenTx.eid},
        })
        if (app) txs.push({eid: tokenTx.eid, token: {fromApp: true}})
        else txs.push({eid: tokenTx.eid, token: {fromUser: true}})

        try {
          const {name, args} = await getEthContractMethodSignature(data)
          switch (name) {
            case 'transfer':
            case 'approve':
            case 'send':
              txs.push({
                eid: txExtraEid,
                txExtra: {
                  // moreInfo: {args: [...args]},
                  address: args[0].toLowerCase(),
                  method: name,
                },
              })
              break
          }
        } catch (err) {} // eslint-disable-line no-empty

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
