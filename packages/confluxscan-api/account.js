import {fetch} from './fetcher.js'
import {getURL, isCoreNetworkId} from './utils.js'

export function transaction(opts = {}) {
  if (!Number.isInteger(opts.networkId))
    throw new Error('invalid networkId, must be a integer')

  if (isCoreNetworkId(opts.networkId)) return transactionsCoreSpace(opts)
  return transactionsESpace(opts)
}

function toHex(str) {
  return `0x${parseInt(str, 10).toString(16)}`
}

function formatCoreTxs(txs, chainId) {
  return txs.map(
    ({
      input,
      contractCreated,
      epochNumber,
      from,
      gasFee,
      gasPrice,
      hash,
      // method,
      nonce,
      status,
      timestamp,
      to,
      transactionIndex,
      value,
    }) => {
      const tx = {
        hash,
        created: timestamp * 1000,
        fromScan: true,
        extra: {ok: false},
        payload: {
          from,
          gasPrice: toHex(gasPrice),
          nonce: toHex(nonce),
          to,
          value: toHex(value),
          chainId,
        },
        receipt: {
          gasFee: toHex(gasFee),
          index: toHex(transactionIndex),
          epochNumber: toHex(epochNumber),
        },
      }

      if (status === 2) {
        tx.status = -2
      } else if (status === 1) {
        tx.status = -1
        tx.err = 'tx failed'
      } else tx.status = 5

      if (input && input !== '0x') tx.payload.data = input
      if (contractCreated) tx.receipt.contractCreated = contractCreated
      return tx
    },
  )
}

export async function transactionsCoreSpace({
  chainId = undefined,
  networkId = undefined,
  address = undefined,
  page = 1,
  size = 100,
  from = undefined,
  to = undefined,
  startblock = undefined,
  endblock = undefined,
  minTimestamp = undefined,
  maxTimestamp = undefined,
  sort = 'DESC',
  withInput = true,
}) {
  try {
    let searchParams = {
      account: address,
      limit: size,
      from,
      to,
      minEpochNumber: startblock,
      maxEpochNumber: endblock,
      minTimestamp,
      maxTimestamp,
      withInput,
      sort,
    }

    // remove undefined values
    searchParams = Object.keys(searchParams).reduce((acc, k) => {
      const v = searchParams[k]
      if (v !== undefined) acc[k] = v
      return acc
    }, {})

    let finished = false
    let list = []
    while (!finished) {
      searchParams.skip = (page - 1) * size

      const res = await fetch(getURL(networkId, 'account', '/transactions'), {
        searchParams,
      }).json()
      if (res.code === 0) list = list.concat(res.data.list)
      else throw new Error(res.message)
      if (list.length >= res.data.total) finished = true
      else page = page + 1
    }
    return {list: formatCoreTxs(list, chainId), total: list.length}
  } catch (err) {
    return
  }
}

function formatEspaceTxs(txs, chainId) {
  return txs.map(
    ({
      blockHash,
      blockNumber,
      contractAddress,
      from,
      gas,
      gasPrice,
      gasUsed,
      hash,
      input,
      isError,
      nonce,
      timestamp,
      to,
      transactionIndex,
      txreceipt_status,
      value,
    }) => {
      const tx = {
        fromScan: true,
        hash,
        blockHash,
        blockNumber,
        created: parseInt(timestamp, 10) * 1000,
        extra: {ok: false},
        payload: {
          type: '0x0',
          from,
          gas,
          gasPrice: toHex(gasPrice),
          nonce: toHex(nonce),
          to,
          value: toHex(value),
          chainId,
        },
        receipt: {
          blockHash,
          blockNumber,
          gasUsed,
          transactionIndex: toHex(transactionIndex),
        },
      }

      if (isError !== '0' || txreceipt_status !== '1') {
        tx.status = -1
        tx.err = 'rejected or canceled'
      } else tx.status = 5
      if (contractAddress) tx.receipt.contractCreated = contractAddress
      if (input && input !== '0x') tx.payload.data = input
      return tx
    },
  )
}

export async function transactionsESpace({
  chainId = undefined,
  networkId = undefined,
  address = undefined,
  startblock = undefined,
  endblock = undefined,
  page = 1,
  size = 100,
  sort = 'desc',
}) {
  if (typeof chainId !== 'string') throw new Error('chainId is required')
  try {
    let finished = false
    let list = []
    while (!finished) {
      const res = await fetch(getURL(networkId), {
        searchParams: {
          module: 'account',
          action: 'txlist',
          address,
          page,
          offset: size,
          startblock,
          endblock,
          sort: sort.toLowerCase(),
        },
      }).json()
      if (res.status === '1') list = list.concat(res.result)
      else throw new Error(res.message)
      if (res.result.length === size) page = page + 1
      else finished = true
    }
    return {
      list: formatEspaceTxs(list, chainId),
      total: list.length,
    }
  } catch (err) {
    return
  }
}
