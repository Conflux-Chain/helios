import {map, Bytes32} from '@fluent-wallet/spec'
import {decode} from '@fluent-wallet/base32-address'
import {getCFXContractMethodSignature} from '@fluent-wallet/contract-method-name'

export const NAME = 'wallet_enrichConfluxTx'

export const schemas = {
  input: [map, {closed: true}, ['txhash', Bytes32]],
}

export const permissions = {
  external: [],
  locked: true,
  methods: ['wallet_validate20Token', 'wallet_refetchBalance'],
  db: ['getTxsToEnrich', 't', 'isTokenInAddr', 'newtokenTx'],
}

export const main = async ({
  db: {getTxsToEnrich, t, isTokenInAddr, newtokenTx},
  rpcs: {wallet_validate20Token, wallet_refetchBalance},
  params: {txhash},
}) => {
  // 这里是从数据库根据hash查一下相关的数据
  const txData = getTxsToEnrich({txhash, type: 'cfx'})
  if (!txData) return

  const {tx, address, network, token, app} = txData
  const txExtraEid = tx.txExtra.eid
  const txs = []
  const {to, data, receipt} = tx.txPayload
  let decoded

  let noError = true
  // 如果是发送token的话要把tx 插入 token schema 中
  if (token) {
    txs.push({eid: token.eid, token: {tx: tx.eid}})
    if (!isTokenInAddr({tokenId: token.eid, addressId: address.eid})) {
      txs.push({eid: token.eid, token: {tx: tx.eid}})
      if (app) txs.push({eid: token.eid, token: {fromApp: true}})
      else txs.push({eid: token.eid, token: {fromUser: true}})
    }
  }

  if (to) {
    decoded = decode(to)
    if (
      decoded.type === 'user' ||
      decoded.hexAddress === '0x0000000000000000000000000000000000000000' ||
      !data
    )
      txs.push({eid: txExtraEid, txExtra: {simple: true, ok: true}})
    else if (decoded.type !== 'user')
      txs.push({
        eid: txExtraEid,
        txExtra: {contractInteraction: true, ok: true},
      })
  }

  if (!to && data) {
    // ??
    if (receipt) txs.push({eid: txExtraEid, txExtra: {contractCreation: true}})
    else
      txs.push({eid: txExtraEid, txExtra: {contractCreation: true, ok: true}})
  }
  // 20 token 交易
  if (to && data && decoded.type === 'contract') {
    const contractAddress = to
    try {
      // wallet_validate20Token 通过 call 调用 name symbol decimals 方法 来判断是不是20token
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
          const {name, args} = await getCFXContractMethodSignature(
            to,
            data,
            network.netId,
          )
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
