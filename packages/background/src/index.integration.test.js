// eslint-disable-next-line no-unused-vars
import {expect, describe, test, it, jest, afterAll, afterEach, beforeAll, beforeEach} from '@jest/globals' // prettier-ignore
import waitForExpect from 'wait-for-expect'

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
import {
  MNEMONIC,
  CFX_ACCOUNTS,
  ETH_ACCOUNTS,
  sendCFX,
  sendETH,
} from '@cfxjs/test-helpers'

const password = '12345678'
let request, db, cfxNetId, ethNetId, res
jest.setTimeout(100000)

beforeEach(async () => {
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
        name: 'CFX_MAINNET',
        endpoint: CFX_LOCALNET_RPC_ENDPOINT,
        type: 'cfx',
        chainId: CFX_LOCALNET_CHAINID,
        netId: CFX_LOCALNET_NETID,
        ticker: CFX_LOCALNET_CURRENCY_SYMBOL,
        hdPath: cfxHdPath,
      })
      cfxNetId = 3
      d.createNetwork({
        name: 'ETH_MAINNET',
        endpoint: ETH_LOCALNET_RPC_ENDPOINT,
        type: 'eth',
        chainId: ETH_LOCALNET_CHAINID,
        netId: ETH_LOCALNET_NETID,
        ticker: ETH_LOCALNET_CURRENCY_SYMBOL,
        hdPath: ethHdPath,
      })
      ethNetId = 4
    },
  })
  request = bg.request
  db = bg.db
})

describe('integration test', function () {
  describe('rpc engine', function () {
    describe('validate permissions', function () {
      test('error call internal method', async () => {
        res = await request({
          method: 'wallet_validatePassword',
          params: {password: '11111111'},
        })
        expect(res.error.message).toMatch(
          /Method wallet_validatePassword not found, not allowed to call internal method directly/,
        )
      })
      test('error call restrict method when wallet locked', async () => {
        db.setLocked(true)
        res = await request({
          method: 'wallet_importPrivateKey',
          params: {password: '11111111', privateKey: 'abc'},
        })
        expect(res.error.message).toMatch(
          /Method wallet_importPrivateKey not found, wallet is locked/,
        )
      })
      test('error call method on incorrect network', async () => {
        res = await request({
          method: 'eth_getBalance',
          params: {password: '11111111', privateKey: 'abc'},
          networkName: 'CFX_MAINNET',
        })
        expect(res.error.message).toMatch(
          /Method eth_getBalance not supported by network CFX_MAINNET/,
        )
      })
    })
  })

  describe('vault', function () {
    describe('import', function () {
      test('import hd vault with default node', async function () {
        expect(db.getVault().length).toBe(0)

        await request({
          method: 'wallet_importMnemonic',
          params: {mnemonic: MNEMONIC, password},
        })

        expect(db.getVault().length).toBe(1)
        expect(db.getVaultByType('hd').length).toBe(1)

        const groups = db.getAccountGroup()
        expect(groups.length).toBe(1)

        await waitForExpect(() => expect(db.getAccount().length).toBe(1))
        await waitForExpect(() => expect(db.getAddress().length).toBe(2))

        const cfxAddr = db.getAddress({network: cfxNetId})[0]
        expect(cfxAddr.hex).toBe(CFX_ACCOUNTS[0].address)
        expect(cfxAddr.cfxHex).toBe(CFX_ACCOUNTS[0].cfxHex)
        expect(cfxAddr.pk).toBe(CFX_ACCOUNTS[0].privateKey)
        expect(cfxAddr.index).toBe(CFX_ACCOUNTS[0].index)
        expect(cfxAddr.base32).toBe(CFX_ACCOUNTS[0].base32)
        const ethAddr = db.getAddress({network: ethNetId})[0]
        expect(ethAddr.hex).toBe(ETH_ACCOUNTS[0].address)
        expect(ethAddr.pk).toBe(ETH_ACCOUNTS[0].privateKey)
        expect(ethAddr.index).toBe(ETH_ACCOUNTS[0].index)
        expect(ethAddr.cfxHex).toBeNull()
        expect(ethAddr.base32).toBeNull()

        await request({
          method: 'wallet_createAccount',
          params: {accountGroupId: groups[0].eid},
        })

        expect(db.getAccount().length).toBe(2)
        expect(db.getAddress().length).toBe(4)

        res = await request({
          method: 'wallet_createAccount',
          params: {accountGroupId: groups[0].eid, nickname: 'Account 1'},
        })

        expect(res.error.message).toMatch(
          /Invalid nickname "Account 1", duplicate with other account in the same account group/,
        )
      })

      test('import hd vault with first two account has balance', async function () {
        await sendCFX({to: CFX_ACCOUNTS[0].address, balance: 1})
        await sendCFX({to: CFX_ACCOUNTS[1].address, balance: 1})
        await sendCFX({to: CFX_ACCOUNTS[2].address, balance: 1})
        await sendETH({to: ETH_ACCOUNTS[0].address, balance: 1})
        await sendETH({to: ETH_ACCOUNTS[1].address, balance: 1})
        await sendETH({to: ETH_ACCOUNTS[2].address, balance: 1})

        expect(db.getVault().length).toBe(0)

        await request({
          method: 'wallet_importMnemonic',
          params: {mnemonic: MNEMONIC, password},
        })

        expect(db.getVault().length).toBe(1)
        expect(db.getVaultByType('hd').length).toBe(1)

        const groups = db.getAccountGroup()
        expect(groups.length).toBe(1)

        await waitForExpect(() => expect(db.getAccount().length).toBe(3))
        await waitForExpect(() => expect(db.getAddress().length).toBe(6))

        await sendETH({to: ETH_ACCOUNTS[3].address, balance: 1})
        await sendETH({to: ETH_ACCOUNTS[4].address, balance: 1})
        await sendETH({to: ETH_ACCOUNTS[5].address, balance: 1})

        await request({
          method: 'wallet_discoverAccounts',
          params: {
            accountGroupId: groups[0].eid,
            waitTillFinish: true,
            limit: 1,
          },
        })

        await waitForExpect(() => expect(db.getAccount().length).toBe(4))
        await waitForExpect(() => expect(db.getAddress().length).toBe(8))

        await request({
          method: 'wallet_discoverAccounts',
          params: {accountGroupId: groups[0].eid, waitTillFinish: true},
        })

        await waitForExpect(() => expect(db.getAccount().length).toBe(6))
        await waitForExpect(() => expect(db.getAddress().length).toBe(12))
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

        expect(db.getVault().length).toBe(1)
        expect(db.getVaultByType('pk').length).toBe(1)
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
