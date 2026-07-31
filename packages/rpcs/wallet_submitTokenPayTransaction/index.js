import * as spec from '@fluent-wallet/spec'
import genEthTxSchema from '@fluent-wallet/eth-transaction-schema'
import {
  TOKEN_PAY_ERROR_CODES,
  TOKEN_PAY_NETWORK_CONFIGS,
} from '@fluent-wallet/consts'

import {
  decodeEthRawTransaction,
  getTxHashFromRawTx,
} from '@fluent-wallet/signature'
import {withEthereumNonceLock} from '@fluent-wallet/nonce-manager'
import BN from 'bn.js'
import {stripHexPrefix} from '@fluent-wallet/utils'
import {
  fetchTokenPayPrice,
  prepareGasTokenQuote,
  prepareTokenPayExecutionContext,
  resolveTokenPayNonces,
} from '@fluent-wallet/wallet_prepare-token-pay-quote'

const {or, map, dbid, enums, ethHexAddress, hex, cat} = spec

const {
  TransactionLegacyUnsigned,
  Transaction1559Unsigned,
  Transaction7702Unsigned,
} = genEthTxSchema(spec)

export const NAME = 'wallet_submitTokenPayTransaction'

export const userTxSchema = [
  or,
  TransactionLegacyUnsigned,
  Transaction1559Unsigned,
  Transaction7702Unsigned,
]

const tokenPaySchema = [
  map,
  {closed: true},
  ['gasTokenAddress', ethHexAddress],
  ['gasLevel', [enums, 'low', 'medium', 'high']],
  ['maxTokenCost', hex],
]

const directSubmitSchema = [
  map,
  {closed: true},
  ['networkDbId', dbid],
  ['accountId', dbid],
  ['userTx', userTxSchema],
  ['gasTokenAddress', ethHexAddress],
  ['gasLevel', [enums, 'low', 'medium', 'high']],
  ['maxTokenCost', hex],
]

const dappApproveSubmitSchema = [
  map,
  {closed: true},
  ['authReqId', dbid],
  ['tx', [cat, userTxSchema]],
  ['tokenPay', tokenPaySchema],
]

export const schemas = {
  input: [or, directSubmitSchema, dappApproveSubmitSchema],
}

export const permissions = {
  external: ['popup'],
  locked: true,
  methods: [
    'eth_signTransaction',
    'wallet_getTokenPayConfig',
    'eth_gasPrice',
    'eth_estimateGas',
    'wallet_getEthereumNonceState',
    'wallet_handleUnfinishedETHTx',
    'wallet_enrichEthereumTx',
    'wallet_userApprovedAuthRequest',
    'wallet_network1559Compatible',
  ],
  db: [
    'getAccountById',
    'getNetworkById',
    'accountAddrByNetwork',
    'getAddrTxByHash',
    'getAuthReqById',
    'retractEntities',
    't',
  ],
}

const EIP7702_AUTHORIZATION_DB_FIELDS = [
  'chainId',
  'address',
  'nonce',
  'yParity',
  'r',
  's',
]

function formatTxPayloadForDb(txMeta) {
  if (!txMeta.authorizationList) return txMeta

  return {
    ...txMeta,
    authorizationList: txMeta.authorizationList.map(authorization => ({
      eip7702Authorization: EIP7702_AUTHORIZATION_DB_FIELDS.reduce(
        (formattedAuthorization, key) => {
          if (authorization[key] !== undefined) {
            formattedAuthorization[key] = authorization[key]
          }
          return formattedAuthorization
        },
        {},
      ),
    })),
  }
}

function validateSignedTokenPayBundle({
  rawTransferTokenTx,
  rawUserTx,
  chainId,
  accountAddress,
  bundleNonces,
}) {
  const transferTokenTx = decodeEthRawTransaction(rawTransferTokenTx, chainId)
  const userTx = decodeEthRawTransaction(rawUserTx, chainId)
  const signedNonces = [
    transferTokenTx.nonce,
    userTx.nonce,
    ...(userTx.authorizationList ?? []).map(
      authorization => authorization.nonce,
    ),
  ]

  const sendersMatch = [transferTokenTx.from, userTx.from].every(
    sender => sender.toLowerCase() === accountAddress,
  )
  const noncesMatch =
    signedNonces.length === bundleNonces.length &&
    signedNonces.every((nonce, index) =>
      new BN(stripHexPrefix(nonce), 16).eq(
        new BN(stripHexPrefix(bundleNonces[index]), 16),
      ),
    )

  if (!sendersMatch || !noncesMatch) {
    throw new Error('Signed token-pay bundle does not match allocated nonces')
  }
}

