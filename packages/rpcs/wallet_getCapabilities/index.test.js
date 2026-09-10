import {describe, expect, test, vi} from 'vitest'
import {
  CFX_ESPACE_MAINNET_CHAINID,
  CFX_ESPACE_MAINNET_NAME,
  CFX_ESPACE_TESTNET_CHAINID,
  CFX_ESPACE_TESTNET_NAME,
  CFX_MAINNET_CHAINID,
  EIP7702_ACCOUNT_STATES,
} from '@fluent-wallet/consts'
import {main} from './index.js'

const ACCOUNT_ID = 1
const APP_ID = 2
const ADDRESS = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'

const NETWORKS = {
  [CFX_ESPACE_MAINNET_CHAINID]: {
    eid: 10,
    name: CFX_ESPACE_MAINNET_NAME,
    type: 'eth',
    chainId: CFX_ESPACE_MAINNET_CHAINID,
  },
  [CFX_ESPACE_TESTNET_CHAINID]: {
    eid: 11,
    name: CFX_ESPACE_TESTNET_NAME,
    type: 'eth',
    chainId: CFX_ESPACE_TESTNET_CHAINID,
  },
}

function createInput({
  params = [ADDRESS],
  vaultType = 'hd',
  accountStates = {
    [CFX_ESPACE_MAINNET_CHAINID]:
      EIP7702_ACCOUNT_STATES.DELEGATED_TO_CONFIGURED,
    [CFX_ESPACE_TESTNET_CHAINID]: EIP7702_ACCOUNT_STATES.NOT_DELEGATED,
  },
} = {}) {
  const account = {
    eid: ACCOUNT_ID,
    accountGroup: {
      vault: {
        type: vaultType,
      },
    },
  }

  const findAddress = vi.fn(() => ({account}))
  const getOneNetwork = vi.fn(({chainId}) => NETWORKS[chainId])
  const wallet_getEip7702AccountStates = vi.fn(({network}) =>
    Promise.resolve([
      {
        state: accountStates[network.chainId],
      },
    ]),
  )
  const Unauthorized = vi.fn(() => new Error('Unauthorized'))

  return {
    input: {
      Err: {Unauthorized},
      db: {
        findAddress,
        getOneNetwork,
      },
      rpcs: {
        wallet_getEip7702AccountStates,
      },
      params,
      app: {
        eid: APP_ID,
      },
    },
    findAddress,
    getOneNetwork,
    wallet_getEip7702AccountStates,
    Unauthorized,
  }
}

describe('wallet_getCapabilities', () => {
  test('returns capabilities for both eSpace chains by default', async () => {
    const {input, wallet_getEip7702AccountStates} = createInput()

    await expect(main(input)).resolves.toEqual({
      [CFX_ESPACE_MAINNET_CHAINID]: {
        atomic: {
          status: 'supported',
        },
      },
      [CFX_ESPACE_TESTNET_CHAINID]: {
        atomic: {
          status: 'ready',
        },
      },
    })

    expect(wallet_getEip7702AccountStates).toHaveBeenCalledTimes(2)
    expect(wallet_getEip7702AccountStates).toHaveBeenCalledWith(
      {
        errorFallThrough: true,
        network: NETWORKS[CFX_ESPACE_MAINNET_CHAINID],
        networkName: CFX_ESPACE_MAINNET_NAME,
      },
      [
        {
          accountId: ACCOUNT_ID,
          networkId: NETWORKS[CFX_ESPACE_MAINNET_CHAINID].eid,
        },
      ],
    )
  })

  test('returns only requested supported eSpace chains', async () => {
    const {input, getOneNetwork, wallet_getEip7702AccountStates} = createInput({
      params: [ADDRESS, [CFX_ESPACE_TESTNET_CHAINID, CFX_MAINNET_CHAINID]],
    })

    await expect(main(input)).resolves.toEqual({
      [CFX_ESPACE_TESTNET_CHAINID]: {
        atomic: {
          status: 'ready',
        },
      },
    })

    expect(getOneNetwork).toHaveBeenCalledOnce()
    expect(getOneNetwork).toHaveBeenCalledWith({
      type: 'eth',
      chainId: CFX_ESPACE_TESTNET_CHAINID,
    })
    expect(wallet_getEip7702AccountStates).toHaveBeenCalledOnce()
  })

  test('returns ready when an existing delegation can be switched', async () => {
    const {input} = createInput({
      params: [ADDRESS, [CFX_ESPACE_MAINNET_CHAINID]],
      accountStates: {
        [CFX_ESPACE_MAINNET_CHAINID]: EIP7702_ACCOUNT_STATES.DELEGATED_TO_OTHER,
      },
    })

    await expect(main(input)).resolves.toEqual({
      [CFX_ESPACE_MAINNET_CHAINID]: {
        atomic: {
          status: 'ready',
        },
      },
    })
  })

  test('omits a chain when its account-state query fails', async () => {
    const {input, wallet_getEip7702AccountStates} = createInput({
      accountStates: {
        [CFX_ESPACE_MAINNET_CHAINID]:
          EIP7702_ACCOUNT_STATES.DELEGATED_TO_CONFIGURED,
        [CFX_ESPACE_TESTNET_CHAINID]:
          EIP7702_ACCOUNT_STATES.DELEGATED_TO_CONFIGURED,
      },
    })

    wallet_getEip7702AccountStates.mockRejectedValueOnce(
      new Error('Account-state query failed'),
    )

    await expect(main(input)).resolves.toEqual({
      [CFX_ESPACE_TESTNET_CHAINID]: {
        atomic: {
          status: 'supported',
        },
      },
    })
  })

  test('returns no capabilities for an unsupported account type', async () => {
    const {input, getOneNetwork, wallet_getEip7702AccountStates} = createInput({
      vaultType: 'hw',
    })

    await expect(main(input)).resolves.toEqual({})

    expect(getOneNetwork).not.toHaveBeenCalled()
    expect(wallet_getEip7702AccountStates).not.toHaveBeenCalled()
  })

  test('rejects an address that is not available to the app', async () => {
    const {
      input,
      findAddress,
      getOneNetwork,
      wallet_getEip7702AccountStates,
      Unauthorized,
    } = createInput()

    findAddress.mockReturnValue(null)

    await expect(main(input)).rejects.toThrow('Unauthorized')

    expect(Unauthorized).toHaveBeenCalledOnce()
    expect(getOneNetwork).not.toHaveBeenCalled()
    expect(wallet_getEip7702AccountStates).not.toHaveBeenCalled()
  })
})
