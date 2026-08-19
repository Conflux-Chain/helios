import {or} from '@fluent-wallet/spec'
import {schemas as cfxSchema} from '@fluent-wallet/cfx_send-transaction'
import {schemas as ethSchema} from '@fluent-wallet/eth_send-transaction'
import {getTxHashFromRawTx} from '@fluent-wallet/signature'
import {
  resolveTransactionNonces,
  withConfluxNonceLock,
  withEthereumNonceLock,
} from '@fluent-wallet/nonce-manager'
import {ERROR} from '@fluent-wallet/json-rpc-error'
import {CFX_MAINNET_NAME} from '@fluent-wallet/consts'
import {BigNumber} from '@ethersproject/bignumber'
import {ETH_TX_TYPES, TOKEN_PAY_ERROR_CODES} from '@fluent-wallet/consts'

export const NAME = 'wallet_sendTransaction'

const EIP7702_AUTHORIZATION_DB_FIELDS = [
  'chainId',
  'address',
  'nonce',
  'yParity',
  'r',
  's',
]

function formatEip7702AuthorizationForDb(authorization) {
  return {
    eip7702Authorization: EIP7702_AUTHORIZATION_DB_FIELDS.reduce(
      (formattedAuthorization, key) => {
        if (authorization[key] !== undefined)
          formattedAuthorization[key] = authorization[key]
        return formattedAuthorization
      },
      {},
    ),
  }
}

