import {expect, describe, test, vi, beforeEach} from 'vitest'
import {initBG} from './index.js'
import {
  DEFAULT_CURRENCY_DECIMALS,
  CFX_MAINNET_NAME,
  CFX_LOCALNET_RPC_ENDPOINT,
  CFX_LOCALNET_CHAINID,
  CFX_LOCALNET_NETID,
  CFX_LOCALNET_CURRENCY_SYMBOL,
  CFX_LOCALNET_CURRENCY_NAME,
  DEFAULT_CFX_HDPATH,
  ETH_MAINNET_NAME,
  ETH_LOCALNET_RPC_ENDPOINT,
  ETH_LOCALNET_CHAINID,
  ETH_LOCALNET_NETID,
  ETH_LOCALNET_CURRENCY_SYMBOL,
  ETH_LOCALNET_CURRENCY_NAME,
  DEFAULT_ETH_HDPATH,
} from '@fluent-wallet/consts'

import '@fluent-wallet/test-helpers/setupNetwork.js'

const password = '12345678'

let request

vi.setConfig({testTimeout: 100000})

beforeEach(async () => {
  request = undefined
  const bg = await initBG({
    skipRestore: true,
    initDBFn: d => {
      d.setPassword(password)
      const cfxHdPath = d.createHdPath({
        name: 'cfx-default',
        value: DEFAULT_CFX_HDPATH,
      })
      const ethHdPath = d.createHdPath({
        name: 'eth-default',
        value: DEFAULT_ETH_HDPATH,
      })
      d.createNetwork({
        name: CFX_MAINNET_NAME,
        endpoint: CFX_LOCALNET_RPC_ENDPOINT,
        type: 'cfx',
        selected: true,
        chainId: CFX_LOCALNET_CHAINID,
        netId: CFX_LOCALNET_NETID,
        cacheTime: 500,
        ticker: {
          name: CFX_LOCALNET_CURRENCY_NAME,
          symbol: CFX_LOCALNET_CURRENCY_SYMBOL,
          decimals: DEFAULT_CURRENCY_DECIMALS,
        },
        balanceChecker:
          'net2999:type.contract:aca4y1pf3ugbdbbtzzhygps00t5pbj2356s6mj0drw',
        hdPath: cfxHdPath,
        isMainnet: true,
      })
      d.createNetwork({
        name: ETH_MAINNET_NAME,
        endpoint: ETH_LOCALNET_RPC_ENDPOINT,
        type: 'eth',
        chainId: ETH_LOCALNET_CHAINID,
        netId: ETH_LOCALNET_NETID,
        cacheTime: 200,
        ticker: {
          name: ETH_LOCALNET_CURRENCY_NAME,
          symbol: ETH_LOCALNET_CURRENCY_SYMBOL,
          decimals: DEFAULT_CURRENCY_DECIMALS,
        },
        balanceChecker: '0xe5538a1fc85641053f5e4824846390c75b779a5f',
        hdPath: ethHdPath,
        isMainnet: true,
      })
      d.t([
        {
          eid: 'site',
          site: {origin: 'foo.site', name: 'foo.site', post: jest.fn()},
        },
      ])
    },
  })
  request = arg => {
    return bg.request({_post: () => {}, ...arg})
  }
  console.log('run beforeEach ')
})

describe('integration test', () => {
  describe('rpcs', () => {
    describe('wallet_detectNetworkType', () => {
      test('wallet_detectNetworkType', async () => {
        expect(
          (
            await request({
              method: 'wallet_detectNetworkType',
              params: {url: CFX_LOCALNET_RPC_ENDPOINT},
            })
          ).result,
        ).toStrictEqual({chainId: '0xbb7', netId: '2999', type: 'cfx'})
        expect(
          (
            await request({
              method: 'wallet_detectNetworkType',
              params: {url: ETH_LOCALNET_RPC_ENDPOINT},
            })
          ).result,
        ).toStrictEqual({chainId: '0x539', netId: '1337', type: 'eth'})
        expect(
          (
            await request({
              method: 'wallet_detectNetworkType',
              params: {url: 'https://example.com'},
            })
          ).error.message,
        ).toMatch(/Unsupported network type/)
      })
    })
  })
})
