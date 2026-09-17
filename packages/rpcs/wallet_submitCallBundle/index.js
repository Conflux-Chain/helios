import {
  EIP7702_NETWORK_CONFIGS,
  USER_OPERATION_ERROR_CODES,
} from '@fluent-wallet/consts'
import {txSchema} from '@fluent-wallet/eth_sign-transaction'
import {
  resolveTransactionNonces,
  withEthereumNonceLock,
} from '@fluent-wallet/nonce-manager'
import {
  HexData,
  Quantity,
  dbid,
  enums,
  ethHexAddress,
  map,
  oneOrMore,
  or,
} from '@fluent-wallet/spec'
import {NAME as SEND_CALLS_METHOD} from '@fluent-wallet/wallet_send-calls'
import {prepareCallBundleTransaction} from '@fluent-wallet/wallet_send-calls/prepare-call-bundle-transaction.js'
import {createPendingTransaction} from '@fluent-wallet/wallet_send-transaction/create-pending-transaction.js'

import {
  createPendingUserOperation,
  sponsorshipSchema,
  submitPendingUserOperation,
} from '@fluent-wallet/wallet_send-user-operation'

export const NAME = 'wallet_submitCallBundle'

const callSchema = [
  map,
  {closed: true},
  ['to', ethHexAddress],
  ['data', HexData],
  ['value', Quantity],
]

const transactionSubmissionSchema = [
  map,
  {closed: true},
  ['authReqId', dbid],
  ['calls', [oneOrMore, callSchema]],
  ['transaction', txSchema],
]

const sponsoredSubmissionSchema = [
  map,
  {closed: true},
  ['authReqId', dbid],
  ['calls', [oneOrMore, callSchema]],

  ['sponsorship', sponsorshipSchema],
  ['approvedDelegationAction', {optional: true}, [enums, 'upgrade', 'switch']],
]

export const schemas = {
  input: [or, transactionSubmissionSchema, sponsoredSubmissionSchema],
}

export const permissions = {
  external: ['popup'],
  methods: [
    'eth_blockNumber',
    'eth_getTransactionCount',
    'eth_signTransaction',
    'wallet_enrichEthereumTx',
    'wallet_getAddressPrivateKey',
    'wallet_getEip7702AccountStates',
    'wallet_getEthereumNonceState',
    'wallet_getUserOperationNonceState',
    'wallet_handleUnfinishedETHTx',
    'wallet_handleUserOperation',
    'wallet_prepareUserOperation',
    'wallet_userApprovedAuthRequest',
    'wallet_userRejectedAuthRequest',
  ],
  db: [
    'accountAddrByNetwork',
    'findAccount',
    'findAddress',
    'getAddrTxByHash',
    'getAuthReqById',
    'getNetworkById',
    'insertUserOperation',
    'setUserOperationFailed',
    't',
  ],
}

const TRANSACTION_CONFIRMATION_REQUIRED_CODES = new Set([
  USER_OPERATION_ERROR_CODES.EIP7702_PENDING_TRANSACTION,
  USER_OPERATION_ERROR_CODES.SPONSORSHIP_REFRESH_REQUIRED,
  USER_OPERATION_ERROR_CODES.EIP7702_DELEGATION_CONFIRMATION_REQUIRED,
])

function isTransactionConfirmationRequired(error) {
  return TRANSACTION_CONFIRMATION_REQUIRED_CODES.has(error?.extra?.code)
}

async function prepareTransactionReconfirmation({
  authReq,
  authReqId,
  calls,
  accountId,
  network,
  Err,
  rpcs,
  transact,
}) {
  const networkConfig = EIP7702_NETWORK_CONFIGS[network.chainId]

  if (!networkConfig) {
    throw Err.UnsupportedChainId(`Chain ${network.chainId} is not supported`)
  }

  const {transaction, requiredDelegationAction} =
    await prepareCallBundleTransaction(
      {
        from: authReq.req.params.from,
        calls,
        accountId,
        atomicRequired: authReq.req.params.atomicRequired,
        network,
        networkConfig,
      },
      {
        wallet_getEip7702AccountStates: rpcs.wallet_getEip7702AccountStates,
        AtomicityNotSupported: Err.AtomicityNotSupported,
        Server: Err.Server,
      },
    )

  transact({
    eid: authReqId,
    authReq: {
      processed: false,
      req: {
        ...authReq.req,
        params: {
          ...authReq.req.params,
          calls,
          transaction,
          requiredDelegationAction,
        },
      },
    },
  })

  return {
    confirmationRequired: true,
  }
}