function formatTxPayloadForDb(txMeta) {
  if (!txMeta.authorizationList) return txMeta

  return {
    ...txMeta,
    authorizationList: txMeta.authorizationList.map(
      formatEip7702AuthorizationForDb,
    ),
  }
}

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
    'wallet_submitTokenPayTransaction',

    'wallet_sendUserOperation',

    'wallet_getConfluxNonceState',
    'wallet_getEthereumNonceState',
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
    wallet_submitTokenPayTransaction,
    wallet_sendUserOperation,
    wallet_getConfluxNonceState,
    wallet_getEthereumNonceState,
  },
  params,
  _inpage,
  _popup,
  _sendAction,
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
    if (
      params[0].authorizationList ||
      params[0].type === ETH_TX_TYPES.EIP7702
    ) {
      throw InvalidParams(
        'Dapp-initiated EIP-7702 transactions are not supported yet',
      )
    }
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

  const tx = Array.isArray(params) ? params : params.tx
  const txParams = tx[0]

  const transactionNetwork = authReqId ? authReq.app.currentNetwork : network

  if (txParams.gasLimit) {
    if (!txParams.gas) txParams.gas = txParams.gasLimit
    delete txParams.gasLimit
  }
  const addressRecord = findAddress({
    // Resolve the address and its signing account from the same wallet context.
    appId: authReq?.app?.eid,
    selected: !authReqId ? true : undefined,
    networkId: transactionNetwork.eid,
    value: txParams.from,
    accountG: {
      eid: 1,
    },
  })

  if (!addressRecord) {
    throw InvalidParams(`Invalid from address ${txParams.from}`)
  }

  const addr = addressRecord.eid
  const accountId = addressRecord.account.eid

  if (params.tokenPay) {
    if (!authReqId) {
      throw InvalidParams('tokenPay is only supported for dapp approval')
    }

    try {
      return await wallet_submitTokenPayTransaction(
        {errorFallThrough: true},
        {
          authReqId,
          tx,
          tokenPay: params.tokenPay,
        },
      )
    } catch (err) {
      const errorData = err?.data || err?.extra

      if (errorData?.code === TOKEN_PAY_ERROR_CODES.QUOTE_CHANGED) {
        t({eid: authReqId, authReq: {processed: false}})
        throw err
      }

      await wallet_userRejectedAuthRequest({authReqId, error: err})
      throw err
    }
  }

  if (params.gasPayment === 'sponsored' && !authReqId) {
    const submission = await wallet_sendUserOperation(
      {
        errorFallThrough: true,
        network: transactionNetwork,
      },
      {
        accountId,
        networkId: transactionNetwork.eid,
        ...(params.approvedDelegationAction
          ? {
              approvedDelegationAction: params.approvedDelegationAction,
            }
          : {}),

        calls: [
          {
            to: txParams.to,
            value: txParams.value ?? '0x0',
            data: txParams.data ?? '0x',
          },
        ],
        sponsorship: 'whitelist',
      },
    )

    const {userOpHash} = submission

    return userOpHash
  }

  const createPendingTransaction = async ({transaction}) => {
    const signed = await signTxFn(
      {
        app: authReqId ? authReq.app : undefined,
        network: transactionNetwork,
        errorFallThrough: true,
      },
      [
        transaction,
        {
          returnTxMeta: true,
        },
      ],
    )

    if (!signed) {
      throw Server(`Server error while signning tx`)
    }

    const {raw: rawtx, txMeta} = signed

    const txPayload = formatTxPayloadForDb(txMeta)
    const txhash = getTxHashFromRawTx(rawtx)
    const duptx = getAddrTxByHash({addressId: addr, txhash})

    if (duptx) {
      throw InvalidParams('duplicate tx')
    }

    const blockNumber =
      transactionNetwork.type === 'eth' &&
      (await eth_blockNumber({errorFallThrough: true}, []))

    const txExtra = {ok: false}
    if (_popup && _sendAction) txExtra.sendAction = _sendAction
    const dbtxs = [
      {eid: 'newTxPayload', txPayload},
      {eid: 'newTxExtra', txExtra},
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

    return {newTxId, txhash}
  }

  let pendingTransaction

  try {
    if (transactionNetwork.type === 'eth') {
      pendingTransaction = await withEthereumNonceLock(
        {
          chainId: transactionNetwork.chainId,
          address: txParams.from,
        },
        async () => {
          if (_sendAction) {
            return createPendingTransaction({
              transaction: txParams,
            })
          }

          const {networkPendingNonce, occupiedNonces} =
            await wallet_getEthereumNonceState(
              {
                errorFallThrough: true,
                network: transactionNetwork,
              },
              [txParams.from],
            )

          const authorizationList = txParams.authorizationList ?? []
          const expectedNonces = resolveTransactionNonces({
            networkPendingNonce,
            occupiedNonces,
            nonceCount: authorizationList.length + 1,
            customNonce: txParams.nonce,
          })
          const transaction = {
            ...txParams,
            nonce: expectedNonces[0],
          }

          if (authorizationList.length) {
            transaction.authorizationList = authorizationList.map(
              (authorization, index) => ({
                ...authorization,
                nonce: expectedNonces[index + 1],
              }),
            )
          }

          return createPendingTransaction({
            transaction,
          })
        },
      )
    } else {
      pendingTransaction = await withConfluxNonceLock(
        {address: txParams.from},
        async () => {
          if (_sendAction) {
            return createPendingTransaction({
              transaction: txParams,
            })
          }

          const {networkPendingNonce, occupiedNonces} =
            await wallet_getConfluxNonceState(
              {
                errorFallThrough: true,
                network: transactionNetwork,
              },
              [txParams.from],
            )

          const expectedNonces = resolveTransactionNonces({
            networkPendingNonce,
            occupiedNonces,
            customNonce: txParams.nonce,
          })

          return createPendingTransaction({
            transaction: {
              ...txParams,
              nonce: expectedNonces[0],
            },
          })
        },
      )
    }
  } catch (err) {
    if (authReqId) {
      await wallet_userRejectedAuthRequest({authReqId})
    }
    throw err
  }

  const {newTxId, txhash} = pendingTransaction

  try {
    enrichTxFn(
      {
        errorFallThrough: true,
        network: transactionNetwork,
      },
      {txhash},
    )

    // eslint-disable-next-line no-empty
  } catch (err) {}
  return await new Promise((resolve, reject) => {
    handleUnfinishedTxFn(
      {network: transactionNetwork},
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
