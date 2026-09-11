import {cat, string} from '@fluent-wallet/spec'
import {
  EIP5792_VERSION,
  MAX_BUNDLE_ID_BYTES,
  isBundleIdWithinByteLimit,
} from '@fluent-wallet/eip-5792'

export const NAME = 'wallet_getCallsStatus'

const CALL_STATUS = {
  PENDING: 100,
  CONFIRMED: 200,
  FAILED_OFFCHAIN: 400,
  REVERTED: 500,
}

export const schemas = {
  input: [cat, string],
}

export const permissions = {
  external: ['inpage'],
  locked: true,
  methods: [],
  db: ['getCallBundleRecords'],
}

function mapLogs(logs = []) {
  return logs.map(({address, data, topics}) => ({
    address,
    data,
    topics,
  }))
}

function mapTransactionReceipt(transaction) {
  const receipt = transaction.receipt

  if (!receipt) {
    return null
  }

  return {
    logs: mapLogs(receipt.logs),
    status: receipt.status,
    blockHash: receipt.blockHash,
    blockNumber: receipt.blockNumber,
    gasUsed: receipt.gasUsed,
    transactionHash: transaction.hash,
  }
}

function getTransactionResult(transaction) {
  const receipt = mapTransactionReceipt(transaction)

  if (receipt) {
    return {
      chainId: transaction.txPayload.chainId,
      status:
        receipt.status === '0x1' ? CALL_STATUS.CONFIRMED : CALL_STATUS.REVERTED,
      receipts: [receipt],
    }
  }

  return {
    chainId: transaction.txPayload.chainId,
    status:
      transaction.status < 0
        ? CALL_STATUS.FAILED_OFFCHAIN
        : CALL_STATUS.PENDING,
  }
}

function mapUserOperationReceipt(userOperation) {
  const userOperationReceipt = userOperation.receipt

  if (!userOperationReceipt) {
    return null
  }

  const transactionReceipt = userOperationReceipt.receipt

  return {
    logs: mapLogs(userOperationReceipt.logs),
    status: userOperation.success ? '0x1' : '0x0',
    blockHash: transactionReceipt.blockHash,
    blockNumber: transactionReceipt.blockNumber,
    gasUsed: userOperationReceipt.actualGasUsed,
    transactionHash: transactionReceipt.transactionHash,
  }
}

function getUserOperationResult(userOperation) {
  if (userOperation.status !== 'included') {
    return {
      chainId: userOperation.chainId,
      status:
        userOperation.status === 'failed'
          ? CALL_STATUS.FAILED_OFFCHAIN
          : CALL_STATUS.PENDING,
    }
  }

  const receipt = mapUserOperationReceipt(userOperation)

  return {
    chainId: userOperation.chainId,
    status: userOperation.success
      ? CALL_STATUS.CONFIRMED
      : CALL_STATUS.REVERTED,
    ...(receipt ? {receipts: [receipt]} : {}),
  }
}

function getBundleResult({type, record}, Internal) {
  if (type === 'transaction') {
    return getTransactionResult(record)
  }

  if (type === 'userOperation') {
    return getUserOperationResult(record)
  }

  throw Internal('Unsupported call bundle record type')
}

function validateBundleId(bundleId, InvalidParams) {
  if (!isBundleIdWithinByteLimit(bundleId)) {
    throw InvalidParams(
      `Bundle id must not exceed ${MAX_BUNDLE_ID_BYTES} UTF-8 bytes`,
    )
  }
}

export const main = ({
  Err: {Internal, InvalidParams, UnknownBundleId},
  db: {getCallBundleRecords},
  params: [bundleId],
  app,
}) => {
  validateBundleId(bundleId, InvalidParams)

  const records = app
    ? getCallBundleRecords({
        appId: app.eid,
        bundleId,
      })
    : []

  if (records.length === 0) {
    throw UnknownBundleId('Unknown bundle id')
  }

  if (records.length > 1) {
    throw Internal('Call bundle has multiple execution records')
  }

  const result = getBundleResult(records[0], Internal)

  const response = {
    version: EIP5792_VERSION,
    id: bundleId,
    chainId: result.chainId,
    atomic: true,
    status: result.status,
  }

  if (result.receipts) {
    response.receipts = result.receipts
  }

  return response
}
