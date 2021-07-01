// eslint-disable-next-line no-unused-vars
import { expect, describe, test, it, jest, afterAll, afterEach, beforeAll, beforeEach } from '@jest/globals' // prettier-ignore
import waitForExpect from 'wait-for-expect'

import {initBG} from './index.js'
import {
  CFX_MAINNET_NAME,
  CFX_LOCALNET_RPC_ENDPOINT,
  CFX_LOCALNET_CHAINID,
  CFX_LOCALNET_NETID,
  CFX_LOCALNET_CURRENCY_SYMBOL,
  DEFAULT_CFX_HDPATH,
  ETH_MAINNET_NAME,
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
        name: CFX_MAINNET_NAME,
        endpoint: CFX_LOCALNET_RPC_ENDPOINT,
        type: 'cfx',
        chainId: CFX_LOCALNET_CHAINID,
        netId: CFX_LOCALNET_NETID,
        ticker: CFX_LOCALNET_CURRENCY_SYMBOL,
        hdPath: cfxHdPath,
      })
      cfxNetId = 3
      d.createNetwork({
        name: ETH_MAINNET_NAME,
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
          networkName: CFX_MAINNET_NAME,
        })
        expect(res.error.message).toMatch(
          /Method eth_getBalance not supported by network CFX_MAINNET/,
        )
      })
      test('error call method with incorrect scope', async function () {
        res = await request({
          method: 'wallet_isLocked',
          _inpage: true,
          _origin: 'example.com',
        })
        expect(res.error.message).toMatch(/MethodNotFound/)

        res = await request({
          method: 'wallet_isLocked',
          _inpage: true,
          _origin: 'conflux-chain.github.io',
        })
        expect(res.result).toBe(false)

        res = await request({
          method: 'wallet_isLocked',
          _popup: true,
        })
        expect(res.result).toBe(false)
      })
    })
  })

  describe('rpcs', function () {
    describe('cfx_getStatus', function () {
      test('cfx_getStatus', async () => {
        const stat = await request({method: 'cfx_getStatus'})
        expect(stat.jsonrpc).toBe('2.0')
        expect(stat.result.chainId).toBe('0xbb7')
        expect(stat.result.networkId).toBe('0xbb7')
      })
    })
    describe('cfx_chainId', function () {
      test('cfx_chainId', async () => {
        const stat = await request({method: 'cfx_chainId'})
        expect(stat.result).toBe('0xbb7')
      })
    })
    describe('cfx_netVersion', function () {
      test('cfx_netVersion', async () => {
        const stat = await request({method: 'cfx_netVersion'})
        expect(stat.result).toBe('2999')
      })
    })
    describe('eth_chainId', function () {
      test('eth_chainId', async () => {
        expect(
          (
            await request({
              method: 'eth_chainId',
              params: [],
              networkName: ETH_MAINNET_NAME,
            })
          ).result,
        ).toBe('0x539')
      })
    })
    describe('net_version', function () {
      test('net_version', async () => {
        expect(
          (
            await request({
              method: 'net_version',
              params: [],
              networkName: ETH_MAINNET_NAME,
            })
          ).result,
        ).toBe('1337')
      })
    })
    describe('wallet_detectNetworkType', function () {
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
      })
    })
    describe('wallet_deleteNetwork', function () {
      test('wallet_deleteNetwork', async () => {
        expect(db.getVault().length).toBe(0)
        expect(db.getNetwork().length).toBe(2)
        expect(db.getNetworkByType('eth').length).toBe(1)

        await request({
          method: 'wallet_importMnemonic',
          params: {mnemonic: MNEMONIC, password},
        })

        await waitForExpect(() => expect(db.getAccount().length).toBe(1))
        await waitForExpect(() => expect(db.getAddress().length).toBe(2))

        expect(
          (
            await request({
              method: 'wallet_deleteNetwork',
              params: {password, networkId: db.getNetworkByType('eth')[0].eid},
            })
          ).result,
        ).toBe(true)
        expect(db.getNetworkByType('eth').length).toBe(0)
        expect(db.getNetwork().length).toBe(1)
        expect(db.getAccount().length).toBe(1)
        expect(db.getAddress().length).toBe(1)
      })
      test('delete builtin network', async () => {
        db.createNetwork({
          name: 'foo',
          endpoint: 'http://example.com',
          type: 'cfx',
          chainId: '0x1',
          netId: 1,
          ticker: 'CFX',
          hdPath: 1,
          builtin: true,
        })
        expect(db.getNetwork().length).toBe(3)
        expect(
          (
            await request({
              method: 'wallet_deleteNetwork',
              params: {password, networkId: db.getNetworkByName('foo')[0].eid},
            })
          ).error.message,
        ).toMatch(/Not allowed to delete builtin network/)
        expect(db.getNetwork().length).toBe(3)
      })
    })
    describe('wallet_addNetwork', function () {
      test('add cfx network omit hdPath', async () => {
        await request({
          method: 'wallet_importMnemonic',
          params: {mnemonic: MNEMONIC, password},
        })
        await waitForExpect(() => expect(db.getAccount().length).toBe(1))
        await waitForExpect(() => expect(db.getAddress().length).toBe(2))

        const networkId = (
          await request({
            method: 'wallet_addNetwork',
            params: {
              url: CFX_LOCALNET_RPC_ENDPOINT + '/',
              name: 'cfxfoo',
              ticker: 'cfx',
            },
          })
        ).result

        expect(db.getAccount().length).toBe(1)
        const addrs = db.getAddress()
        expect(addrs.length).toBe(3)
        expect(addrs[addrs.length - 1].hex).toBe(CFX_ACCOUNTS[0].address)
        expect(addrs[addrs.length - 1].cfxHex).toBe(CFX_ACCOUNTS[0].cfxHex)
        expect(db.getNetworkById(networkId).address[0].eid).toBe(
          addrs[addrs.length - 1].eid,
        )
      })
      test('add eth network omit hdPath', async () => {
        await request({
          method: 'wallet_importMnemonic',
          params: {mnemonic: MNEMONIC, password},
        })
        await waitForExpect(() => expect(db.getAccount().length).toBe(1))
        await waitForExpect(() => expect(db.getAddress().length).toBe(2))

        const networkId = (
          await request({
            method: 'wallet_addNetwork',
            params: {
              url: ETH_LOCALNET_RPC_ENDPOINT + '/',
              name: 'ethfoo',
              ticker: 'eth',
            },
          })
        ).result

        expect(db.getAccount().length).toBe(1)
        const addrs = db.getAddress()
        expect(addrs.length).toBe(3)
        expect(addrs[addrs.length - 1].hex).toBe(ETH_ACCOUNTS[0].address)
        expect(addrs[addrs.length - 1].cfxHex).toBe(null)
        expect(db.getNetworkById(networkId).address[0].eid).toBe(
          addrs[addrs.length - 1].eid,
        )
      })
      test('add eth network, with cfxOnly: true, type: pub vault', async () => {
        await request({
          method: 'wallet_importMnemonic',
          params: {mnemonic: MNEMONIC, password},
        })
        await request({
          method: 'wallet_importAddress',
          params: {
            address:
              'NET2999:TYPE.USER:AAMWWX800RCW63N42KBEHESUUKJDJCNUAACA2K0ZUC',
            password,
          },
        })
        await waitForExpect(() => expect(db.getAccount().length).toBe(2))
        await waitForExpect(() => expect(db.getAddress().length).toBe(3))

        const networkEid = (
          await request({
            method: 'wallet_addNetwork',
            params: {
              url: ETH_LOCALNET_RPC_ENDPOINT + '/',
              name: 'ethfoo',
              ticker: 'eth',
            },
          })
        ).result

        await waitForExpect(() => expect(db.getAccount().length).toBe(2))
        await waitForExpect(() => expect(db.getAddress().length).toBe(4))

        const addrs = db.getAddress()
        expect(addrs[addrs.length - 1].hex).toBe(ETH_ACCOUNTS[0].address)
        expect(addrs[addrs.length - 1].cfxHex).toBe(null)
        expect(db.getNetworkById(networkEid).address[0].eid).toBe(
          addrs[addrs.length - 1].eid,
        )
      })
    })
    describe('wallet_importAddress', function () {
      test('wallet_importAddress', async function () {
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
    describe('wallet_importPrivateKey', function () {
      test('wallet_importPrivateKey', async function () {
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
    })
    describe('wallet_importMnemonic', function () {
      test('wallet_importMnemonic', async function () {
        expect(db.getVault().length).toBe(0)

        await request({
          method: 'wallet_importMnemonic',
          params: {mnemonic: MNEMONIC, password},
        })

        expect(db.getVault().length).toBe(1)
        expect(db.getVaultByType('hd').length).toBe(1)
        expect(db.getAccountGroup().length).toBe(1)

        await waitForExpect(() => expect(db.getAccount().length).toBe(1))
        await waitForExpect(() => expect(db.getAddress().length).toBe(2))

        const cfxAddr = db.getNetworkById(cfxNetId).address[0]
        expect(cfxAddr.hex).toBe(CFX_ACCOUNTS[0].address)
        expect(cfxAddr.cfxHex).toBe(CFX_ACCOUNTS[0].cfxHex)
        expect(cfxAddr.pk).toBe(CFX_ACCOUNTS[0].privateKey)
        expect(cfxAddr.index).toBe(CFX_ACCOUNTS[0].index)
        expect(cfxAddr.base32).toBe(CFX_ACCOUNTS[0].base32)
        const ethAddr = db.getNetworkById(ethNetId).address[0]
        expect(ethAddr.hex).toBe(ETH_ACCOUNTS[0].address)
        expect(ethAddr.pk).toBe(ETH_ACCOUNTS[0].privateKey)
        expect(ethAddr.index).toBe(ETH_ACCOUNTS[0].index)
        expect(ethAddr.cfxHex).toBeNull()
        expect(ethAddr.base32).toBeNull()
      })
    })
    describe('wallet_createAccount', function () {
      test('wallet_createAccount', async function () {
        expect(db.getVault().length).toBe(0)

        await request({
          method: 'wallet_importMnemonic',
          params: {mnemonic: MNEMONIC, password},
        })

        await waitForExpect(() => expect(db.getAccount().length).toBe(1))
        await waitForExpect(() => expect(db.getAddress().length).toBe(2))

        await request({
          method: 'wallet_createAccount',
          params: {accountGroupId: db.getAccountGroup()[0].eid},
        })

        expect(db.getAccount().length).toBe(2)
        expect(db.getAddress().length).toBe(4)
      })
      test('wallet_createAccount with nickname', async function () {
        expect(db.getVault().length).toBe(0)

        await request({
          method: 'wallet_importMnemonic',
          params: {mnemonic: MNEMONIC, password},
        })

        await waitForExpect(() => expect(db.getAccount().length).toBe(1))
        await waitForExpect(() => expect(db.getAddress().length).toBe(2))

        await request({
          method: 'wallet_createAccount',
          params: {
            accountGroupId: db.getAccountGroup()[0].eid,
            nickname: 'foo',
          },
        })

        expect(db.getAccount().length).toBe(2)
        expect(db.getAddress().length).toBe(4)
        expect(db.getAccount({nickname: 'foo'}).length).toBe(1)
      })
      test('wallet_createAccount with duplicate nickname', async function () {
        expect(db.getVault().length).toBe(0)

        await request({
          method: 'wallet_importMnemonic',
          params: {mnemonic: MNEMONIC, password},
        })

        await waitForExpect(() => expect(db.getAccount().length).toBe(1))
        await waitForExpect(() => expect(db.getAddress().length).toBe(2))

        res = await request({
          method: 'wallet_createAccount',
          params: {
            accountGroupId: db.getAccountGroup()[0].eid,
            nickname: 'Account 1',
          },
        })

        expect(res.error.message).toMatch(
          /Invalid nickname "Account 1", duplicate with other account in the same account group/,
        )
      })
    })
    describe('wallet_getAccountGroup', function () {
      test('wallet_getAccountGroup', async function () {
        await request({
          method: 'wallet_importMnemonic',
          params: {mnemonic: MNEMONIC, password},
        })

        await waitForExpect(() => expect(db.getAccount().length).toBe(1))
        await waitForExpect(() => expect(db.getAddress().length).toBe(2))

        res = await request({
          method: 'wallet_getAccountGroup',
          params: {type: 'hd'},
        })
        expect(res.result.length).toBe(1)

        res = await request({
          method: 'wallet_getAccountGroup',
          params: {type: 'pk'},
        })
        expect(res.result.length).toBe(0)
      })
    })
    describe('wallet_updateAccountGroup', function () {
      test('wallet_updateAccountGroup', async function () {
        await request({
          method: 'wallet_importMnemonic',
          params: {mnemonic: MNEMONIC, password},
        })

        await waitForExpect(() => expect(db.getAccount().length).toBe(1))
        await waitForExpect(() => expect(db.getAddress().length).toBe(2))

        expect(db.getAccountGroup()[0].nickname).toBe('Vault 1')
        expect(db.getAccountGroup()[0].hidden).toBeFalsy()
        await request({
          method: 'wallet_updateAccountGroup',
          params: {
            accountGroupId: db.getAccountGroup()[0].eid,
            hidden: true,
            nickname: 'foo',
          },
        })
        expect(db.getAccountGroup()[0].nickname).toBe('foo')
        expect(db.getAccountGroup()[0].hidden).toBe(true)
      })
    })
    describe('wallet_updateAccount', function () {
      test('wallet_updateAccount', async function () {
        await request({
          method: 'wallet_importMnemonic',
          params: {mnemonic: MNEMONIC, password},
        })

        await waitForExpect(() => expect(db.getAccount().length).toBe(1))
        await waitForExpect(() => expect(db.getAddress().length).toBe(2))

        expect(db.getAccount()[0].nickname).toBe('Account 1')
        expect(db.getAccount()[0].hidden).toBeFalsy()
        await request({
          method: 'wallet_updateAccount',
          params: {
            accountId: db.getAccount()[0].eid,
            hidden: true,
            nickname: 'foo',
          },
        })
        expect(db.getAccount()[0].nickname).toBe('foo')
        expect(db.getAccount()[0].hidden).toBe(true)
      })
      test('wallet_updateAccount with duplicate nickname', async function () {
        await request({
          method: 'wallet_importMnemonic',
          params: {mnemonic: MNEMONIC, password},
        })

        await waitForExpect(() => expect(db.getAccount().length).toBe(1))
        await waitForExpect(() => expect(db.getAddress().length).toBe(2))

        expect(db.getAccount()[0].nickname).toBe('Account 1')
        expect(db.getAccount()[0].hidden).toBeFalsy()
        res = await request({
          method: 'wallet_updateAccount',
          params: {
            accountId: db.getAccount()[0].eid,
            nickname: 'Account 1',
          },
        })
        expect(res.error.message).toMatch(
          /Invalid nickname Account 1, duplicate with other account in the same account group/,
        )
      })
    })
    describe('wallet_exportAccount', function () {
      test('export private key account', async function () {
        const {result: pk} = await request({
          method: 'wallet_generatePrivateKey',
          params: {entropy: 'abc'},
        })

        await request({
          method: 'wallet_importPrivateKey',
          params: {privateKey: pk, password},
        })

        expect(
          (
            await request({
              method: 'wallet_exportAccount',
              params: {password, accountId: db.getAccount()[0].eid},
            })
          ).result,
        ).toBe(pk.replace(/^0x/, ''))
      })

      test('export pub account', async function () {
        await request({
          method: 'wallet_importAddress',
          params: {
            address:
              'NET2999:TYPE.USER:AAMWWX800RCW63N42KBEHESUUKJDJCNUAACA2K0ZUC',
            password,
          },
        })

        expect(
          (
            await request({
              method: 'wallet_exportAccount',
              params: {password, accountId: db.getAccount()[0].eid},
            })
          ).result,
        ).toBe('CFX:TYPE.USER:AAMWWX800RCW63N42KBEHESUUKJDJCNUAAFA2UCFUW')
      })

      test('export hd account', async () => {
        await request({
          method: 'wallet_importMnemonic',
          params: {password, mnemonic: MNEMONIC},
        })

        await waitForExpect(() => expect(db.getAccount().length).toBe(1))
        await waitForExpect(() => expect(db.getAddress().length).toBe(2))

        res = await request({
          method: 'wallet_exportAccount',
          params: {password, accountId: db.getAccount()[0].eid},
        })
        expect(res.result[0].hex).toBe(
          '0x7b3d01a14c84181f4df3983ae68118e4bad48407',
        )
        expect(res.result[0].cfxHex).toBe(
          '0x1b3d01a14c84181f4df3983ae68118e4bad48407',
        )
        expect(res.result[0].base32).toBe(
          'NET2999:TYPE.USER:AARX4ARBKWCBUH4R8SPDZ3YBDDWNZZEEA6THG8YTMR',
        )
        expect(res.result[0].privateKey).toBe(
          '0xf581242f2de1111638b9da336c283f177ca1e17cb3d6e3b09434161e26135992',
        )
        expect(res.result[0].network.name).toBe(CFX_MAINNET_NAME)
        expect(res.result[1].hex).toBe(
          '0x1de7fb621a141182bf6e65beabc6e8705cdff3d1',
        )
        expect(res.result[1].cfxHex).toBe(null)
        expect(res.result[1].base32).toBe(null)
        expect(res.result[1].privateKey).toBe(
          '0x6a94c1f02edc1caff0849d46a068ff2819c0a338774fb99674e3d286a3351552',
        )
        expect(res.result[1].network.name).toBe(ETH_MAINNET_NAME)
      })
    })
    describe('wallet_exportAccountGroup', function () {
      test('export private key account group', async function () {
        const {result: pk} = await request({
          method: 'wallet_generatePrivateKey',
          params: {entropy: 'abc'},
        })

        await request({
          method: 'wallet_importPrivateKey',
          params: {privateKey: pk, password},
        })

        expect(
          (
            await request({
              method: 'wallet_exportAccountGroup',
              params: {password, accountGroupId: db.getAccountGroup()[0].eid},
            })
          ).result,
        ).toBe(pk.replace(/^0x/, ''))
      })

      test('export pub account group', async function () {
        await request({
          method: 'wallet_importAddress',
          params: {
            address:
              'NET2999:TYPE.USER:AAMWWX800RCW63N42KBEHESUUKJDJCNUAACA2K0ZUC',
            password,
          },
        })

        expect(
          (
            await request({
              method: 'wallet_exportAccountGroup',
              params: {password, accountGroupId: db.getAccountGroup()[0].eid},
            })
          ).result,
        ).toBe('CFX:TYPE.USER:AAMWWX800RCW63N42KBEHESUUKJDJCNUAAFA2UCFUW')
      })

      test('export hd account group', async () => {
        await request({
          method: 'wallet_importMnemonic',
          params: {password, mnemonic: MNEMONIC},
        })

        await waitForExpect(() => expect(db.getAccount().length).toBe(1))
        await waitForExpect(() => expect(db.getAddress().length).toBe(2))

        expect(
          (
            await request({
              method: 'wallet_exportAccountGroup',
              params: {password, accountGroupId: db.getAccountGroup()[0].eid},
            })
          ).result,
        ).toBe(MNEMONIC)
      })
    })
    describe('wallet_deleteAccountGroup', function () {
      test('wallet_deleteAccountGroup', async () => {
        const {result: pk} = await request({
          method: 'wallet_generatePrivateKey',
          params: {entropy: 'abc'},
        })

        await request({
          method: 'wallet_importPrivateKey',
          params: {privateKey: pk, password},
        })

        expect(db.getAccountGroup().length).toBe(1)

        await request({
          method: 'wallet_deleteAccountGroup',
          params: {
            password,
            accountGroupId: db.getAccountGroup()[0].eid,
          },
        })

        expect(db.getAccountGroup().length).toBe(0)
      })
    })
    describe('wallet_discoverAccount', function () {
      test('wallet_discoverAccount', async function () {
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
    })
  })
})
