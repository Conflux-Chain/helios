import {or} from '@fluent-wallet/spec'
import {schemas as cfxSchema} from '@fluent-wallet/cfx_send-transaction'
import {schemas as ethSchema} from '@fluent-wallet/eth_send-transaction'
import {getTxHashFromRawTx} from '@fluent-wallet/signature'
import {ERROR} from '@fluent-wallet/json-rpc-error'
import {CFX_MAINNET_NAME} from '@fluent-wallet/consts'
import {BigNumber} from '@ethersproject/bignumber'
import {ETH_TX_TYPES} from '@fluent-wallet/consts'

export const NAME = 'wallet_sendTransaction'

export const schemas = {
  input: [or, cfxSchema.input, ethSchema.input],
}

export const permissions = {
  external: ['popup', 'inpage'],
  methods: [
    'cfx_signTransaction',
    'eth_signTransaction',
    'eth_blockNumber',
    'cfx_gasPrice',
    'wallet_addPendingUserAuthRequest',
    'wallet_userApprovedAuthRequest',
    'wallet_userRejectedAuthRequest',
    'wallet_handleUnfinishedCFXTx',
    'wallet_handleUnfinishedETHTx',
    'wallet_enrichConfluxTx',
    'wallet_enrichEthereumTx',
  ],
  db: ['findAddress', 'getAuthReqById', 'getAddrTxByHash', 't'],
}

