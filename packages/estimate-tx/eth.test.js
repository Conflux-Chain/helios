import {describe, expect, test, vi} from 'vitest'
import {ETH_TX_TYPES, NULL_HEX_ADDRESS} from '@fluent-wallet/consts'
import {ethEstimate} from './eth.js'

const FROM = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const TARGET = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
const DELEGATE = '0x8F5d8d7f3467Dd2e34186E232D8b5a5f35462949'
const CHAIN_ID = '0x47'
const CALL_DATA = '0x1234'
const DUMMY_SIGNATURE = `0x${'11'.repeat(32)}`

const BASE_TX = {
  from: FROM,
  to: FROM,
  value: '0x0',
  data: CALL_DATA,
  type: ETH_TX_TYPES.EIP7702,
  authorizationList: [{address: DELEGATE}],
}

function createRequest(gasEstimateResults) {
  const queuedGasEstimates = [...gasEstimateResults]

  return vi.fn(async ({method}) => {
    switch (method) {
      case 'wallet_network1559Compatible':
        return true

      case 'wallet_getBalance':
        return {
          [FROM.toLowerCase()]: {
            '0x0': '0xde0b6b3a7640000',
          },
        }

      case 'eth_estimate1559Fee':
        return {
          medium: {
            suggestedMaxPriorityFeePerGas: '1',
            suggestedMaxFeePerGas: '2',
          },
        }

      case 'eth_getTransactionCount':
        return '0x5'

      case 'eth_chainId':
        return CHAIN_ID

      case 'eth_estimateGas': {
        if (!queuedGasEstimates.length) {
          throw new Error('Unexpected eth_estimateGas request')
        }

        const result = queuedGasEstimates.shift()

        if (result instanceof Error) {
          throw result
        }

        return result
      }

      default:
        throw new Error(`Unexpected RPC method ${method}`)
    }
  })
}

function getGasEstimateRequests(request) {
  return request.mock.calls
    .map(([rpcRequest]) => rpcRequest)
    .filter(({method}) => method === 'eth_estimateGas')
}

function estimateTransaction(tx, request, options = {}) {
  return ethEstimate(tx, {
    request,
    isFluentRequest: true,
    toAddressType: 'unknown',
    defaultGasBuffer: 1,
    ...options,
  })
}

describe('ethEstimate EIP-7702 data-to-self estimation', () => {
  test('combines delegation and execution estimates', async () => {
    const request = createRequest(['0x11558', '0x5c5d'])

    const result = await estimateTransaction(BASE_TX, request)

    expect(result).toMatchObject({
      gasUsed: '0x11fad',
      gasLimit: '0x11fad',
      nonce: '0x5',
    })

    const [authorizationRequest, executionRequest] =
      getGasEstimateRequests(request)

    expect(authorizationRequest.params).toHaveLength(2)
    expect(authorizationRequest.params[0]).toMatchObject({
      from: FROM,
      to: FROM,
      value: '0x0',
      data: '0x',
      nonce: '0x5',
      type: ETH_TX_TYPES.EIP7702,
      chainId: CHAIN_ID,
      authorizationList: [
        {
          address: DELEGATE.toLowerCase(),
          chainId: CHAIN_ID,
          nonce: '0x6',
          r: DUMMY_SIGNATURE,
          s: DUMMY_SIGNATURE,
          yParity: '0x1',
        },
      ],
    })

    expect(executionRequest.params[0]).toMatchObject({
      from: FROM,
      to: FROM,
      value: '0x0',
      data: CALL_DATA,
      nonce: '0x5',
      chainId: CHAIN_ID,
    })
    expect(executionRequest.params[0]).not.toHaveProperty('type')
    expect(executionRequest.params[0]).not.toHaveProperty('authorizationList')
    expect(executionRequest.params[2]).toEqual({
      [FROM]: {
        code: '0xef01008f5d8d7f3467dd2e34186e232d8b5a5f35462949',
      },
    })
  })

  test('propagates an execution state override failure', async () => {
    const stateOverrideError = new Error('state override is not supported')
    const request = createRequest(['0x11558', stateOverrideError])

    await expect(estimateTransaction(BASE_TX, request)).rejects.toBe(
      stateOverrideError,
    )

    expect(getGasEstimateRequests(request)).toHaveLength(2)
  })

  test('retries both estimates with the same updated nonce', async () => {
    const request = createRequest([
      '0x11558',
      new Error('nonce is too old'),
      '0x11558',
      '0x5c5d',
    ])

    const result = await estimateTransaction(BASE_TX, request)
    const gasEstimateRequests = getGasEstimateRequests(request)

    expect(result.nonce).toBe('0x6')
    expect(gasEstimateRequests).toHaveLength(4)

    expect(gasEstimateRequests[2].params[0]).toMatchObject({
      nonce: '0x6',
      authorizationList: [
        expect.objectContaining({
          nonce: '0x7',
        }),
      ],
    })
    expect(gasEstimateRequests[3].params[0].nonce).toBe('0x6')
  })

  test('uses the last authorization target for a multi-authorization self-call', async () => {
    const request = createRequest(['0x11558', '0x5c5d'])

    await estimateTransaction(
      {
        ...BASE_TX,
        authorizationList: [{address: DELEGATE}, {address: TARGET}],
      },
      request,
    )

    const [authorizationRequest, executionRequest] =
      getGasEstimateRequests(request)

    expect(authorizationRequest.params[0].authorizationList).toEqual([
      expect.objectContaining({
        address: DELEGATE.toLowerCase(),
        nonce: '0x6',
      }),
      expect.objectContaining({
        address: TARGET.toLowerCase(),
        nonce: '0x7',
      }),
    ])

    expect(executionRequest.params[2]).toEqual({
      [FROM]: {
        code: `0xef0100${TARGET.slice(2).toLowerCase()}`,
      },
    })
  })

  test('uses one estimate for an authorization without calldata', async () => {
    const request = createRequest(['0x11558'])

    const result = await estimateTransaction(
      {
        ...BASE_TX,
        to: NULL_HEX_ADDRESS,
        data: '0x',
      },
      request,
    )

    expect(result).toMatchObject({
      gasUsed: '0x11558',
      gasLimit: '0x11558',
    })

    const gasEstimateRequests = getGasEstimateRequests(request)

    expect(gasEstimateRequests).toHaveLength(1)
    expect(gasEstimateRequests[0].params).toHaveLength(2)
    expect(gasEstimateRequests[0].params[0]).toHaveProperty('authorizationList')
  })
})
