import {map, dbid, or, cat} from '@fluent-wallet/spec'
import {txSchema} from '@fluent-wallet/cfx_sign-transaction'
import {getTxHashFromRawTx} from '@fluent-wallet/signature'
import {ERROR} from '@fluent-wallet/json-rpc-error'
import {CFX_MAINNET_NAME} from '@fluent-wallet/consts'
import {BigNumber} from '@ethersproject/bignumber'

export const NAME = 'cfx_sendTransaction'

export const schemas = {
  input: [
    or,
    [cat, txSchema],
    [map, {closed: true}, ['authReqId', dbid], ['tx', [cat, txSchema]]],
  ],
}

export const permissions = {
  external: ['popup', 'inpage'],
  methods: [
    'cfx_signTransaction',
    'cfx_gasPrice',
    'wallet_addPendingUserAuthRequest',
    'wallet_userApprovedAuthRequest',
    'wallet_userRejectedAuthRequest',
    'wallet_handleUnfinishedCFXTx',
    'wallet_enrichConfluxTx',
  ],
  db: ['findAddress', 'getAuthReqById', 'getAddrTxByHash', 't'],
}

export const main = async ({
  Err: {InvalidParams, Server},
  db: {findAddress, getAuthReqById, getAddrTxByHash, t},
  rpcs: {
    wallet_userRejectedAuthRequest,
    wallet_enrichConfluxTx,
    cfx_gasPrice,
    cfx_signTransaction,
    wallet_addPendingUserAuthRequest,
    wallet_userApprovedAuthRequest,
    wallet_handleUnfinishedCFXTx,
  },
  params,
  _inpage,
  app,
  network,
}) => {
  if (_inpage) {
    if (params.authReqId) throw InvalidParams('Invalid tx data')

    const [{from}] = params

    // check that from address is authed to the app
    if (
      !findAddress({
        value: from,
        appId: app.eid,
      })?.length
    )
      throw InvalidParams(`Invalid from address in tx ${from}`)

    delete params[0].nonce
    try {
      // try sign tx
      await cfx_signTransaction({errorFallThrough: true}, [
        ...params,
        {dryRun: true},
      ])
    } catch (err) {
      if (err?.code === ERROR.USER_REJECTED.code) throw err
      err.message = `Error while processing tx.\nparams:\n${JSON.stringify(
        params,
        null,
        2,
      )}\nerror:\n${err.message}`

      throw err
    }

    if (app.currentNetwork.name === CFX_MAINNET_NAME) {
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
      req: {method: NAME, params},
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
  let addr = findAddress({
    // filter by app.currentNetwork and app.currentAccount
    appId: authReq?.app?.eid,
    // filter by current network
    networkId: !authReqId && network.eid,
    value: tx[0].from,
  })
  addr = addr[0] || addr
  if (!addr) throw InvalidParams(`Invalid from address ${tx[0].from}`)

  let signed
  try {
    signed = await cfx_signTransaction(
      {
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

  if (duptx) throw InvalidParams('duplicate tx')

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
    {eid: addr, address: {tx: 'newTxId'}},
    authReqId && {eid: authReq.app.eid, app: {tx: 'newTxId'}},
  ]

  const {
    tempids: {newTxId},
  } = t(dbtxs)

  try {
    wallet_enrichConfluxTx(
      {
        errorFallThrough: true,
        network: authReqId ? authReq.app.currentNetwork : network,
      },
      {txhash},
    )
  } catch (err) {} // eslint-disable-line no-empty

  return await new Promise((resolve, reject) => {
    wallet_handleUnfinishedCFXTx(
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