export const main = async ({
  Err,
  Err: {InvalidParams},
  db,
  db: {findAddress, getAddrTxByHash, getAuthReqById, t},
  rpcs,
  rpcs: {
    eth_blockNumber,
    eth_signTransaction,
    wallet_enrichEthereumTx,
    wallet_getEthereumNonceState,
    wallet_handleUnfinishedETHTx,
    wallet_userApprovedAuthRequest,
    wallet_userRejectedAuthRequest,
  },
  params: {
    authReqId,
    calls,
    transaction,
    sponsorship,
    approvedDelegationAction,
  },
}) => {
  const authReq = getAuthReqById(authReqId)

  if (!authReq || authReq.req.method !== SEND_CALLS_METHOD) {
    throw InvalidParams(`Invalid auth request id ${authReqId}`)
  }

  if (authReq.processed) {
    throw InvalidParams(`Already processing auth request ${authReqId}`)
  }

  t({
    eid: authReqId,
    authReq: {
      processed: true,
    },
  })

  const app = authReq.app
  const network = app.currentNetwork
  const bundleId = authReq.req.bundleId
  const logContext = {authReqId, bundleId, chainId: network.chainId}

  if (sponsorship) {
    let accountId
    let pendingUserOperation

    try {
      if (network.chainId !== authReq.req.params.chainId) {
        throw InvalidParams(
          `Chain ${authReq.req.params.chainId} is no longer current for this app`,
        )
      }

      const addressRecord = findAddress({
        appId: app.eid,
        value: authReq.req.params.from,
        g: {
          value: 1,
        },
        accountG: {
          eid: 1,
          _accountGroup: {
            vault: {
              type: 1,
            },
          },
        },
      })

      if (!addressRecord?.account) {
        throw InvalidParams(`Invalid from address ${authReq.req.params.from}`)
      }

      accountId = addressRecord.account.eid

      pendingUserOperation = await createPendingUserOperation({
        Err,
        db,
        rpcs,
        network,
        params: {
          accountId,
          networkId: network.eid,
          appId: app.eid,
          bundleId,
          calls,
          sponsorship,
          approvedDelegationAction,
        },
      })
    } catch (error) {
      if (isTransactionConfirmationRequired(error)) {
        try {
          return await prepareTransactionReconfirmation({
            authReq,
            authReqId,
            calls,
            accountId,
            network,
            Err,
            rpcs,
            transact: t,
          })
        } catch (transactionError) {
          await wallet_userRejectedAuthRequest(
            {errorFallThrough: true},
            {
              authReqId,
              error: transactionError,
            },
          )

          throw transactionError
        }
      }

      await wallet_userRejectedAuthRequest(
        {errorFallThrough: true},
        {
          authReqId,
          error,
        },
      )

      throw error
    }

    void submitPendingUserOperation(pendingUserOperation, {
      setUserOperationFailed: db.setUserOperationFailed,
      wallet_handleUserOperation: rpcs.wallet_handleUserOperation,
      Server: Err.Server,
    }).catch(error => {
      console.error(
        '[wallet_submitCallBundle] UserOperation submission failed',
        {
          ...logContext,
          code: error.code,
          message: error.message,
        },
      )
    })

    const result = {id: bundleId}

    await wallet_userApprovedAuthRequest(
      {errorFallThrough: true},
      {
        authReqId,
        res: result,
      },
    )

    return result
  }

  let addressId
  let pendingTransaction

  try {
    addressId = findAddress({
      appId: app.eid,
      value: transaction.from,
    })

    if (!addressId) {
      throw InvalidParams(`Invalid from address ${transaction.from}`)
    }

    pendingTransaction = await withEthereumNonceLock(
      {
        chainId: network.chainId,
        address: transaction.from,
      },
      async () => {
        const {networkPendingNonce, occupiedNonces} =
          await wallet_getEthereumNonceState(
            {
              errorFallThrough: true,
              network,
              networkName: network.name,
            },
            [transaction.from],
          )

        const authorizationList = transaction.authorizationList ?? []
        const transactionNonces = resolveTransactionNonces({
          networkPendingNonce,
          occupiedNonces,
          nonceCount: authorizationList.length + 1,
          customNonce: transaction.nonce,
        })

        const transactionWithNonces = {
          ...transaction,
          nonce: transactionNonces[0],
        }

        if (authorizationList.length) {
          transactionWithNonces.authorizationList = authorizationList.map(
            (authorization, index) => ({
              ...authorization,
              nonce: transactionNonces[index + 1],
            }),
          )
        }

        return createPendingTransaction(
          {
            transaction: transactionWithNonces,
            addressId,
            app,
            network,
            callBundle: {
              id: bundleId,
              calls,
            },
          },
          {
            signTransaction: eth_signTransaction,
            getEthereumBlockNumber: (overrides, params) =>
              eth_blockNumber(
                {
                  ...overrides,
                  network,
                  networkName: network.name,
                },
                params,
              ),
            getAddrTxByHash,
            transact: t,
            InvalidParams,
          },
        )
      },
    )
  } catch (error) {
    await wallet_userRejectedAuthRequest(
      {errorFallThrough: true},
      {
        authReqId,
        error,
      },
    )

    throw error
  }

  const {transactionId, transactionHash} = pendingTransaction

  void wallet_enrichEthereumTx(
    {
      errorFallThrough: true,
      network,
      networkName: network.name,
    },
    {
      txhash: transactionHash,
    },
  ).catch(error => {
    console.error('[wallet_submitCallBundle] transaction enrichment failed', {
      ...logContext,
      code: error.code,
      message: error.message,
    })
  })

  void wallet_handleUnfinishedETHTx(
    {
      errorFallThrough: true,
      network,
      networkName: network.name,
    },
    {
      tx: transactionId,
      address: addressId,
    },
  ).catch(error => {
    console.error('[wallet_submitCallBundle] transaction tracking failed', {
      ...logContext,
      code: error.code,
      message: error.message,
    })
  })

  const result = {id: bundleId}

  await wallet_userApprovedAuthRequest(
    {errorFallThrough: true},
    {
      authReqId,
      res: result,
    },
  )

  return result
}
