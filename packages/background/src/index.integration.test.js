// eslint-disable-next-line no-unused-vars
import {expect, describe, test, it, jest, afterAll, afterEach, beforeAll, beforeEach} from '@jest/globals' // prettier-ignore
import {initBG} from './index.js'
import {
  CFX_LOCALNET_RPC_ENDPOINT,
  CFX_LOCALNET_CHAINID,
  CFX_LOCALNET_NETID,
  CFX_LOCALNET_CURRENCY_SYMBOL,
  DEFAULT_CFX_HDPATH,
  ETH_LOCALNET_RPC_ENDPOINT,
  ETH_LOCALNET_CHAINID,
  ETH_LOCALNET_NETID,
  ETH_LOCALNET_CURRENCY_SYMBOL,
  DEFAULT_ETH_HDPATH,
} from '@cfxjs/fluent-wallet-consts'
import {MNEMONIC, ACCOUNTS, delay, sendCFX, sendETH} from '@cfxjs/test-helpers'

const password = '12345678'
let request, db
jest.setTimeout(100000)

beforeEach(async () => {
  const bg = await initBG({
    skipRestore: true,
    initDBFn: d => {
      const cfxHdpath = d.createHdpath({
        name: 'cfx-default',
        value: DEFAULT_CFX_HDPATH,
      })
      const ethHdpath = d.createHdpath({
        name: 'eth-default',
        value: DEFAULT_ETH_HDPATH,
      })
      d.createNetwork({
        name: 'CFX_MAINNET',
        endpoint: CFX_LOCALNET_RPC_ENDPOINT,
        type: 'cfx',
        chainId: CFX_LOCALNET_CHAINID,
        netId: CFX_LOCALNET_NETID,
        ticker: CFX_LOCALNET_CURRENCY_SYMBOL,
        hdpath: cfxHdpath,
      })
      d.createNetwork({
        name: 'ETH_MAINNET',
        endpoint: ETH_LOCALNET_RPC_ENDPOINT,
        type: 'eth',
        chainId: ETH_LOCALNET_CHAINID,
        netId: ETH_LOCALNET_NETID,
        ticker: ETH_LOCALNET_CURRENCY_SYMBOL,
        hdpath: ethHdpath,
      })
    },
  })
  request = bg.request
  db = bg.db
})

describe('integration test', function () {
  describe('vault', function () {
    describe('import', function () {
      test('import hd vault', async function () {
        await request({
          method: 'wallet_importMnemonic',
          params: {mnemonic: MNEMONIC, password},
        })

        expect(db.getVault().length).toBe(1)
        expect(db.getVaultByType('hd').length).toBe(1)

        const groups = db.getAccountGroup()
        expect(groups.length).toBe(1)

        await delay(2000)
        expect(db.getAccount().length).toBe(1)
        expect(db.getAddress().length).toBe(2)
      })

      test('import hd vault with first two account has balance', async function () {
        await sendCFX({to: ACCOUNTS[0].address, balance: 1})
        await sendCFX({to: ACCOUNTS[1].address, balance: 1})
        await sendCFX({to: ACCOUNTS[2].address, balance: 1})
        await sendETH({to: ACCOUNTS[0].address, balance: 1})
        await sendETH({to: ACCOUNTS[1].address, balance: 1})
        await sendETH({to: ACCOUNTS[2].address, balance: 1})
        await request({
          method: 'wallet_importMnemonic',
          params: {mnemonic: MNEMONIC, password},
        })

        expect(db.getVault().length).toBe(1)
        expect(db.getVaultByType('hd').length).toBe(1)

        const groups = db.getAccountGroup()
        expect(groups.length).toBe(1)

        await delay(1000)
        expect(db.getAccount().length).toBe(3)
        expect(db.getAddress().length).toBe(6)
      })

      test('import private key vault', async function () {
        const {result: pk} = await request({
          method: 'wallet_generatePrivateKey',
          params: {entropy: 'abc'},
        })

        expect(db.getVaultByType('pk').length).toBe(0)
        expect(db.getVault().length).toBe(0)

        await request({
          method: 'wallet_importPrivateKey',
          params: {privateKey: pk, password},
        })

        expect(db.getVaultByType('pk').length).toBe(1)
        expect(db.getVault().length).toBe(1)
        expect(db.getAccount().length).toBe(1)
        expect(db.getAddress().length).toBe(2)
      })

      test('should be able to import a address vault', async function () {
        expect(db.getVault().length).toBe(0)
        expect(db.getVaultByType('pub').length).toBe(0)

        await request({
          method: 'wallet_importAddress',
          params: {
            address:
              'NET2999:TYPE.USER:AAMWWX800RCW63N42KBEHESUUKJDJCNUAACA2K0ZUC',
            password,
          },
        })

        expect(db.getVault().length).toBe(1)
        expect(db.getVaultByType('pub').length).toBe(1)
        expect(db.getAccount().length).toBe(1)
        expect(db.getAddress().length).toBe(1)
      })
    })
  })
})
