import {beforeEach, describe, expect, test, vi} from 'vitest'
import {ETH_TX_TYPES} from '@fluent-wallet/consts'
import {getTxHashFromRawTx} from '@fluent-wallet/signature'
import {main} from './index.js'

vi.mock('@fluent-wallet/signature', () => ({
  getTxHashFromRawTx: vi.fn(),
}))

const FROM_ADDRESS = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const TO_ADDRESS = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
const DELEGATE_ADDRESS = '0xfba3912ca04dd458c843e2ee08967fc04f3579c2'

const NETWORK = {
  eid: 1,
  name: 'Ethereum Testnet',
  type: 'eth',
  chainId: '0x1',
}

const ADDRESS_ID = 10
const TRANSACTION_ID = 20
const SIGNED_RAW_TRANSACTION = '0x1234'
const TRANSACTION_HASH =
  '0x1111111111111111111111111111111111111111111111111111111111111111'

const ACCOUNT_ID = 30

const ADDRESS_RECORD = {
  eid: ADDRESS_ID,
  account: {
    eid: ACCOUNT_ID,
  },
}

const USER_OPERATION_HASH =
  '0x2222222222222222222222222222222222222222222222222222222222222222'
beforeEach(() => {
  vi.resetAllMocks()
})

describe('wallet_sendTransaction', () => {
  test('allocates and persists a complete EIP-7702 nonce sequence', async () => {
    const requestedTransaction = {
      type: ETH_TX_TYPES.EIP7702,
      chainId: NETWORK.chainId,
      from: FROM_ADDRESS,
      to: TO_ADDRESS,
      value: '0x0',
      gas: '0x5208',
      maxPriorityFeePerGas: '0x1',
      maxFeePerGas: '0x2',
      authorizationList: [{address: DELEGATE_ADDRESS}],
    }

    const allocatedTransaction = {
      ...requestedTransaction,
      nonce: '0x5',
      authorizationList: [
        {
          address: DELEGATE_ADDRESS,
          nonce: '0x6',
        },
      ],
    }

    const wallet_getEthereumNonceState = vi.fn().mockResolvedValue({
      networkPendingNonce: '0x4',
      occupiedNonces: ['0x4'],
    })

    const eth_signTransaction = vi.fn().mockResolvedValue({
      raw: SIGNED_RAW_TRANSACTION,
      txMeta: allocatedTransaction,
    })

    getTxHashFromRawTx.mockReturnValue(TRANSACTION_HASH)

    const lifecycle = []

    const t = vi.fn(() => {
      lifecycle.push('stored')
      return {
        tempids: {
          newTxId: TRANSACTION_ID,
        },
      }
    })

    const wallet_handleUnfinishedETHTx = vi.fn((_options, {okCb}) => {
      lifecycle.push('handled')
      okCb(TRANSACTION_HASH)
    })

    const result = await main({
      Err: {
        InvalidParams: message => new Error(message),
        Server: message => new Error(message),
      },
      db: {
        findAddress: vi.fn(() => ADDRESS_RECORD),
        getAuthReqById: vi.fn(),
        getAddrTxByHash: vi.fn(),
        t,
      },
      rpcs: {
        eth_signTransaction,
        eth_blockNumber: vi.fn().mockResolvedValue('0x10'),
        wallet_getEthereumNonceState,
        wallet_handleUnfinishedETHTx,
        wallet_enrichEthereumTx: vi.fn(),
      },
      params: [requestedTransaction],
      network: NETWORK,
      _popup: true,
    })

    expect(result).toBe(TRANSACTION_HASH)

    expect(wallet_getEthereumNonceState).toHaveBeenCalledWith(
      {
        errorFallThrough: true,
        network: NETWORK,
      },
      [FROM_ADDRESS],
    )

    expect(eth_signTransaction).toHaveBeenCalledWith(
      {
        app: undefined,
        network: NETWORK,
        errorFallThrough: true,
      },
      [
        allocatedTransaction,
        {
          returnTxMeta: true,
        },
      ],
    )

    const databaseTransactions = t.mock.calls[0][0]
    const storedPayload = databaseTransactions.find(
      transaction => transaction?.eid === 'newTxPayload',
    )
    const storedTransaction = databaseTransactions.find(
      transaction => transaction?.tx?.raw,
    )

    expect(storedPayload.txPayload).toMatchObject({
      nonce: '0x5',
      authorizationList: [
        {
          eip7702Authorization: {
            address: DELEGATE_ADDRESS,
            nonce: '0x6',
          },
        },
      ],
    })

    expect(storedTransaction.tx).toMatchObject({
      fromFluent: true,
      raw: SIGNED_RAW_TRANSACTION,
      hash: TRANSACTION_HASH,
      status: 0,
    })

    expect(lifecycle).toEqual(['stored', 'handled'])
  })

  test('allocates consecutive nonces for concurrent sends from the same account', async () => {
    const requestedTransaction = {
      type: ETH_TX_TYPES.EIP1559,
      chainId: NETWORK.chainId,
      from: FROM_ADDRESS,
      to: TO_ADDRESS,
      value: '0x0',
      gas: '0x5208',
      maxPriorityFeePerGas: '0x1',
      maxFeePerGas: '0x2',
    }

    const expectedTransactionHashes = [
      TRANSACTION_HASH,
      '0x2222222222222222222222222222222222222222222222222222222222222222',
    ]
    const rawTransactions = ['0x1234', '0x5678']
    const savedTransactions = []
    const signedNonces = []
    const occupiedNoncesSeenByEachSend = []

    const wallet_getEthereumNonceState = vi.fn(() => {
      const occupiedNonces = savedTransactions.map(({nonce}) => nonce)
      occupiedNoncesSeenByEachSend.push([...occupiedNonces])

      return Promise.resolve({
        networkPendingNonce: '0x4',
        occupiedNonces,
      })
    })

    const eth_signTransaction = vi.fn(async (_options, [transaction]) => {
      const transactionIndex = signedNonces.length
      signedNonces.push(transaction.nonce)

      return {
        raw: rawTransactions[transactionIndex],
        txMeta: transaction,
      }
    })

    getTxHashFromRawTx
      .mockReturnValueOnce(expectedTransactionHashes[0])
      .mockReturnValueOnce(expectedTransactionHashes[1])

    const saveTransactions = vi.fn(databaseTransactions => {
      const payloadRecord = databaseTransactions.find(
        transaction => transaction?.eid === 'newTxPayload',
      )
      const transactionRecord = databaseTransactions.find(
        transaction => transaction?.tx?.hash,
      )
      const transactionId = TRANSACTION_ID + savedTransactions.length

      savedTransactions.push({
        id: transactionId,
        nonce: payloadRecord.txPayload.nonce,
        hash: transactionRecord.tx.hash,
      })

      return {
        tempids: {
          newTxId: transactionId,
        },
      }
    })

    const wallet_handleUnfinishedETHTx = vi.fn((_options, {tx, okCb}) => {
      const savedTransaction = savedTransactions.find(
        transaction => transaction.id === tx,
      )
      okCb(savedTransaction.hash)
    })

    const createSendInputs = transaction => ({
      Err: {
        InvalidParams: message => new Error(message),
        Server: message => new Error(message),
      },
      db: {
        findAddress: vi.fn(() => ADDRESS_RECORD),
        getAuthReqById: vi.fn(),
        getAddrTxByHash: vi.fn(),
        t: saveTransactions,
      },
      rpcs: {
        eth_signTransaction,
        eth_blockNumber: vi.fn().mockResolvedValue('0x10'),
        wallet_getEthereumNonceState,
        wallet_handleUnfinishedETHTx,
        wallet_enrichEthereumTx: vi.fn(),
      },
      params: [transaction],
      network: NETWORK,
      _popup: true,
    })

    const sentTransactionHashes = await Promise.all([
      main(createSendInputs({...requestedTransaction})),
      main(createSendInputs({...requestedTransaction})),
    ])

    expect(sentTransactionHashes).toEqual(expectedTransactionHashes)
    expect(occupiedNoncesSeenByEachSend).toEqual([[], ['0x4']])
    expect(signedNonces).toEqual(['0x4', '0x5'])
    expect(savedTransactions).toEqual([
      {
        id: TRANSACTION_ID,
        nonce: '0x4',
        hash: expectedTransactionHashes[0],
      },
      {
        id: TRANSACTION_ID + 1,
        nonce: '0x5',
        hash: expectedTransactionHashes[1],
      },
    ])
  })

  test('allocates consecutive nonces for concurrent Conflux sends from the same account', async () => {
    const confluxNetwork = {
      eid: 2,
      name: 'Conflux Testnet',
      type: 'cfx',
      chainId: '0x1',
      netId: 1,
    }

    const fromAddress = 'cfxtest:aak39z1fdm02v71y33znvaxwthh99skcp2s48zasbp'
    const toAddress = 'cfxtest:aasm4c231py7j34fghntcfkdt2nm9xv1tu6jd3r1s7'

    const requestedTransaction = {
      from: fromAddress,
      to: toAddress,
      value: '0x0',
      gas: '0x5208',
      gasPrice: '0x1',
      storageLimit: '0x0',
      epochHeight: '0x1',
      chainId: confluxNetwork.chainId,
    }

    const expectedTransactionHashes = [
      TRANSACTION_HASH,
      '0x2222222222222222222222222222222222222222222222222222222222222222',
    ]
    const rawTransactions = ['0x1234', '0x5678']
    const savedTransactions = []
    const signedNonces = []
    const occupiedNoncesSeenByEachSend = []

    const wallet_getConfluxNonceState = vi.fn(() => {
      const occupiedNonces = savedTransactions.map(({nonce}) => nonce)
      occupiedNoncesSeenByEachSend.push([...occupiedNonces])

      return Promise.resolve({
        networkPendingNonce: '0x4',
        occupiedNonces,
      })
    })

    const cfx_signTransaction = vi.fn(async (_options, [transaction]) => {
      const transactionIndex = signedNonces.length
      signedNonces.push(transaction.nonce)

      return {
        raw: rawTransactions[transactionIndex],
        txMeta: transaction,
      }
    })

    getTxHashFromRawTx
      .mockReturnValueOnce(expectedTransactionHashes[0])
      .mockReturnValueOnce(expectedTransactionHashes[1])

    const saveTransactions = vi.fn(databaseTransactions => {
      const payloadRecord = databaseTransactions.find(
        transaction => transaction?.eid === 'newTxPayload',
      )
      const transactionRecord = databaseTransactions.find(
        transaction => transaction?.tx?.hash,
      )
      const transactionId = TRANSACTION_ID + savedTransactions.length

      savedTransactions.push({
        id: transactionId,
        nonce: payloadRecord.txPayload.nonce,
        hash: transactionRecord.tx.hash,
      })

      return {
        tempids: {
          newTxId: transactionId,
        },
      }
    })

    const wallet_handleUnfinishedCFXTx = vi.fn((_options, {tx, okCb}) => {
      const savedTransaction = savedTransactions.find(
        transaction => transaction.id === tx,
      )
      okCb(savedTransaction.hash)
    })

    const createSendInputs = transaction => ({
      Err: {
        InvalidParams: message => new Error(message),
        Server: message => new Error(message),
      },
      db: {
        findAddress: vi.fn(() => ADDRESS_RECORD),
        getAuthReqById: vi.fn(),
        getAddrTxByHash: vi.fn(),
        t: saveTransactions,
      },
      rpcs: {
        cfx_signTransaction,
        wallet_getConfluxNonceState,
        wallet_handleUnfinishedCFXTx,
        wallet_enrichConfluxTx: vi.fn(),
      },
      params: [transaction],
      network: confluxNetwork,
      _popup: true,
    })

    const sentTransactionHashes = await Promise.all([
      main(createSendInputs({...requestedTransaction})),
      main(createSendInputs({...requestedTransaction})),
    ])

    expect(sentTransactionHashes).toEqual(expectedTransactionHashes)
    expect(occupiedNoncesSeenByEachSend).toEqual([[], ['0x4']])
    expect(signedNonces).toEqual(['0x4', '0x5'])
  })

  test('does not wait for wallet-sponsored transaction inclusion', async () => {
    const wallet_sendUserOperation = vi.fn().mockResolvedValue({
      userOpHash: USER_OPERATION_HASH,
    })
    const wallet_handleUserOperation = vi.fn()

    const result = await main({
      Err: {
        InvalidParams: message => new Error(message),
        Server: message => new Error(message),
      },
      db: {
        findAddress: vi.fn(() => ADDRESS_RECORD),
      },
      rpcs: {
        wallet_sendUserOperation,
        wallet_handleUserOperation,
      },
      params: {
        tx: [
          {
            from: FROM_ADDRESS,
            to: TO_ADDRESS,
            value: '0x1',
            data: '0x1234',
          },
        ],
        gasPayment: 'sponsored',
      },
      network: NETWORK,
    })

    expect(result).toBe(USER_OPERATION_HASH)
    expect(wallet_sendUserOperation).toHaveBeenCalledWith(
      {
        errorFallThrough: true,
        network: NETWORK,
      },
      {
        accountId: ACCOUNT_ID,
        networkId: NETWORK.eid,
        calls: [
          {
            to: TO_ADDRESS,
            value: '0x1',
            data: '0x1234',
          },
        ],
        sponsorship: 'whitelist',
      },
    )
    expect(wallet_handleUserOperation).not.toHaveBeenCalled()
  })
})
