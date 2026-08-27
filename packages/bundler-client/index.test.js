import {expect, test, vi} from 'vitest'
import {BundlerRpcError, createBundlerClient} from './index.js'

const ENDPOINT = 'https://bundler.example'
const ENTRY_POINT = '0x4337084D9E255Ff0702461CF8895CE9E3b5Ff108'
const USER_OPERATION_HASH =
  '0x1234567890123456789012345678901234567890123456789012345678901234'

const userOperation = {
  sender: '0x1234567890123456789012345678901234567890',
  nonce: 0,
  callData: '0xdeadbeef',
  signature: '0x1234',
}

const rpcUserOperation = {
  sender: userOperation.sender,
  nonce: '0x0',
  callData: '0xdeadbeef',
  signature: '0x1234',
}

function createFetcher(...responses) {
  return {
    post: vi.fn(() => ({
      json: async () => responses.shift(),
    })),
  }
}

test('calls the standard Bundler RPC methods', async () => {
  const fetcher = createFetcher(
    {result: {callGasLimit: '0x100'}},
    {result: USER_OPERATION_HASH},
    {result: {userOperationHash: USER_OPERATION_HASH}},
    {result: null},
  )
  const client = createBundlerClient({endpoint: ENDPOINT, fetcher})

  await expect(
    client.estimateUserOperationGas(userOperation, ENTRY_POINT),
  ).resolves.toEqual({callGasLimit: '0x100'})
  await expect(
    client.sendUserOperation(userOperation, ENTRY_POINT),
  ).resolves.toBe(USER_OPERATION_HASH)
  await client.getUserOperationByHash(USER_OPERATION_HASH)
  await expect(
    client.getUserOperationReceipt(USER_OPERATION_HASH),
  ).resolves.toBeNull()

  const requests = fetcher.post.mock.calls.map(([, options]) => options.json)

  expect(requests).toEqual([
    {
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_estimateUserOperationGas',
      params: [rpcUserOperation, ENTRY_POINT],
    },
    {
      jsonrpc: '2.0',
      id: 2,
      method: 'eth_sendUserOperation',
      params: [rpcUserOperation, ENTRY_POINT],
    },
    {
      jsonrpc: '2.0',
      id: 3,
      method: 'eth_getUserOperationByHash',
      params: [USER_OPERATION_HASH],
    },
    {
      jsonrpc: '2.0',
      id: 4,
      method: 'eth_getUserOperationReceipt',
      params: [USER_OPERATION_HASH],
    },
  ])

  expect(fetcher.post).toHaveBeenNthCalledWith(
    1,
    ENDPOINT,
    expect.objectContaining({timeout: 60_000}),
  )
})

test('preserves Bundler RPC error details', async () => {
  const fetcher = createFetcher({
    error: {
      code: -32500,
      message: 'AA33 reverted',
      data: {reason: 'paymaster validation failed'},
    },
  })
  const client = createBundlerClient({endpoint: ENDPOINT, fetcher})

  const request = client.sendUserOperation(userOperation, ENTRY_POINT)

  await expect(request).rejects.toBeInstanceOf(BundlerRpcError)
  await expect(request).rejects.toMatchObject({
    code: -32500,
    message: 'AA33 reverted',
    data: {reason: 'paymaster validation failed'},
  })
})