async function submitTokenPayTransactions({
  backendBaseUrl,
  rawTransferTokenTx,
  rawUserTx,
}) {
  let response

  try {
    response = await fetch(`${backendBaseUrl}/tokenpay/submit`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        rawTransferTokenTx,
        rawBusinessTx: rawUserTx,
      }),
    })
  } catch {
    return {outcome: 'uncertain'}
  }

  const result = await response.json().catch(() => null)

  if (response.ok && result?.code === 0) {
    return {outcome: 'accepted'}
  }

  if (typeof result?.code === 'number' && result.code !== 0) {
    return {
      outcome: 'rejected',
      error: new Error(
        result.message || 'Failed to submit token-pay transaction',
      ),
    }
  }

  return {outcome: 'uncertain'}
}
export const main = async ({
  Err: {InvalidParams, Server},
  db: {
    getAccountById,
    getNetworkById,
    accountAddrByNetwork,
    getAddrTxByHash,
    getAuthReqById,
    retractEntities,
    t,
  },
  rpcs: {
    eth_signTransaction,
    wallet_getTokenPayConfig,
    eth_gasPrice,
    eth_estimateGas,
    wallet_getEthereumNonceState,
    wallet_handleUnfinishedETHTx,
    wallet_enrichEthereumTx,
    wallet_userApprovedAuthRequest,
    wallet_network1559Compatible,
  },
  params,
}) => {
  let authReq
  let networkDbId
  let accountId
  let userTx
  let gasTokenAddress
  let gasLevel
  let maxTokenCost

  if (params.authReqId) {
    authReq = getAuthReqById(params.authReqId)
    if (!authReq) {
      throw InvalidParams(`Invalid authReqId ${params.authReqId}`)
    }

    if (authReq.req?.method !== 'wallet_sendTransaction') {
      throw InvalidParams(
        'Token pay only supports wallet_sendTransaction approval',
      )
    }

    networkDbId = authReq.app.currentNetwork.eid
    accountId = authReq.app.currentAccount.eid
    userTx = params.tx[0]
    gasTokenAddress = params.tokenPay.gasTokenAddress
    gasLevel = params.tokenPay.gasLevel
    maxTokenCost = params.tokenPay.maxTokenCost
  } else {
    networkDbId = params.networkDbId
    accountId = params.accountId
    userTx = params.userTx
    gasTokenAddress = params.gasTokenAddress
    gasLevel = params.gasLevel
    maxTokenCost = params.maxTokenCost
  }
  const account = getAccountById(accountId)
  if (!account) {
    throw InvalidParams(`Invalid accountId ${accountId}`)
  }

  const network = getNetworkById(networkDbId)
  if (!network) {
    throw InvalidParams(`Invalid networkDbId ${networkDbId}`)
  }

  if (network.type !== 'eth') {
    throw InvalidParams('Token pay only supports Ethereum-compatible networks')
  }

  const backendBaseUrl =
    TOKEN_PAY_NETWORK_CONFIGS[network.chainId]?.backendBaseUrl
  if (!backendBaseUrl) {
    throw InvalidParams('Token pay is not available on current network')
  }

  if (account.accountGroup?.vault?.type === 'hw') {
    throw InvalidParams('Token pay is not supported for hardware wallets')
  }

  const addressRecord = accountAddrByNetwork({
    account: accountId,
    network: networkDbId,
  })
  const accountAddress = addressRecord?.value?.toLowerCase()

  if (!accountAddress) {
    throw InvalidParams(
      `Account ${accountId} has no address on network ${networkDbId}`,
    )
  }

  if (!userTx.from || userTx.from.toLowerCase() !== accountAddress) {
    throw InvalidParams('Invalid user tx from address')
  }

  const {newTransferTokenTxId, newUserTxId, transferTokenTxHash, userTxHash} =
    await withEthereumNonceLock(
      {chainId: network.chainId, address: accountAddress},
      async () => {
        const {networkPendingNonce, occupiedNonces} =
          await wallet_getEthereumNonceState(
            {errorFallThrough: true, network},
            [accountAddress],
          )

        if (occupiedNonces.length > 0) {
          const error = Server('Pending transaction blocks token pay')
          error.extra = {
            code: TOKEN_PAY_ERROR_CODES.PENDING_TRANSACTION,
          }
          throw error
        }

        const bundleNonces = resolveTokenPayNonces({
          networkPendingNonce,
          occupiedNonces,
          userTx,
        })
        const {
          tokenPayConfig,
          tokenPayNetworkConfig,
          txType,
          feeParams,
          quoteToken,
          quoteTokenPrice,
          estimateStateOverride,
        } = await prepareTokenPayExecutionContext({
          InvalidParams,
          db: {
            getAccountById,
            getNetworkById,
            accountAddrByNetwork,
          },
          rpcs: {
            wallet_getTokenPayConfig,
            eth_gasPrice,
            wallet_network1559Compatible,
          },
          params: {networkDbId, accountId, userTx, gasLevel},
          nonceBase: bundleNonces[0],
        })
        const gasToken = tokenPayConfig.tokens.find(
          token =>
            token.address.toLowerCase() === gasTokenAddress.toLowerCase(),
        )

        if (!gasToken) {
          throw InvalidParams(`Unsupported gas token ${gasTokenAddress}`)
        }

        const tokenPrice = await fetchTokenPayPrice(
          tokenPayNetworkConfig.backendBaseUrl,
          gasToken.address,
        )
        const gasTokenQuote = await prepareGasTokenQuote({
          eth_estimateGas,
          network,
          accountAddress,
          userTx,
          gasToken,
          tokenPayConfig,
          bundleNonces,
          feeParams,
          gasLevel,
          txType,
          tokenPrice,
          quoteToken,
          quoteTokenPrice,
          estimateStateOverride,
          InvalidParams,
          includeTxs: true,
        })

        const currentTokenCost = new BN(
          stripHexPrefix(gasTokenQuote.tokenCost),
          16,
        )
        const approvedTokenCost = new BN(stripHexPrefix(maxTokenCost), 16)
        const hasTokenCostChanged = !currentTokenCost.eq(approvedTokenCost)

        if (hasTokenCostChanged) {
          const error = Server('Token pay quote changed')
          error.extra = {
            code: TOKEN_PAY_ERROR_CODES.QUOTE_CHANGED,
            approvedTokenCost: maxTokenCost,
            currentTokenCost: gasTokenQuote.tokenCost,
          }
          throw error
        }

        const signedTransferTokenTx = await eth_signTransaction({network}, [
          gasTokenQuote.transferTokenTx,
          {returnTxMeta: true},
        ])
        const signedUserTx = await eth_signTransaction({network}, [
          gasTokenQuote.preparedUserTx,
          {returnTxMeta: true},
        ])
        const rawTransferTokenTx = signedTransferTokenTx.raw
        const rawUserTx = signedUserTx.raw

        validateSignedTokenPayBundle({
          rawTransferTokenTx,
          rawUserTx,
          chainId: network.chainId,
          accountAddress,
          bundleNonces,
        })

        const transferTokenTxHash = getTxHashFromRawTx(rawTransferTokenTx)
        const userTxHash = getTxHashFromRawTx(rawUserTx)

        if (
          getAddrTxByHash({
            addressId: addressRecord.eid,
            txhash: transferTokenTxHash,
          })
        ) {
          throw InvalidParams('duplicate transfer token tx')
        }

        if (
          getAddrTxByHash({
            addressId: addressRecord.eid,
            txhash: userTxHash,
          })
        ) {
          throw InvalidParams('duplicate user tx')
        }

        const created = new Date().getTime()
        const transferTokenTxPayload = formatTxPayloadForDb(
          signedTransferTokenTx.txMeta,
        )
        const userTxPayload = formatTxPayloadForDb(signedUserTx.txMeta)
        const {
          tempids: {newTransferTokenTxId, newUserTxId},
        } = t([
          {eid: 'newTransferTokenTxPayload', txPayload: transferTokenTxPayload},
          {eid: 'newUserTxPayload', txPayload: userTxPayload},
          {
            eid: 'newTransferTokenTxExtra',
            txExtra: {ok: false, tokenPay: true},
          },
          {eid: 'newUserTxExtra', txExtra: {ok: false, tokenPay: true}},
          {
            eid: 'newTransferTokenTxId',
            tx: {
              fromFluent: true,
              txPayload: 'newTransferTokenTxPayload',
              hash: transferTokenTxHash,
              raw: rawTransferTokenTx,
              status: 2,
              created,
              pendingAt: created,
              txExtra: 'newTransferTokenTxExtra',
            },
          },
          {
            eid: 'newUserTxId',
            tx: {
              fromFluent: true,
              txPayload: 'newUserTxPayload',
              hash: userTxHash,
              raw: rawUserTx,
              status: 2,
              created,
              pendingAt: created,
              txExtra: 'newUserTxExtra',
            },
          },
          {eid: addressRecord.eid, address: {tx: 'newTransferTokenTxId'}},
          {eid: addressRecord.eid, address: {tx: 'newUserTxId'}},
          authReq && {eid: authReq.app.eid, app: {tx: 'newUserTxId'}},
        ])

        const submission = await submitTokenPayTransactions({
          backendBaseUrl,
          rawTransferTokenTx,
          rawUserTx,
        })

        //  Remove the local transaction records if the backend explicitly rejects the submission.
        if (submission.outcome === 'rejected') {
          retractEntities([newTransferTokenTxId, newUserTxId])
          throw submission.error
        }

        return {
          newTransferTokenTxId,
          newUserTxId,
          transferTokenTxHash,
          userTxHash,
        }
      },
    )

  for (const txhash of [transferTokenTxHash, userTxHash]) {
    try {
      wallet_enrichEthereumTx({errorFallThrough: true, network}, {txhash})
    } catch (err) {} // eslint-disable-line no-empty
  }

  wallet_handleUnfinishedETHTx(
    {network},
    {
      tx: newTransferTokenTxId,
      address: addressRecord.eid,
    },
  )

  wallet_handleUnfinishedETHTx(
    {network},
    {
      tx: newUserTxId,
      address: addressRecord.eid,
    },
  )

  if (authReq) {
    await wallet_userApprovedAuthRequest({
      authReqId: params.authReqId,
      res: userTxHash,
    })

    return userTxHash
  }

  return {
    transferTokenTxHash,
    userTxHash,
  }
}
