import {describe, expect, test, vi} from 'vitest'
import {EIP7702_NETWORK_CONFIGS} from '@fluent-wallet/consts'
import {encodeGetNonceCall} from '@fluent-wallet/user-operation'
import {main} from './index.js'

const SENDER = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const NETWORK = {
  name: 'Conflux eSpace Testnet',
  chainId: '0x47',
}

describe('wallet_getUserOperationNonceState', () => {
  test('returns the EntryPoint nonce and locally occupied nonces', async () => {
    const eth_call = vi.fn().mockResolvedValue(`0x${'0'.repeat(63)}4`)
    const getOccupiedUserOperationNonces = vi.fn(() => ['0x4', '0x5'])
    const {entryPointAddress} = EIP7702_NETWORK_CONFIGS[NETWORK.chainId]

    const result = await main({
      Err: {InvalidParams: message => new Error(message)},
      db: {getOccupiedUserOperationNonces},
      rpcs: {eth_call},
      params: [SENDER],
      network: NETWORK,
    })

    expect(result).toEqual({
      networkPendingNonce: '0x4',
      occupiedNonces: ['0x4', '0x5'],
    })
    expect(eth_call).toHaveBeenCalledWith({errorFallThrough: true}, [
      {
        to: entryPointAddress,
        data: encodeGetNonceCall(SENDER.toLowerCase()),
      },
      'latest',
    ])
    expect(getOccupiedUserOperationNonces).toHaveBeenCalledWith({
      sender: SENDER.toLowerCase(),
      chainId: NETWORK.chainId,
      entryPoint: entryPointAddress,
    })
  })
})