export const main = async ({
  Err: {InvalidParams, Server},
  db: {findAddress, getAuthReqById, getAddrTxByHash, t},
  rpcs: {
    wallet_userRejectedAuthRequest,
    wallet_enrichConfluxTx,
    wallet_enrichEthereumTx,
    eth_blockNumber,
    cfx_gasPrice,
    cfx_signTransaction,
    eth_signTransaction,
    wallet_addPendingUserAuthRequest,
    wallet_userApprovedAuthRequest,
    wallet_handleUnfinishedCFXTx,
    wallet_handleUnfinishedETHTx,
  },
  params,
  _inpage,
  app,
  network,
}) => {
  let handleUnfinishedTxFn, signTxFn, enrichTxFn
  if (network.type === 'cfx') {
    handleUnfinishedTxFn = wallet_handleUnfinishedCFXTx
    signTxFn = cfx_signTransaction
    enrichTxFn = wallet_enrichConfluxTx
  } else {
    handleUnfinishedTxFn = wallet_handleUnfinishedETHTx
    signTxFn = eth_signTransaction
    enrichTxFn = wallet_enrichEthereumTx
  }

  if (_inpage) {
    if (params.authReqId) throw InvalidParams('Invalid tx data')
    if (params[0].gasLimit) {
      if (!params[0].gas) params[0].gas = params[0].gasLimit
      delete params[0].gasLimit
    }

    if (params[0].gas && BigNumber.from(params[0].gas).lt(21000)) {
      params[0].gas = '0x5208'
    }

    const [{from}] = params

    // check that from address is authed to the app
    if (
      !findAddress({
        value: from,
        appId: app.eid,
      })
    )
      throw InvalidParams(`Invalid from address in tx ${from}`)

    delete params[0].nonce
    if (params[0].type === ETH_TX_TYPES.EIP1559 && params[0].gasPrice) {
      delete params[0].gasPrice
    }
    try {
      // try sign tx
      await signTxFn(
        {app, network: app.currentNetwork, errorFallThrough: true},
        [...params, {dryRun: true}],
      )
    } catch (err) {
      if (err?.code === ERROR.USER_REJECTED.code) throw err
      if (!err?.data?.estimateError) {
        err.message = `Error while processing tx.\nparams:\n${JSON.stringify(
          params,
          null,
          2,
        )}\nerror:\n${err.message}`

        throw err
      }
    }

    if (
      network.type === 'cfx' &&
      app.currentNetwork.name === CFX_MAINNET_NAME
    ) {
      try {
        const gasPrice = await cfx_gasPrice({errorFallThrough: true}, [])
        if (
          BigNumber.from(gasPrice).gt(
            BigNumber.from(params[0].gasPrice || '0x0'),
          )
        ) {
          params[0].gasPrice = gasPrice
        }
      } catch (err) {} // eslint-disable-line no-empty
    }

    return await wallet_addPendingUserAuthRequest({
      appId: app.eid,
      req: {method: NAME, accountId: app.currentAccount.eid, params},
    })
  }

  const authReqId = params?.authReqId
  let authReq
  if (authReqId) {
    authReq = getAuthReqById(authReqId)
    if (!authReq) throw InvalidParams(`Invalid authReqId ${authReqId}`)
    if (authReq.processed)
      throw InvalidParams(`Already processing auth req ${authReqId}`)
    t({eid: authReqId, authReq: {processed: true}})
  }

  // tx array [tx]
  const tx = params.authReqId ? params.tx : params
  if (tx[0].gasLimit) {
    if (!tx[0].gas) tx[0].gas = tx[0].gasLimit
    delete tx[0].gasLimit
  }
  const addr = findAddress({
    // filter by app.currentNetwork and app.currentAccount
    appId: authReq?.app?.eid,
    selected: !authReqId ? true : undefined,
    // filter by current network
    networkId: !authReqId ? network.eid : authReq.app.currentNetwork.eid,
    value: tx[0].from,
  })
  if (!addr) throw InvalidParams(`Invalid from address ${tx[0].from}`)

  let signed
  try {
    signed = await signTxFn(
      {
        app: authReqId ? authReq.app : undefined,
        network: authReqId ? authReq.app.currentNetwork : network,
        errorFallThrough: true,
      },
      tx.concat({
        returnTxMeta: true,
      }),
    )
  } catch (err) {
    if (authReqId) await wallet_userRejectedAuthRequest({authReqId})
    throw err
  }

  if (!signed) {
    if (authReqId) await wallet_userRejectedAuthRequest({authReqId})
    throw Server(`Server error while signning tx`)
  }
  const {raw: rawtx, txMeta} = signed
  const txhash = getTxHashFromRawTx(rawtx)
  const duptx = getAddrTxByHash({addressId: addr, txhash})

  if (duptx) {
    if (authReqId) await wallet_userRejectedAuthRequest({authReqId})
    throw InvalidParams('duplicate tx')
  }

  const blockNumber =
    network.type === 'eth' &&
    (await eth_blockNumber({errorFallThrough: true}, []))
  const dbtxs = [
    {eid: 'newTxPayload', txPayload: txMeta},
    {eid: 'newTxExtra', txExtra: {ok: false}},
    {
      eid: 'newTxId',
      tx: {
        fromFluent: true,
        txPayload: 'newTxPayload',
        hash: txhash,
        raw: rawtx,
        status: 0,
        created: new Date().getTime(),
        txExtra: 'newTxExtra',
      },
    },
    blockNumber && {eid: 'newTxId', tx: {blockNumber}},
    {eid: addr, address: {tx: 'newTxId'}},
    authReqId && {eid: authReq.app.eid, app: {tx: 'newTxId'}},
  ]
  const {
    tempids: {newTxId},
  } = t(dbtxs)

  try {
    enrichTxFn(
      {
        errorFallThrough: true,
        network: authReqId ? authReq.app.currentNetwork : network,
      },
      {txhash},
    )

    // eslint-disable-next-line no-empty
  } catch (err) {}
  return await new Promise((resolve, reject) => {
    handleUnfinishedTxFn(
      {network: authReqId ? authReq.app.currentNetwork : network},
      {
        tx: newTxId,
        address: addr,
        okCb: rst => {
          if (params.authReqId) {
            return wallet_userApprovedAuthRequest({
              authReqId: params.authReqId,
              res: rst,
            }).then(resolve)
          }
          resolve(rst)
        },
        failedCb: err => {
          if (params.authReqId) {
            return wallet_userApprovedAuthRequest({
              authReqId: params.authReqId,
              res: err,
            }).then(resolve)
          }
          reject(err)
        },
      },
    )
  })
}
