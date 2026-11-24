import {expect, test, vi} from 'vitest'
import {
  CFX_ESPACE_MAINNET_CHAINID,
  CFX_ESPACE_TESTNET_CHAINID,
  EIP7702_NETWORK_CONFIGS,
} from '../consts/index.js'
import {createBackendClient} from './index.js'

test.each([
  [CFX_ESPACE_MAINNET_CHAINID, 'https://api.fluentwallet.com'],
  [CFX_ESPACE_TESTNET_CHAINID, 'https://api-testnet.fluentwallet.com'],
])(
  'requests Paymaster endpoints under /api/ for chain %s',
  async (chainId, origin) => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({code: 0, data: null}),
    })
    const {backendBaseUrl} = EIP7702_NETWORK_CONFIGS[chainId]
    const client = createBackendClient({baseUrl: backendBaseUrl, fetcher})

    await client.getPaymasterConfig()
    await client.getPaymasterStub({sender: '0x123'})
    await client.signPaymasterUserOperation({sender: '0x123'})

    expect(fetcher.mock.calls.map(([url]) => url)).toEqual([
      `${origin}/api/aa/paymaster/config`,
      `${origin}/api/aa/paymaster/stub`,
      `${origin}/api/aa/paymaster/sign`,
    ])
  },
)
