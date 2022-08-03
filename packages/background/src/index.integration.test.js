/* eslint-disable jest/no-commented-out-tests */
// eslint-disable-next-line no-unused-vars
import { expect, describe, test, it, jest, afterAll, afterEach, beforeAll, beforeEach } from '@jest/globals' // prettier-ignore
import waitForExpect from 'wait-for-expect'
import {decrypt} from 'browser-passworder'
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
  CFX_TESTNET_EXPLORER_URL,
} from '@fluent-wallet/consts'
import {
  MNEMONIC,
  CFX_ACCOUNTS,
  ETH_ACCOUNTS,
  sendCFX,
  sendETH,
} from '@fluent-wallet/test-helpers'
import {
  deployCRC20,
  deployERC20,
} from '@fluent-wallet/test-helpers/deploy-contracts'

const password = '12345678'
let request, db, cfxNetId, ethNetId, res, req
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
        selected: true,
        chainId: CFX_LOCALNET_CHAINID,
        netId: CFX_LOCALNET_NETID,
        cacheTime: 500,
        ticker: {
          name: CFX_LOCALNET_CURRENCY_NAME,
          symbol: CFX_LOCALNET_CURRENCY_SYMBOL,
          decimals: DEFAULT_CURRENCY_DECIMALS,
        },
        balanceChecker: 'net2999:ach8cpret14pg9huwjtpva62w2pa1z1d0ub91hshds',
        hdPath: cfxHdPath,
        isMainnet: true,
      })
      cfxNetId = 4
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
        balanceChecker: '0x33845d47195725a6b0a08eeda1e60ce9f2dcc80b',
        hdPath: ethHdPath,
        isMainnet: true,
      })
      ethNetId = 5
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
          method: 'wallet_exportAll',
          params: {password: '11111111', encryptPassword: '11111111'},
        })
        expect(res.error.message).toMatch(
          /Method wallet_exportAll not found, wallet is locked/,
        )
      })
      test('error call method on incorrect network', async () => {
        res = await request({
          method: 'eth_getBalance',
          params: {password: '11111111', privateKey: 'abc'},
          networkName: CFX_MAINNET_NAME,
        })
        expect(res.error.message).toMatch(
          /Method eth_getBalance not supported by network Conflux Mainnet/,
        )
      })
      test('error call method with incorrect scope', async function () {
        res = await request({
          method: 'wallet_getAccountGroup',
          _inpage: true,
          _origin: 'foo.site',
        })
        expect(res.error.message).toMatch(/MethodNotFound/)

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

    describe('wallet_accounts', function () {
      test('wallet_accounts', async () => {
        await request({
          method: 'wallet_importMnemonic',
          params: {mnemonic: MNEMONIC, password},
        })
        const accountsCfx = await request({method: 'wallet_accounts'})
        expect(accountsCfx.result[0]).toBe(CFX_ACCOUNTS[0].base32)
        const accountsCfxInpage = await request({
          method: 'wallet_accounts',
          _inpage: true,
          _origin: 'foo.site',
        })
        expect(accountsCfxInpage.result).toEqual([])
        const accountsAnother = await request({
          method: 'wallet_accounts',
          params: [],
          networkName: ETH_MAINNET_NAME,
        })
        expect(accountsAnother.result[0]).toBe(ETH_ACCOUNTS[0].address)
        const accountsFromInpage = await request({
          _origin: 'foo.site',
          _inpage: true,
          method: 'wallet_accounts',
          params: [],
          networkName: ETH_MAINNET_NAME,
        })
        expect(accountsFromInpage.result).toEqual([])
      })
    })

    describe('wallet_chainId', function () {
      test('wallet_chainId', async () => {
        res = await request({
          method: 'wallet_chainId',
          params: [],
          networkName: ETH_MAINNET_NAME,
        })
        expect(res.result).toBe('0x539')
        res = await request({method: 'wallet_chainId'})
        expect(res.result).toBe('0xbb7')
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
    describe('cfx_estimateGasAndCollateral', function () {
      test('cfx_estimateGasAndCollateral', async () => {
        res = await request({
          method: 'cfx_estimateGasAndCollateral',
          params: [{}],
        })
        expect(res?.result).toBeDefined()
        expect(res.result.gasLimit).toBeDefined()
        expect(res.result.gasUsed).toBeDefined()
        expect(res.result.storageCollateralized).toBeDefined()
      })
    })
    describe('eth_estimateGas', function () {
      test('eth_estimateGas', async () => {
        res = await request({
          method: 'eth_estimateGas',
          params: [{}, 'latest'],
          networkName: ETH_MAINNET_NAME,
        })
        expect(res?.result).toBeDefined()
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
        expect(
          (
            await request({
              method: 'wallet_detectNetworkType',
              params: {url: 'https://example.com'},
            })
          ).error.message,
        ).toMatch(/Invalid rpc endpoint/)
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
        expect(db.getNetwork()[0].selected).toBe(true)
      })
      test('delete builtin network', async () => {
        db.createNetwork({
          name: 'foo',
          endpoint: 'http://example.com',
          type: 'cfx',
          chainId: '0x1',
          netId: 1,
          ticker: {
            name: CFX_LOCALNET_CURRENCY_NAME,
            symbol: CFX_LOCALNET_CURRENCY_SYMBOL,
            decimals: DEFAULT_CURRENCY_DECIMALS,
          },
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
    describe('wallet_getNetwork', function () {
      test.todo('wallet_getNetwork')
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
              chainId: '0xbb7',
              chainName: 'cfxfoo',
              nativeCurrency: {
                name: 'CFX',
                decimals: DEFAULT_CURRENCY_DECIMALS,
                symbol: 'CFX',
              },
              rpcUrls: [CFX_LOCALNET_RPC_ENDPOINT + '/'],
            },
            _rpcStack: ['frombg'],
            _internal: true,
          })
        ).result

        expect(db.getAccount().length).toBe(1)
        await waitForExpect(() => expect(db.getAddress().length).toBe(3), 20000)
        const addrs = db.getAddress()
        expect(addrs[addrs.length - 1].hex).toBe(CFX_ACCOUNTS[0].address)
        expect(addrs[addrs.length - 1].value).toBe(CFX_ACCOUNTS[0].base32)
        expect(db.findAddress({networkId})[0]).toBe(addrs[addrs.length - 1].eid)

        //error case:Duplicate network endpoint
        res = await request({
          method: 'wallet_addNetwork',
          params: {
            chainId: '0xbb7',
            chainName: 'cfxfoo1',
            nativeCurrency: {
              name: 'CFX',
              decimals: DEFAULT_CURRENCY_DECIMALS,
              symbol: 'CFX',
            },
            rpcUrls: [CFX_LOCALNET_RPC_ENDPOINT + '/'],
          },
          _rpcStack: ['frombg'],
          _internal: true,
        })

        await waitForExpect(() =>
          expect(res.error.message).toMatch(/Duplicate network endpoint/),
        )

        //error case:Invalid chainId
        res = await request({
          method: 'wallet_addNetwork',
          params: {
            chainId: '0xbb8',
            chainName: 'cfxfoo1',
            nativeCurrency: {
              name: 'CFX',
              decimals: DEFAULT_CURRENCY_DECIMALS,
              symbol: 'CFX',
            },
            rpcUrls: ['http://test.confluxrpc.com/'],
          },
          _rpcStack: ['frombg'],
          _internal: true,
        })
        await waitForExpect(() =>
          expect(res.error.message).toMatch(/Invalid chainId/),
        )

        //test for the new hdPath
        res = await request({
          method: 'wallet_addNetwork',
          params: {
            chainId: '0x1',
            chainName: 'cfxtest1',
            nativeCurrency: {
              name: 'CFX',
              decimals: DEFAULT_CURRENCY_DECIMALS,
              symbol: 'CFX',
            },
            rpcUrls: ['http://test.confluxrpc.com/'],
            blockExplorerUrls: [CFX_TESTNET_EXPLORER_URL], //only for test,it is not the real scan url
            iconUrls: [
              'https://cdn.jsdelivr.net/gh/Conflux-Chain/helios@dev/packages/built-in-network-icons/cfx.svg',
            ],
            hdPath: `m/44'/0'/0'/0`,
          },
          _rpcStack: ['frombg'],
          _internal: true,
        })
        await waitForExpect(() =>
          expect(typeof res.result === 'number').toEqual(true),
        )
      })
      // test('add eth network omit hdPath', async () => {
      //   await request({
      //     method: 'wallet_importMnemonic',
      //     params: {mnemonic: MNEMONIC, password},
      //   })
      //   await waitForExpect(() => expect(db.getAccount().length).toBe(1))
      //   await waitForExpect(() => expect(db.getAddress().length).toBe(2))

      //   const networkId = (
      //     await request({
      //       method: 'wallet_addNetwork',
      //       params: {
      //         chainId: '0x539',
      //         chainName: 'ethfoo',
      //         nativeCurrency: {
      //           name: 'ETH',
      //           symbol: 'ETH',
      //           decimals: DEFAULT_CURRENCY_DECIMALS,
      //         },
      //         rpcUrls: [ETH_LOCALNET_RPC_ENDPOINT + '/'],
      //       },
      //       _rpcStack: ['frombg'],
      //       _internal: true,
      //     })
      //   ).result

      //   expect(db.getAccount().length).toBe(1)
      //   await waitForExpect(() => expect(db.getAddress().length).toBe(3), 20000)
      //   const addrs = db.getAddress()
      //   expect(addrs[addrs.length - 1].hex).toBe(ETH_ACCOUNTS[0].address)
      //   expect(db.findAddress({networkId})[0]).toBe(addrs[addrs.length - 1].eid)
      // })

      // test('add eth network, with cfxOnly: true, type: pub vault', async () => {
      //   await request({
      //     method: 'wallet_importMnemonic',
      //     params: {mnemonic: MNEMONIC, password},
      //   })
      //   await request({
      //     method: 'wallet_importAddress',
      //     params: {
      //       address: 'net2999:aamwwx800rcw63n42kbehesuukjdjcnuaaca2k0zuc',
      //       password,
      //     },
      //   })
      //   await waitForExpect(() => expect(db.getAccount().length).toBe(2))
      //   await waitForExpect(() => expect(db.getAddress().length).toBe(3))

      //   const networkEid = (
      //     await request({
      //       method: 'wallet_addNetwork',
      //       params: {
      //         chainId: '0x539',
      //         chainName: 'ethfoo',
      //         nativeCurrency: {
      //           name: 'ETH',
      //           symbol: 'ETH',
      //           decimals: DEFAULT_CURRENCY_DECIMALS,
      //         },
      //         rpcUrls: [ETH_LOCALNET_RPC_ENDPOINT + '/'],
      //       },
      //       _rpcStack: ['frombg'],
      //       _internal: true,
      //     })
      //   ).result

      //   await waitForExpect(() => expect(db.getAccount().length).toBe(2))
      //   await waitForExpect(() => expect(db.getAddress().length).toBe(4))

      //   const addrs = db.getAddress()
      //   expect(addrs[addrs.length - 1].hex).toBe(ETH_ACCOUNTS[0].address)
      //   expect(db.findAddress({networkId: networkEid})[0]).toBe(
      //     addrs[addrs.length - 1].eid,
      //   )
      // })
    })
    describe('wallet_updateNetwork', function () {
      test('update cfx network omit hdPath', async () => {
        await request({
          method: 'wallet_importMnemonic',
          params: {mnemonic: MNEMONIC, password},
        })
        await waitForExpect(() => expect(db.getAccount().length).toBe(1))
        await waitForExpect(() => expect(db.getAddress().length).toBe(2))

        await request({
          method: 'wallet_updateNetwork',
          params: {
            networkId: db.getNetwork()[0].eid,
            chainId: '0xbb7',
            chainName: 'cfxfoo',
            nativeCurrency: {
              name: 'CFX',
              decimals: DEFAULT_CURRENCY_DECIMALS,
              symbol: 'CFX',
            },
            rpcUrls: [CFX_LOCALNET_RPC_ENDPOINT + '/'],
          },
        })

        await waitForExpect(() =>
          expect(db.getNetwork()[0].name).toBe('cfxfoo'),
        )
      })
    })
    describe('wallet_updateTokenList', function () {
      test.todo('wallet_updateTokenList')
    })
    describe('wallet_importAddress', function () {
      test('wallet_importAddress', async function () {
        expect(db.getVault().length).toBe(0)
        expect(db.getVaultByType('pub').length).toBe(0)

        await request({
          method: 'wallet_importAddress',
          params: {
            address: 'net2999:aamwwx800rcw63n42kbehesuukjdjcnuaaca2k0zuc',
            password,
          },
        })

        expect(db.getVault().length).toBe(1)
        expect(db.getVaultByType('pub').length).toBe(1)
        expect(db.getAccount().length).toBe(1)
        expect(db.getAccount()[0].selected).toBe(true)
        expect(db.getAddress().length).toBe(1)
      })
    })
    describe('wallet_importPrivateKey', function () {
      test('wallet_importPrivateKey', async function () {
        const {result: pk} = await request({
          method: 'wallet_generatePrivateKey',
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
        expect(db.getAccount()[0].selected).toBe(true)
        expect(db.getAddress().length).toBe(2)
      })
    })

    describe('wallet_importHardwareWalletAccountGroupOrAccount', function () {
      test('wallet_importHardwareWalletAccountGroupOrAccount', async function () {
        res = await request({
          method: 'wallet_importHardwareWalletAccountGroupOrAccount',
          params: {
            accountGroupNickname: 'LedgerNanoS-1',
            accountGroupData: {
              'net2999:aak86utdktvnh3yta2kjvz62yae3kkcu1ywbppysrv': `m/44'/0'/0'/0/0`,
            },
            address: [
              {
                address: 'net2999:aak86utdktvnh3yta2kjvz62yae3kkcu1ywbppysrv',
                nickname: 'LedgerNanoS-1',
              },
            ],
            device: 'LedgerNanoS',
            type: 'cfx',
            password,
          },
        })
        expect(db.getVault().length).toBe(1)
        expect(db.getVaultByType('hw').length).toBe(1)
      })
    })

    describe('wallet_getAccountAddressByNetwork', function () {
      test('wallet_getAccountAddressByNetwork', async function () {
        await Promise.all([
          request({
            method: 'wallet_generatePrivateKey',
          }).then(({result}) =>
            request({
              method: 'wallet_importPrivateKey',
              params: {privateKey: result, password},
            }),
          ),
          request({
            method: 'wallet_generatePrivateKey',
          }).then(({result}) =>
            request({
              method: 'wallet_importPrivateKey',
              params: {privateKey: result, password},
            }),
          ),
        ])

        const [a1, a2] = db.getAccount()
        const res1 = await request({
          method: 'wallet_getAccountAddressByNetwork',
          params: {accountId: a1.eid, networkId: cfxNetId},
        })
        expect(res1.result.value).toBeDefined()
        const res2 = await request({
          method: 'wallet_getAccountAddressByNetwork',
          params: {accountId: a2.eid, networkId: ethNetId},
        })
        expect(res2.result.value).toBe(res2.result.hex)
        const res3 = await request({
          method: 'wallet_getAccountAddressByNetwork',
          params: [
            {accountId: a1.eid, networkId: cfxNetId},
            {accountId: a2.eid, networkId: ethNetId},
          ],
        })
        expect(res3.result[0].value).toBe(res1.result.value)
        expect(res3.result[1].hex).toBe(res2.result.hex)
      })
    })
    describe('wallet_importMnemonic', function () {
      test('wallet_importMnemonic', async function () {
        expect(db.getVault().length).toBe(0)

        await request({
          method: 'wallet_importMnemonic',
          params: {mnemonic: MNEMONIC, password, waitTillFinish: true},
        })

        expect(db.getVault().length).toBe(1)
        expect(db.getVaultByType('hd').length).toBe(1)
        expect(db.getAccountGroup().length).toBe(1)
        expect(db.getAccount().length).toBe(1)
        expect(db.getAddress().length).toBe(2)

        const cfxAddr = db.findAddress({
          networkId: cfxNetId,
          g: {hex: 1, value: 1, pk: 1},
        })[0]
        expect(cfxAddr.hex).toBe(CFX_ACCOUNTS[0].address)
        expect(cfxAddr.value).toBe(CFX_ACCOUNTS[0].base32)
        expect(cfxAddr.pk).toBe(CFX_ACCOUNTS[0].privateKey)
        const ethAddr = db.findAddress({
          networkId: ethNetId,
          g: {hex: 1, value: 1, pk: 1},
        })[0]
        expect(ethAddr.hex).toBe(ETH_ACCOUNTS[0].address)
        expect(ethAddr.pk).toBe(ETH_ACCOUNTS[0].privateKey)
        expect(ethAddr.value).toBe(ETH_ACCOUNTS[0].address)

        //test for error case
        res = await request({
          method: 'wallet_importMnemonic',
          params: {
            mnemonic: MNEMONIC,
            password,
            waitTillFinish: true,
            force: true,
          },
        })
        res = await request({
          method: 'wallet_importMnemonic',
          params: {mnemonic: MNEMONIC, password, waitTillFinish: true},
        })
        expect((await res).error.message).toMatch(
          /Duplicate credential with account group/,
        )
        res = await request({
          method: 'wallet_importMnemonic',
          params: {
            mnemonic: MNEMONIC,
            password,
            waitTillFinish: true,
            cfxOnly: true,
          },
        })
        expect((await res).error.message).toMatch(
          /Duplicate credential\(with different cfxOnly setting\)/,
        )
      })
    })
    describe('wallet_createAccount', function () {
      test('wallet_createAccount', async function () {
        expect(db.getVault().length).toBe(0)

        await request({
          method: 'wallet_importMnemonic',
          params: {mnemonic: MNEMONIC, password, waitTillFinish: true},
        })

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
          params: {mnemonic: MNEMONIC, password, waitTillFinish: true},
        })

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
      // test('wallet_createAccount with duplicate nickname', async function () {
      //   expect(db.getVault().length).toBe(0)

      //   await request({
      //     method: 'wallet_importMnemonic',
      //     params: {mnemonic: MNEMONIC, password, waitTillFinish: true},
      //   })

      //   res = await request({
      //     method: 'wallet_createAccount',
      //     params: {
      //       accountGroupId: db.getAccountGroup()[0].eid,
      //       nickname: 'Seed-1-1',
      //     },
      //   })

      //   expect(res.error.message).toMatch(
      //     /Invalid nickname "Seed-1-1", duplicate with other account in the same account group/,
      //   )
      // })
    })
    describe('wallet_getAccountGroup', function () {
      test('wallet_getAccountGroup', async function () {
        await request({
          method: 'wallet_importMnemonic',
          params: {mnemonic: MNEMONIC, password, waitTillFinish: true},
        })

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
          params: {mnemonic: MNEMONIC, password, waitTillFinish: true},
        })

        expect(db.getAccountGroup()[0].nickname).toBe('Seed-1')
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
          params: {mnemonic: MNEMONIC, password, waitTillFinish: true},
        })

        expect(db.getAccount()[0].nickname).toBe('Seed-1-1')
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
      // test('wallet_updateAccount with duplicate nickname', async function () {
      //   await request({
      //     method: 'wallet_importMnemonic',
      //     params: {mnemonic: MNEMONIC, password, waitTillFinish: true},
      //   })

      //   expect(db.getAccount()[0].nickname).toBe('Seed-1-1')
      //   expect(db.getAccount()[0].hidden).toBeFalsy()
      //   res = await request({
      //     method: 'wallet_updateAccount',
      //     params: {
      //       accountId: db.getAccount()[0].eid,
      //       nickname: 'Seed-1-1',
      //     },
      //   })
      //   expect(res.error.message).toMatch(
      //     /Invalid nickname Seed-1-1, duplicate with other account in the same account group/,
      //   )
      // })
    })
    describe('wallet_exportAccount', function () {
      test('export private key account', async function () {
        const {result: pk} = await request({
          method: 'wallet_generatePrivateKey',
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
            address: 'net2999:aamwwx800rcw63n42kbehesuukjdjcnuaaca2k0zuc',
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
        ).toBe('cfx:aamwwx800rcw63n42kbehesuukjdjcnuaafa2ucfuw')
      })

      test('export hd account', async () => {
        await request({
          method: 'wallet_importMnemonic',
          params: {password, mnemonic: MNEMONIC, waitTillFinish: true},
        })

        res = await request({
          method: 'wallet_exportAccount',
          params: {password, accountId: db.getAccount()[0].eid},
        })
        expect(res.result[0].hex).toBe(
          '0x7b3d01a14c84181f4df3983ae68118e4bad48407',
        )
        expect(res.result[0].value).toBe(
          'net2999:aarx4arbkwcbuh4r8spdz3ybddwnzzeea6thg8ytmr',
        )
        expect(res.result[0].privateKey).toBe(
          '0xf581242f2de1111638b9da336c283f177ca1e17cb3d6e3b09434161e26135992',
        )
        expect(res.result[0].network.name).toBe(CFX_MAINNET_NAME)
        expect(res.result[1].hex).toBe(ETH_ACCOUNTS[0].address)
        expect(res.result[1].value).toEqual(res.result[1].hex)
        expect(res.result[1].privateKey).toBe(
          '0x6a94c1f02edc1caff0849d46a068ff2819c0a338774fb99674e3d286a3351552',
        )
        expect(res.result[1].network.name).toBe(ETH_MAINNET_NAME)
      })
    })
    describe('wallet_exportAll', function () {
      test('wallet_exportAll', async () => {
        const {result: pk} = await request({
          method: 'wallet_generatePrivateKey',
        })

        await request({
          method: 'wallet_importPrivateKey',
          params: {privateKey: pk, password},
        })

        const {result: rst} = await request({
          method: 'wallet_exportAll',
          params: {password, encryptPassword: '11111111'},
        })
        expect(rst.encrypted).toBeDefined()
        const decrypted = await decrypt('11111111', rst.encrypted)
        expect(Array.isArray(JSON.parse(decrypted))).toBe(true)
      })
    })
    describe('wallet_importAll', function () {
      test('wallet_importAll', async () => {
        expect(db.getAccountGroup().length).toBe(0)

        res = await request({
          method: 'wallet_generatePrivateKey',
        })

        await request({
          method: 'wallet_importPrivateKey',
          params: {privateKey: res.result, password},
        })
        expect(db.getAccountGroup().length).toBe(1)

        const {result: rst} = await request({
          method: 'wallet_exportAll',
          params: {password, encryptPassword: '11111111'},
        })

        res = await request({
          method: 'wallet_importAll',
          params: {
            password,
            vaults: JSON.stringify(rst),
            decryptPassword: '11111111',
          },
        })

        expect(res.result).toBe('0x1')
      })
    })
    describe('wallet_exportAccountGroup', function () {
      test('export private key account group', async function () {
        const {result: pk} = await request({
          method: 'wallet_generatePrivateKey',
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
            address: 'net2999:aamwwx800rcw63n42kbehesuukjdjcnuaaca2k0zuc',
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
        ).toBe('cfx:aamwwx800rcw63n42kbehesuukjdjcnuaafa2ucfuw')
      })
      test('export hd account group', async () => {
        await request({
          method: 'wallet_importMnemonic',
          params: {password, mnemonic: MNEMONIC, waitTillFinish: true},
        })

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
    describe('wallet_registerSiteMetadata', function () {
      test('wallet_registerSiteMetadata', async () => {
        req = {
          method: 'wallet_registerSiteMetadata',
          params: {name: 'foo site', icon: 'http://foo.bar.png'},
          _inpage: true,
          _origin: 'foo origin',
          _post: jest.fn(),
        }
        res = await request(req)
        expect(req._post).toHaveBeenCalledWith({
          event: 'connect',
          params: {
            chainId: CFX_LOCALNET_CHAINID,
            networkId: CFX_LOCALNET_NETID,
          },
        })
        expect(res.result).toBe('0x1')
        expect(db.getSite().length).toBe(2)
        expect(db.getSite()[1].name).toBe(req.params.name)
        expect(db.getSite()[1].icon).toBe(req.params.icon)
        expect(db.getSite()[1].origin).toBe(req._origin)
      })
    })
    describe('wallet_requestPermissions', function () {
      test('rejected', async () => {
        req = {
          _origin: 'foo.site',
          _inpage: true,
          method: 'wallet_requestPermissions',
          params: [{cfx_accounts: {}}],
        }

        expect(db.getApp().length).toBe(0)
        expect(db.getAuthReq().length).toBe(0)

        res = null
        request(req).then(rst => (res = rst))

        expect(res).toBeNull()
        await waitForExpect(() => expect(db.getAuthReq().length).toBe(1))
        expect(db.getAuthReq()[0].site.origin).toBe('foo.site')
        expect(db.getAuthReq()[0].app).toBeFalsy()

        const authReq = db.getAuthReq()[0]
        expect(authReq.site.origin).toBe('foo.site')
        expect(authReq.req.method).toBe('wallet_requestPermissions')
        expect(authReq.req.params).toStrictEqual([
          {wallet_basic: {}, wallet_accounts: {}},
        ])

        const res2 = await request({
          method: 'wallet_requestPermissions',
          params: {
            authReqId: authReq.eid,
            permissions: [{eth_accounts: {}}],
            accounts: [],
          },
          _popup: true,
        })

        expect(res2.result).toBe('0x1')

        expect(db.getAuthReq().length).toBe(0)
        expect(db.getApp().length).toBe(0)

        expect(res.error).toBeDefined()
        expect(res.error.message).toMatch(/UserRejected 4001/)
      })
      test('approved', async () => {
        await Promise.all(
          [0, 0, 0].map(() =>
            request({method: 'wallet_generatePrivateKey'}).then(({result}) =>
              request({
                method: 'wallet_importPrivateKey',
                params: {privateKey: result, password},
              }),
            ),
          ),
        )

        req = {
          _origin: 'foo.site',
          _inpage: true,
          method: 'wallet_requestPermissions',
          params: [{cfx_accounts: {}}],
        }

        expect(db.getApp().length).toBe(0)

        res = request(req)

        expect(res instanceof Promise).toBe(true)
        await waitForExpect(() => expect(db.getAuthReq().length).toBe(1))
        const authReq = db.getAuthReq()[0]
        expect(authReq.site.origin).toBe('foo.site')
        expect(authReq.req.method).toBe('wallet_requestPermissions')
        expect(authReq.req.params).toStrictEqual([
          {wallet_basic: {}, wallet_accounts: {}},
        ])

        expect(db.getApp().length).toBe(0)

        const [a1, a2, a3] = db.getAccount()

        const res2 = await request({
          method: 'wallet_requestPermissions',
          params: {
            authReqId: authReq.eid,
            permissions: [{eth_accounts: {}}],
            accounts: [a1.eid, a2.eid],
          },
          _popup: true,
        })

        expect(db.getAuthReq().length).toBe(0)
        expect(db.getApp().length).toBe(1)
        const app = db.getApp()[0]
        // app is from the right site
        expect(app.site.eid).toBe(db.getSite()[0].eid)
        // app has the right permissions
        expect(app.perms).toStrictEqual({wallet_accounts: {}, wallet_basic: {}})
        // app has the right authed accounts
        expect(
          app.account.map(a => [a1.eid, a2.eid].includes(a.eid)),
        ).toStrictEqual([true, true])
        expect(app.account.map(a => a.eid).includes(a3.eid)).toBeFalsy()
        // app has the right currentAccount
        expect([a1.eid, a2.eid].includes(app.currentAccount.eid)).toBe(true)

        expect(res2.result).toBe('0x1')

        expect(
          (await res).result.map(({parentCapability}) => parentCapability),
        ).toStrictEqual([
          'wallet_basic',
          'cfx_basic',
          'eth_basic',
          'wallet_accounts',
          'cfx_accounts',
          'eth_accounts',
        ])
        res = await request({
          method: 'wallet_getPermissions',
          _origin: 'foo.site',
          _inpage: true,
        })
        expect(res.result.map(({date}) => typeof date === 'number')).toEqual([
          true,
          true,
          true,
          true,
          true,
          true,
        ])
        expect(res.result.map(({invoker}) => invoker === 'foo.site')).toEqual([
          true,
          true,
          true,
          true,
          true,
          true,
        ])
      })
      test('from popup', async () => {
        await Promise.all(
          [0, 0, 0].map(() =>
            request({method: 'wallet_generatePrivateKey'}).then(({result}) =>
              request({
                method: 'wallet_importPrivateKey',
                params: {privateKey: result, password},
              }),
            ),
          ),
        )

        expect(db.getApp().length).toBe(0)

        const [a1, a2, a3] = db.getAccount()

        res = await request({
          method: 'wallet_requestPermissions',
          params: {
            siteId: db.getSite()[0].eid,
            permissions: [{eth_accounts: {}}],
            accounts: [a1.eid, a2.eid],
          },
          _popup: true,
        })

        expect(db.getApp().length).toBe(1)
        const app = db.getApp()[0]
        // app is from the right site
        expect(app.site.eid).toBe(db.getSite()[0].eid)
        // app has the right permissions
        expect(app.perms).toStrictEqual({wallet_accounts: {}, wallet_basic: {}})
        // app has the right authed accounts
        expect(
          app.account.map(a => [a1.eid, a2.eid].includes(a.eid)),
        ).toStrictEqual([true, true])
        expect(app.account.map(a => a.eid).includes(a3.eid)).toBeFalsy()
        // app has the right currentAccount
        expect([a1.eid, a2.eid].includes(app.currentAccount.eid)).toBe(true)
        expect(
          res.result.map(({parentCapability}) => parentCapability),
        ).toStrictEqual([
          'wallet_basic',
          'cfx_basic',
          'eth_basic',
          'wallet_accounts',
          'cfx_accounts',
          'eth_accounts',
        ])
      })
    })
    describe('wallet_getPendingAuthRequest', function () {
      test('wallet_getPendingAuthRequest', async () => {
        res = await request({
          method: 'wallet_getPendingAuthRequest',
          _popup: true,
        })
        expect(res.result).toStrictEqual([])
        res = request({
          method: 'wallet_requestPermissions',
          params: [{eth_accounts: {}}],
          _inpage: true,
          _origin: 'foo.site',
        })
        await waitForExpect(() => expect(db.getAuthReq().length).toBe(1))
        const res2 = await request({
          method: 'wallet_getPendingAuthRequest',
          _popup: true,
        })
        expect(res2.result.length).toBe(1)
        expect(res2.result[0].site.origin).toBe('foo.site')

        await request({
          method: 'wallet_requestPermissions',
          params: {
            accounts: [],
            authReqId: db.getAuthReq()[0].eid,
            permissions: [{eth_accounts: {}}],
          },
          _popup: true,
        })
        await res
        expect(
          (
            await request({
              method: 'wallet_getPendingAuthRequest',
              _popup: true,
            })
          ).result,
        ).toStrictEqual([])
      })
    })
    describe('eth_requestAccounts', function () {
      test('rejected', async () => {
        req = {
          method: 'eth_requestAccounts',
          _inpage: true,
          _origin: 'foo.site',
          networkName: ETH_MAINNET_NAME,
        }

        res = request(req)

        await waitForExpect(() => expect(db.getAuthReq().length).toBe(1))

        await request({
          method: 'wallet_requestPermissions',
          params: {
            permissions: [{eth_accounts: {}}],
            accounts: [],
            authReqId: db.getAuthReq()[0].eid,
          },
          _popup: true,
        })

        expect((await res).error.message).toMatch(/UserRejected 4001/)
      })
      test('approved', async () => {
        await Promise.all(
          [0, 0, 0].map(() =>
            request({method: 'wallet_generatePrivateKey'}).then(({result}) =>
              request({
                method: 'wallet_importPrivateKey',
                params: {privateKey: result, password},
              }),
            ),
          ),
        )

        const [, a2, a3] = db.getAccount()

        req = {
          method: 'eth_requestAccounts',
          _inpage: true,
          _origin: 'foo.site',
          networkName: ETH_MAINNET_NAME,
        }

        res = request(req)

        await waitForExpect(() => expect(db.getAuthReq().length).toBe(1))

        await request({
          method: 'wallet_requestPermissions',
          params: {
            permissions: [{eth_accounts: {}}],
            accounts: [a2.eid, a3.eid],
            authReqId: db.getAuthReq()[0].eid,
          },
          networkName: ETH_MAINNET_NAME,
          _popup: true,
        })

        const [app] = db.getApp()
        expect(app.currentAccount.eid).toBe(a3.eid)
        const [addr] = app.currentAccount.address.filter(
          a => a.network.type === 'eth',
        )
        expect((await res).result).toStrictEqual([addr.hex])
      })
    })
    describe('cfx_requestAccounts', function () {
      test('rejected', async () => {
        req = {
          method: 'cfx_requestAccounts',
          _inpage: true,
          _origin: 'foo.site',
          networkName: CFX_MAINNET_NAME,
        }

        res = request(req)

        await waitForExpect(() => expect(db.getAuthReq().length).toBe(1))

        await request({
          method: 'wallet_requestPermissions',
          params: {
            permissions: [{cfx_accounts: {}}],
            accounts: [],
            authReqId: db.getAuthReq()[0].eid,
          },
          _popup: true,
        })

        expect((await res).error.message).toMatch(/UserRejected 4001/)
      })
      test('approved', async () => {
        await Promise.all(
          [0, 0, 0].map(() =>
            request({method: 'wallet_generatePrivateKey'}).then(({result}) =>
              request({
                method: 'wallet_importPrivateKey',
                params: {privateKey: result, password},
              }),
            ),
          ),
        )

        const [, a2, a3] = db.getAccount()

        req = {
          method: 'cfx_requestAccounts',
          _inpage: true,
          _origin: 'foo.site',
          networkName: CFX_MAINNET_NAME,
        }

        res = request(req)

        await waitForExpect(() => expect(db.getAuthReq().length).toBe(1))

        await request({
          method: 'wallet_requestPermissions',
          params: {
            permissions: [{cfx_accounts: {}}],
            accounts: [a2.eid, a3.eid],
            authReqId: db.getAuthReq()[0].eid,
          },
          _popup: true,
        })

        const [app] = db.getApp()
        expect(app.currentAccount.eid).toBe(a3.eid)
        const [addr] = app.currentAccount.address.filter(a => a.value)
        expect((await res).result).toStrictEqual([addr.value])
      })
    })
    describe('wallet_getAddressPrivateKey', function () {
      test('pk vault', async () => {
        const {result: pk} = await request({
          method: 'wallet_generatePrivateKey',
          _popup: true,
        })
        await request({
          method: 'wallet_importPrivateKey',
          params: {privateKey: pk, password},
        })

        expect(
          (
            await request({
              method: 'wallet_getAddressPrivateKey',
              params: {
                password,
                address: db.getAddress()[0].value,
                accountId: db.getAccount()[0].eid,
              },
            })
          ).result,
        ).toBe(pk)
        expect(
          (
            await request({
              method: 'wallet_getAddressPrivateKey',
              params: {
                password,
                address: db.getAddress()[1].value,
                accountId: db.getAccount()[0].eid,
              },
              networkName: ETH_MAINNET_NAME,
            })
          ).result,
        ).toBe(pk)

        db.retractAttr({eid: db.getAddress()[0].eid, attr: 'address/pk'})

        expect(
          (
            await request({
              method: 'wallet_getAddressPrivateKey',
              params: {
                password,
                address: db.getAddress()[0].value,
                accountId: db.getAccount()[0].eid,
              },
            })
          ).result,
        ).toBe(pk)

        db.retractAttr({
          eid: db.findAddress({
            g: {_account: {_accountGroup: {vault: {eid: 1}}}},
          })[0].account[0].accountGroup.vault.eid,
          attr: 'vault/ddata',
        })
      })
      test('hd vault', async () => {
        await request({
          method: 'wallet_importMnemonic',
          params: {mnemonic: MNEMONIC, password, waitTillFinish: true},
        })

        const [a1, a2] = db.getAddress()
        expect(a1.pk).toBe(CFX_ACCOUNTS[0].privateKey)

        expect(
          (
            await request({
              method: 'wallet_getAddressPrivateKey',
              params: {
                password,
                address: a1.value,
                accountId: db.getAccount()[0].eid,
              },
            })
          ).result,
        ).toBe(CFX_ACCOUNTS[0].privateKey)
        expect(
          (
            await request({
              method: 'wallet_getAddressPrivateKey',
              params: {
                password,
                address: a2.value,
                accountId: db.getAccount()[0].eid,
              },
              networkName: ETH_MAINNET_NAME,
            })
          ).result,
        ).toBe(ETH_ACCOUNTS[0].privateKey)

        db.retractAttr({eid: a1.eid, attr: 'address/pk'})
        expect(
          (
            await request({
              method: 'wallet_getAddressPrivateKey',
              params: {
                password,
                address: a1.value,
                accountId: db.getAccount()[0].eid,
              },
            })
          ).result,
        ).toBe(CFX_ACCOUNTS[0].privateKey)

        db.retractAttr({
          eid: db.findAddress({
            addressId: a1.eid,
            g: {
              _account: {_accountGroup: {vault: {eid: 1}}},
            },
          }).account[0].accountGroup.vault.eid,
          attr: 'vault/ddata',
        })
        expect(
          (
            await request({
              method: 'wallet_getAddressPrivateKey',
              params: {
                password,
                address: a1.value,
                accountId: db.getAccount()[0].eid,
              },
            })
          ).result,
        ).toBe(CFX_ACCOUNTS[0].privateKey)
      })
      test('pub vault', async () => {
        await request({
          method: 'wallet_importAddress',
          params: {
            address: 'net2999:aamwwx800rcw63n42kbehesuukjdjcnuaaca2k0zuc',
            password,
          },
        })

        const [addr] = db.getAddress()
        expect(
          (
            await request({
              method: 'wallet_getAddressPrivateKey',
              params: {address: addr.value, accountId: db.getAccount()[0].eid},
              _internal: true,
            })
          ).error.message,
        ).toMatch(/the address vault is pub only/)
      })
    })
    describe('personal_sign', function () {
      test('cfx', async () => {
        await request({
          method: 'wallet_importPrivateKey',
          params: {
            privateKey:
              '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
            password,
          },
        })

        await waitForExpect(() =>
          expect(db.getAccount({selected: true}).length).toBe(1),
        )

        res = request({
          method: 'cfx_requestAccounts',
          _inpage: true,
          _origin: 'foo.site',
          networkName: CFX_MAINNET_NAME,
        })

        await waitForExpect(() => expect(db.getAuthReq().length).toBe(1))

        await request({
          method: 'wallet_requestPermissions',
          params: {
            permissions: [{cfx_accounts: {}}],
            accounts: [db.getAccount()[0].eid],
            authReqId: db.getAuthReq()[0].eid,
          },
          networkName: CFX_MAINNET_NAME,
          _popup: true,
        })

        await res

        res = request({
          method: 'personal_sign',
          params: [
            'Hello, world!',
            'net2999:aasm4c231py7j34fghntcfkdt2nm9xv1tuvduu9rmh',
          ],
          networkName: CFX_MAINNET_NAME,
          _inpage: true,
          _origin: 'foo.site',
        })

        await waitForExpect(() => expect(db.getAuthReq().length).toBe(1))

        await request({
          method: 'personal_sign',
          params: {
            authReqId: db.getAuthReq()[0].eid,
            data: [
              'Hello, world!',
              'net2999:aasm4c231py7j34fghntcfkdt2nm9xv1tuvduu9rmh',
            ],
          },
          networkName: CFX_MAINNET_NAME,
          _popup: true,
        })

        res = await res
        expect(res.result).toBe(
          '0xdd2f79c4e61bdaf2d2536b631539ba74b5333be9109ca4c8d9cc6445a01033dc7e2ac3179a8579c8b06737d1ea05f199f01b5a3db8ff5912abba164be36c809100',
        )

        db.getAddress().map(a =>
          db.retractAttr({eid: a.eid, attr: 'address/pk'}),
        )
        db.getVault().map(a =>
          db.retractAttr({eid: a.eid, attr: 'vault/ddata'}),
        )

        res = request({
          method: 'personal_sign',
          params: [
            'Hello, world!',
            'net2999:aasm4c231py7j34fghntcfkdt2nm9xv1tuvduu9rmh',
          ],
          networkName: CFX_MAINNET_NAME,
          _inpage: true,
          _origin: 'foo.site',
        })

        await waitForExpect(() => expect(db.getAuthReq().length).toBe(1))

        await request({
          method: 'personal_sign',
          params: {
            authReqId: db.getAuthReq()[0].eid,
            data: [
              'Hello, world!',
              'net2999:aasm4c231py7j34fghntcfkdt2nm9xv1tuvduu9rmh',
            ],
          },
          networkName: CFX_MAINNET_NAME,
          _popup: true,
        })

        res = await res
        expect(res.result).toBe(
          '0xdd2f79c4e61bdaf2d2536b631539ba74b5333be9109ca4c8d9cc6445a01033dc7e2ac3179a8579c8b06737d1ea05f199f01b5a3db8ff5912abba164be36c809100',
        )
      })
      test('eth', async () => {
        await request({
          method: 'wallet_importPrivateKey',
          params: {
            privateKey:
              '0x4af1bceebf7f3634ec3cff8a2c38e51178d5d4ce585c52d6043e5e2cc3418bb0',
            password,
          },
        })

        await waitForExpect(() => expect(db.getAccount().length).toBe(1))

        res = request({
          method: 'eth_requestAccounts',
          _inpage: true,
          _origin: 'foo.site',
          networkName: ETH_MAINNET_NAME,
        })

        await waitForExpect(() => expect(db.getAuthReq().length).toBe(1))

        await request({
          method: 'wallet_requestPermissions',
          params: {
            permissions: [{eth_accounts: {}}],
            accounts: [db.getAccount()[0].eid],
            authReqId: db.getAuthReq()[0].eid,
          },
          networkName: ETH_MAINNET_NAME,
          _popup: true,
        })

        await res

        res = request({
          method: 'personal_sign',
          params: [
            'Hello, world!',
            '0x29C76e6aD8f28BB1004902578Fb108c507Be341b',
          ],
          networkName: ETH_MAINNET_NAME,
          _inpage: true,
          _origin: 'foo.site',
        })

        await waitForExpect(() => expect(db.getAuthReq().length).toBe(1))

        await request({
          method: 'personal_sign',
          params: {
            authReqId: db.getAuthReq()[0].eid,
            data: [
              'Hello, world!',
              '0x29C76e6aD8f28BB1004902578Fb108c507Be341b',
            ],
          },
          networkName: ETH_MAINNET_NAME,
          _popup: true,
        })

        res = await res
        expect(res.result).toBe(
          '0x90a938f7457df6e8f741264c32697fc52f9a8f867c52dd70713d9d2d472f2e415d9c94148991bbe1f4a1818d1dff09165782749c877f5cf1eff4ef126e55714d1c',
        )

        db.getAddress().map(a =>
          db.retractAttr({eid: a.eid, attr: 'address/pk'}),
        )
        db.getVault().map(a =>
          db.retractAttr({eid: a.eid, attr: 'vault/ddata'}),
        )

        res = request({
          method: 'personal_sign',
          params: [
            'Hello, world!',
            '0x29C76e6aD8f28BB1004902578Fb108c507Be341b',
          ],
          networkName: ETH_MAINNET_NAME,
          _inpage: true,
          _origin: 'foo.site',
        })

        await waitForExpect(() => expect(db.getAuthReq().length).toBe(1))

        await request({
          method: 'personal_sign',
          params: {
            authReqId: db.getAuthReq()[0].eid,
            data: [
              'Hello, world!',
              '0x29C76e6aD8f28BB1004902578Fb108c507Be341b',
            ],
          },
          networkName: ETH_MAINNET_NAME,
          _popup: true,
        })

        res = await res
        expect(res.result).toBe(
          '0x90a938f7457df6e8f741264c32697fc52f9a8f867c52dd70713d9d2d472f2e415d9c94148991bbe1f4a1818d1dff09165782749c877f5cf1eff4ef126e55714d1c',
        )
      })
    })
    describe('typedSign_v4', function () {
      test.todo('cfx, add this when cfx typed sign finished')
      test('eth', async () => {
        // * typed sign data
        const typedSignData = {
          types: {
            EIP712Domain: [
              {name: 'name', type: 'string'},
              {name: 'version', type: 'string'},
              {name: 'chainId', type: 'uint256'},
              {name: 'verifyingContract', type: 'address'},
            ],
            Person: [
              {name: 'name', type: 'string'},
              {name: 'wallets', type: 'address[]'},
            ],
            Mail: [
              {name: 'from', type: 'Person'},
              {name: 'to', type: 'Person[]'},
              {name: 'contents', type: 'string'},
            ],
            Group: [
              {name: 'name', type: 'string'},
              {name: 'members', type: 'Person[]'},
            ],
          },
          domain: {
            name: 'Ether Mail',
            version: '1',
            chainId: 1,
            verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
          },
          primaryType: 'Mail',
          message: {
            from: {
              name: 'Cow',
              wallets: [
                '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
                '0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF',
              ],
            },
            to: [
              {
                name: 'Bob',
                wallets: [
                  '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
                  '0xB0BdaBea57B0BDABeA57b0bdABEA57b0BDabEa57',
                  '0xB0B0b0b0b0b0B000000000000000000000000000',
                ],
              },
            ],
            contents: 'Hello, Bob!',
          },
        }

        // * add account
        await request({
          method: 'wallet_importPrivateKey',
          params: {
            privateKey:
              '0xc85ef7d79691fe79573b1a7064c19c1a9819ebdbd1faaab1a8ec92344438aaf4',
            password,
          },
        })

        await waitForExpect(() => expect(db.getAccount().length).toBe(1))

        // * auth account
        res = request({
          method: 'eth_requestAccounts',
          _inpage: true,
          _origin: 'foo.site',
          networkName: ETH_MAINNET_NAME,
        })

        await waitForExpect(() => expect(db.getAuthReq().length).toBe(1))

        await request({
          method: 'wallet_requestPermissions',
          params: {
            permissions: [{eth_accounts: {}}],
            accounts: [db.getAccount()[0].eid],
            authReqId: db.getAuthReq()[0].eid,
          },
          networkName: ETH_MAINNET_NAME,
          _popup: true,
        })

        await res

        // * sign
        res = request({
          method: 'eth_signTypedData_v4',
          params: [
            '0xcd2a3d9f938e13cd947ec05abc7fe734df8dd826',
            JSON.stringify(typedSignData),
          ],
          networkName: ETH_MAINNET_NAME,
          _inpage: true,
          _origin: 'foo.site',
        })

        await waitForExpect(() => expect(db.getAuthReq().length).toBe(1))

        await request({
          method: 'eth_signTypedData_v4',
          params: {
            authReqId: db.getAuthReq()[0].eid,
            data: [
              '0xcd2a3d9f938e13cd947ec05abc7fe734df8dd826',
              JSON.stringify(typedSignData),
            ],
          },
          networkName: ETH_MAINNET_NAME,
          _popup: true,
        })

        res = await res
        expect(res.result).toBe(
          '0x65cbd956f2fae28a601bebc9b906cea0191744bd4c4247bcd27cd08f8eb6b71c78efdf7a31dc9abee78f492292721f362d296cf86b4538e07b51303b67f749061b',
        )

        // * sign without cached pk
        db.getAddress().map(a =>
          db.retractAttr({eid: a.eid, attr: 'address/pk'}),
        )
        db.getVault().map(a =>
          db.retractAttr({eid: a.eid, attr: 'vault/ddata'}),
        )

        res = request({
          method: 'eth_signTypedData_v4',
          params: [
            '0xcd2a3d9f938e13cd947ec05abc7fe734df8dd826',
            JSON.stringify(typedSignData),
          ],
          networkName: ETH_MAINNET_NAME,
          _inpage: true,
          _origin: 'foo.site',
        })

        await waitForExpect(() => expect(db.getAuthReq().length).toBe(1))

        await request({
          method: 'eth_signTypedData_v4',
          params: {
            authReqId: db.getAuthReq()[0].eid,
            data: [
              '0xcd2a3d9f938e13cd947ec05abc7fe734df8dd826',
              JSON.stringify(typedSignData),
            ],
          },
          networkName: ETH_MAINNET_NAME,
          _popup: true,
        })

        res = await res
        expect(res.result).toBe(
          '0x65cbd956f2fae28a601bebc9b906cea0191744bd4c4247bcd27cd08f8eb6b71c78efdf7a31dc9abee78f492292721f362d296cf86b4538e07b51303b67f749061b',
        )
      })
    })
    describe('wallet_setCurrentAccount', function () {
      test('without app', async () => {
        await Promise.all(
          [
            CFX_ACCOUNTS[0].privateKey,
            CFX_ACCOUNTS[1].privateKey,
            CFX_ACCOUNTS[2].privateKey,
          ].map(privateKey =>
            request({
              method: 'wallet_importPrivateKey',
              params: {privateKey, password},
            }),
          ),
        )

        const [a1] = db.getAccount({selected: true})
        const [a2, a3] = db.getAccount().filter(a => !a.selected)

        expect(a1).toBeDefined()
        expect(a2).toBeDefined()
        expect(a3).toBeDefined()

        await request({
          method: 'wallet_setCurrentAccount',
          params: [a2.eid],
          _popup: true,
        })
        expect(db.getAccountById(a1.eid).selected).toBeFalsy()
        expect(db.getAccountById(a2.eid).selected).toBeTruthy()
      })
      test('with app', async () => {
        await Promise.all(
          [0, 0, 0].map(() =>
            request({method: 'wallet_generatePrivateKey'}).then(({result}) =>
              request({
                method: 'wallet_importPrivateKey',
                params: {privateKey: result, password},
              }),
            ),
          ),
        )

        const [a1] = db.getAccount({selected: true})
        const [a2, a3] = db.getAccount().filter(a => !a.selected)

        res = request({
          method: 'cfx_requestAccounts',
          _inpage: true,
          _origin: 'foo.site',
          networkName: CFX_MAINNET_NAME,
        })

        await waitForExpect(() => expect(db.getAuthReq().length).toBe(1))

        await request({
          method: 'wallet_requestPermissions',
          params: {
            permissions: [{cfx_accounts: {}}],
            accounts: [a1.eid, a2.eid],
            authReqId: db.getAuthReq()[0].eid,
          },
          networkName: CFX_MAINNET_NAME,
          _popup: true,
        })

        await res

        expect(db.getApp()[0].currentAccount.eid).toBe(a1.eid)
        expect(db.getApp()[0].account.length).toBe(2)

        await request({
          method: 'wallet_setCurrentAccount',
          params: [a2.eid],
          _popup: true,
        })

        expect(db.getAccountById(a2.eid).selected).toBeTruthy()
        expect(db.getAccountById(a1.eid).selected).toBeFalsy()
        expect(db.getApp()[0].currentAccount.eid).toBe(a2.eid)
        expect(db.getApp()[0].account.length).toBe(2)

        await request({
          method: 'wallet_setCurrentAccount',
          params: [a3.eid],
          _popup: true,
        })

        expect(db.getAccountById(a3.eid).selected).toBeTruthy()
        expect(db.getAccountById(a2.eid).selected).toBeFalsy()
        expect(db.getApp()[0].currentAccount.eid).toBe(a2.eid)
        expect(db.getApp()[0].account.length).toBe(2)
      })
    })
    describe('wallet_setCurrentNetwok', function () {
      test('with app', async () => {
        await request({method: 'wallet_generatePrivateKey'}).then(({result}) =>
          request({
            method: 'wallet_importPrivateKey',
            params: {privateKey: result, password},
          }),
        )

        const [a1] = db.getAccount({selected: true})
        const [n1, n2] = db.getNetwork()

        res = request({
          method: 'cfx_requestAccounts',
          _inpage: true,
          _origin: 'foo.site',
          networkName: CFX_MAINNET_NAME,
        })

        await waitForExpect(() => expect(db.getAuthReq().length).toBe(1))

        await request({
          method: 'wallet_requestPermissions',
          params: {
            permissions: [{cfx_accounts: {}}],
            accounts: [a1.eid],
            authReqId: db.getAuthReq()[0].eid,
          },
          networkName: CFX_MAINNET_NAME,
          _popup: true,
        })

        await res

        await request({
          method: 'wallet_setCurrentNetwork',
          params: [n2.eid],
          _popup: true,
        })

        expect(db.getNetworkById(n2.eid).selected).toBeTruthy()
        expect(db.getNetworkById(n1.eid).selected).toBeFalsy()
        expect(db.getApp()[0].currentNetwork.eid).toBe(n2.eid)

        await request({
          method: 'wallet_setCurrentNetwork',
          params: [n1.eid],
          _popup: true,
        })

        expect(db.getNetworkById(n1.eid).selected).toBeTruthy()
        expect(db.getNetworkById(n2.eid).selected).toBeFalsy()
        expect(db.getApp()[0].currentNetwork.eid).toBe(n1.eid)
      })
    })
    describe('wallet_setAppCurrentAccount', function () {
      test('wallet_setAppCurrentAccount', async () => {
        await Promise.all(
          [0, 0, 0].map(() =>
            request({method: 'wallet_generatePrivateKey'}).then(({result}) =>
              request({
                method: 'wallet_importPrivateKey',
                params: {privateKey: result, password},
              }),
            ),
          ),
        )

        const [a1] = db.getAccount({selected: true})
        const [a2] = db.getAccount().filter(a => !a.selected)

        res = request({
          method: 'cfx_requestAccounts',
          _inpage: true,
          _origin: 'foo.site',
          networkName: CFX_MAINNET_NAME,
        })

        await waitForExpect(() => expect(db.getAuthReq().length).toBe(1))

        await request({
          method: 'wallet_requestPermissions',
          params: {
            permissions: [{cfx_accounts: {}}],
            accounts: [a1.eid, a2.eid],
            authReqId: db.getAuthReq()[0].eid,
          },
          networkName: CFX_MAINNET_NAME,
          _popup: true,
        })

        await res

        expect(db.getApp().length).toBe(1)
        expect(db.getApp()[0].account.length).toBe(2)

        await request({
          method: 'wallet_setAppCurrentAccount',
          params: {accountId: a2.eid, appId: db.getApp()[0].eid},
        })

        expect(db.getApp()[0].currentAccount.eid).toBe(a2.eid)
      })
    })
    describe('wallet_getCurrentViewingApp', function () {
      test.todo('wallet_getCurrentViewingApp')
    })
    describe('wallet_deleteApp', function () {
      test.todo('wallet_deleteApp')
    })
    describe('cfx_gasPrice', function () {
      test('cfx_gasPrice', async () => {
        res = await request({method: 'cfx_gasPrice'})
        expect(typeof res.result === 'string').toBeTruthy()
        expect(res.result.startsWith('0x')).toBeTruthy()
      })
    })
    describe('cfx_epochNumber', function () {
      test('cfx_epochNumber', async () => {
        res = await request({
          method: 'cfx_epochNumber',
          params: [],
        })
        expect(typeof res.result === 'string').toBeTruthy()
        expect(res.result.startsWith('0x')).toBeTruthy()

        res = await request({
          method: 'cfx_epochNumber',
          params: ['latest_state'],
        })
        expect(typeof res.result === 'string').toBeTruthy()
        expect(res.result.startsWith('0x')).toBeTruthy()

        res = await request({
          method: 'cfx_epochNumber',
          params: ['latest_mined'],
        })
        expect(typeof res.result === 'string').toBeTruthy()
        expect(res.result.startsWith('0x')).toBeTruthy()
      })
    })
    describe('eth_blockNumber', function () {
      test('eth_blockNumber', async () => {
        res = await request({
          method: 'eth_blockNumber',
          params: [],
          networkName: ETH_MAINNET_NAME,
        })

        expect(typeof res.result === 'string').toBeTruthy()
        expect(res.result.startsWith('0x')).toBeTruthy()
      })
    })
    describe('eth_gasPrice', function () {
      test('eth_gasPrice', async () => {
        res = await request({
          method: 'eth_gasPrice',
          networkName: ETH_MAINNET_NAME,
        })
        expect(typeof res.result === 'string').toBeTruthy()
        expect(res.result.startsWith('0x')).toBeTruthy()
      })
    })
    describe('wallet_getBalance', function () {
      test('cfx network', async () => {
        await deployCRC20()

        expect(
          (
            await request({
              method: 'wallet_getBalance',
              params: [CFX_ACCOUNTS[0].base32],
              networkName: CFX_MAINNET_NAME,
            })
          ).result,
        ).toBe('0x0')
        let b
        res = await request({
          method: 'wallet_getBalance',
          params: {
            users: [CFX_ACCOUNTS[0].base32, CFX_ACCOUNTS[1].base32],
            tokens: [
              '0x0',
              'net2999:acftjsgv54hz3rpdmt4bvm8m4edc7ss532kxzzjt3w',
              'net2999:acgjx5c8072590gk3namj5mwsernrs8syjgw92xcyt',
            ],
          },
          networkName: CFX_MAINNET_NAME,
        })
        b = res.result
        expect(b[CFX_ACCOUNTS[0].base32]['0x0']).toBe('0x0')
        expect(b[CFX_ACCOUNTS[1].base32]['0x0']).toBe('0x0')
        expect(
          b[CFX_ACCOUNTS[0].base32][
            'net2999:acftjsgv54hz3rpdmt4bvm8m4edc7ss532kxzzjt3w'
          ],
        ).toBe('0x8ac7230489e80000')
        expect(
          b[CFX_ACCOUNTS[1].base32][
            'net2999:acftjsgv54hz3rpdmt4bvm8m4edc7ss532kxzzjt3w'
          ],
        ).toBe('0x8ac7230489e80000')
        expect(
          b[CFX_ACCOUNTS[0].base32][
            'net2999:acgjx5c8072590gk3namj5mwsernrs8syjgw92xcyt'
          ],
        ).toBe('0x56bc75e2d63100000')
        expect(
          b[CFX_ACCOUNTS[1].base32][
            'net2999:acgjx5c8072590gk3namj5mwsernrs8syjgw92xcyt'
          ],
        ).toBe('0x56bc75e2d63100000')

        db.retractAttr({
          eid: db.getNetworkByName(CFX_MAINNET_NAME)[0].eid,
          attr: 'network/balanceChecker',
        })

        res = await request({
          method: 'wallet_getBalance',
          params: {
            users: [CFX_ACCOUNTS[0].base32, CFX_ACCOUNTS[1].base32],
            tokens: [
              '0x0',
              'net2999:acftjsgv54hz3rpdmt4bvm8m4edc7ss532kxzzjt3w',
              'net2999:acgjx5c8072590gk3namj5mwsernrs8syjgw92xcyt',
            ],
          },
        })
        b = res.result
        expect(b[CFX_ACCOUNTS[0].base32]['0x0']).toBe('0x0')
        expect(b[CFX_ACCOUNTS[1].base32]['0x0']).toBe('0x0')
        expect(
          b[CFX_ACCOUNTS[0].base32][
            'net2999:acftjsgv54hz3rpdmt4bvm8m4edc7ss532kxzzjt3w'
          ],
        ).toBe('0x8ac7230489e80000')
        expect(
          b[CFX_ACCOUNTS[1].base32][
            'net2999:acftjsgv54hz3rpdmt4bvm8m4edc7ss532kxzzjt3w'
          ],
        ).toBe('0x8ac7230489e80000')
        expect(
          b[CFX_ACCOUNTS[0].base32][
            'net2999:acgjx5c8072590gk3namj5mwsernrs8syjgw92xcyt'
          ],
        ).toBe('0x56bc75e2d63100000')
        expect(
          b[CFX_ACCOUNTS[1].base32][
            'net2999:acgjx5c8072590gk3namj5mwsernrs8syjgw92xcyt'
          ],
        ).toBe('0x56bc75e2d63100000')
      })

      test('eth network', async () => {
        expect(
          (
            await request({
              method: 'wallet_getBalance',
              params: [ETH_ACCOUNTS[0].address],
              networkName: ETH_MAINNET_NAME,
            })
          ).result,
        ).toBe('0x0')

        await deployERC20()
        let b
        res = await request({
          method: 'wallet_getBalance',
          params: {
            users: [ETH_ACCOUNTS[0].address, ETH_ACCOUNTS[1].address],
            tokens: [
              '0x0',
              '0x4d59d6d6a52014dd71e8929bd5d3e6d0e7a9f341',
              '0x2f154def814f04aa5ae2446681264bf3428956b4',
            ],
          },
          networkName: ETH_MAINNET_NAME,
        })
        b = res.result
        expect(b[ETH_ACCOUNTS[0].address]['0x0']).toBe('0x0')
        expect(b[ETH_ACCOUNTS[1].address]['0x0']).toBe('0x0')
        expect(
          b[ETH_ACCOUNTS[0].address][
            '0x4d59d6d6a52014dd71e8929bd5d3e6d0e7a9f341'
          ],
        ).toBe('0x8ac7230489e80000')
        expect(
          b[ETH_ACCOUNTS[1].address][
            '0x4d59d6d6a52014dd71e8929bd5d3e6d0e7a9f341'
          ],
        ).toBe('0x8ac7230489e80000')
        expect(
          b[ETH_ACCOUNTS[0].address][
            '0x2f154def814f04aa5ae2446681264bf3428956b4'
          ],
        ).toBe('0x56bc75e2d63100000')
        expect(
          b[ETH_ACCOUNTS[1].address][
            '0x2f154def814f04aa5ae2446681264bf3428956b4'
          ],
        ).toBe('0x56bc75e2d63100000')

        db.retractAttr({
          eid: db.getNetworkByName(ETH_MAINNET_NAME)[0].eid,
          attr: 'network/balanceChecker',
        })

        res = await request({
          method: 'wallet_getBalance',
          params: {
            users: [ETH_ACCOUNTS[0].address, ETH_ACCOUNTS[1].address],
            tokens: [
              '0x0',
              '0x4d59d6d6a52014dd71e8929bd5d3e6d0e7a9f341',
              '0x2f154def814f04aa5ae2446681264bf3428956b4',
            ],
          },
          networkName: ETH_MAINNET_NAME,
        })
        b = res.result
        expect(b[ETH_ACCOUNTS[0].address]['0x0']).toBe('0x0')
        expect(b[ETH_ACCOUNTS[1].address]['0x0']).toBe('0x0')
        expect(
          b[ETH_ACCOUNTS[0].address][
            '0x4d59d6d6a52014dd71e8929bd5d3e6d0e7a9f341'
          ],
        ).toBe('0x8ac7230489e80000')
        expect(
          b[ETH_ACCOUNTS[1].address][
            '0x4d59d6d6a52014dd71e8929bd5d3e6d0e7a9f341'
          ],
        ).toBe('0x8ac7230489e80000')
        expect(
          b[ETH_ACCOUNTS[0].address][
            '0x2f154def814f04aa5ae2446681264bf3428956b4'
          ],
        ).toBe('0x56bc75e2d63100000')
        expect(
          b[ETH_ACCOUNTS[1].address][
            '0x2f154def814f04aa5ae2446681264bf3428956b4'
          ],
        ).toBe('0x56bc75e2d63100000')
      })
    })
    describe('wallet_validate20Token', function () {
      test('cfx', async () => {
        await deployCRC20()
        res = await request({
          method: 'wallet_validate20Token',
          params: {
            tokenAddress: 'net2999:acftjsgv54hz3rpdmt4bvm8m4edc7ss532kxzzjt3w',
            userAddress: 'net2999:aarx4arbkwcbuh4r8spdz3ybddwnzzeea6thg8ytmr',
          },
        })
        expect(res.result).toStrictEqual({
          balance: '0x8ac7230489e80000',
          decimals: 18,
          name: 'Test Token 1',
          symbol: 'test1',
          valid: true,
        })
      })
    })
    describe('wallet_switchEthereumChain', function () {
      test('wallet_switchEthereumChain', async () => {
        await request({method: 'wallet_generatePrivateKey'}).then(({result}) =>
          request({
            method: 'wallet_importPrivateKey',
            params: {privateKey: result, password},
          }),
        )

        const [a1] = db.getAccount()

        res = request({
          method: 'cfx_requestAccounts',
          _inpage: true,
          _origin: 'foo.site',
          networkName: CFX_MAINNET_NAME,
        })

        await waitForExpect(() => expect(db.getAuthReq().length).toBe(1))

        await request({
          method: 'wallet_requestPermissions',
          params: {
            permissions: [{cfx_accounts: {}}],
            accounts: [a1.eid],
            authReqId: db.getAuthReq()[0].eid,
          },
          networkName: CFX_MAINNET_NAME,
          _popup: true,
        })

        await res

        expect(db.getNetwork({selected: true})[0].type).toBe('cfx')

        res = request({
          _inpage: true,
          _origin: 'foo.site',
          method: 'wallet_switchEthereumChain',
          params: [{chainId: ETH_LOCALNET_CHAINID}],
        })

        await waitForExpect(() => expect(db.getAuthReq().length).toBe(1))

        await request({
          _popup: true,
          method: 'wallet_switchEthereumChain',
          params: {
            authReqId: db.getAuthReq()[0].eid,
            chainConfig: [{chainId: ETH_LOCALNET_CHAINID}],
          },
        })

        expect((await res).result).toBe('__null__')
        expect(db.getNetwork({selected: true})[0].type).toBe('eth')
      })
    })
    describe('wallet_addEthereumChain', function () {
      test('wallet_addEthereumChain', async () => {
        await request({method: 'wallet_generatePrivateKey'}).then(({result}) =>
          request({
            method: 'wallet_importPrivateKey',
            params: {privateKey: result, password},
          }),
        )

        const [a1] = db.getAccount()

        res = request({
          method: 'cfx_requestAccounts',
          _inpage: true,
          _origin: 'foo.site',
          networkName: CFX_MAINNET_NAME,
        })

        await waitForExpect(() => expect(db.getAuthReq().length).toBe(1), 20000)

        await request({
          method: 'wallet_requestPermissions',
          params: {
            permissions: [{cfx_accounts: {}}],
            accounts: [a1.eid],
            authReqId: db.getAuthReq()[0].eid,
          },
          networkName: CFX_MAINNET_NAME,
          _popup: true,
        })

        await res

        await request({
          method: 'wallet_deleteNetwork',
          params: {password, networkId: db.getNetworkByType('eth')[0].eid},
        })

        expect(db.getNetwork().length).toBe(1)

        res = request({
          _origin: 'foo.site',
          _inpage: true,
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: ETH_LOCALNET_CHAINID,
              chainName: ETH_MAINNET_NAME,
              nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: DEFAULT_CURRENCY_DECIMALS,
              },
              rpcUrls: [ETH_LOCALNET_RPC_ENDPOINT],
            },
          ],
        })

        await waitForExpect(() => expect(db.getAuthReq().length).toBe(1))
        const authReq = db.getAuthReq()[0]
        await request({
          _popup: true,
          method: 'wallet_addEthereumChain',
          params: {
            authReqId: authReq.eid,
            newChainConfig: [
              {
                chainId: ETH_LOCALNET_CHAINID,
                chainName: ETH_MAINNET_NAME,
                nativeCurrency: {
                  name: 'ETH',
                  symbol: 'ETH',
                  decimals: DEFAULT_CURRENCY_DECIMALS,
                },
                rpcUrls: [ETH_LOCALNET_RPC_ENDPOINT],
              },
            ],
          },
        })

        expect((await res).result).toBe('__null__')
        expect(db.getNetwork().length).toBe(2)
        const [, n2] = db.getNetwork()
        expect(n2.name).toBe(ETH_MAINNET_NAME)
        expect(n2.endpoint).toBe(ETH_LOCALNET_RPC_ENDPOINT)
        await request({
          method: 'wallet_deleteNetwork',
          params: {
            password,
            networkId: db.getNetworkByName(ETH_MAINNET_NAME)[0].eid,
          },
        })
        res = request({
          _popup: true,
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: ETH_LOCALNET_CHAINID,
              chainName: ETH_MAINNET_NAME,
              nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: DEFAULT_CURRENCY_DECIMALS,
              },
              rpcUrls: [ETH_LOCALNET_RPC_ENDPOINT],
            },
          ],
        })
        expect((await res).result).toBe('__null__')
      })

      test('error call adding duplicate endpoint network', async () => {
        await request({method: 'wallet_generatePrivateKey'}).then(({result}) =>
          request({
            method: 'wallet_importPrivateKey',
            params: {privateKey: result, password},
          }),
        )

        const [a1] = db.getAccount()
        res = request({
          method: 'cfx_requestAccounts',
          _inpage: true,
          _origin: 'foo.site',
          networkName: CFX_MAINNET_NAME,
        })

        await waitForExpect(() => expect(db.getAuthReq().length).toBe(1))

        await request({
          method: 'wallet_requestPermissions',
          params: {
            permissions: [{cfx_accounts: {}}],
            accounts: [a1.eid],
            authReqId: db.getAuthReq()[0].eid,
          },
          networkName: CFX_MAINNET_NAME,
          _popup: true,
        })

        res = request({
          _origin: 'foo.site',
          _inpage: true,
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: ETH_LOCALNET_CHAINID,
              chainName: ETH_MAINNET_NAME,
              nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: DEFAULT_CURRENCY_DECIMALS,
              },
              rpcUrls: [ETH_LOCALNET_RPC_ENDPOINT],
            },
          ],
        })

        expect((await res).error.message).toMatch(
          /Duplicate network endpoint with network /,
        )
      })

      test('error call : chainId is not the detectedChainId', async () => {
        await request({method: 'wallet_generatePrivateKey'}).then(({result}) =>
          request({
            method: 'wallet_importPrivateKey',
            params: {privateKey: result, password},
          }),
        )

        const [a1] = db.getAccount()
        res = request({
          method: 'cfx_requestAccounts',
          _inpage: true,
          _origin: 'foo.site',
          networkName: CFX_MAINNET_NAME,
        })

        await waitForExpect(() => expect(db.getAuthReq().length).toBe(1))

        await request({
          method: 'wallet_requestPermissions',
          params: {
            permissions: [{cfx_accounts: {}}],
            accounts: [a1.eid],
            authReqId: db.getAuthReq()[0].eid,
          },
          networkName: CFX_MAINNET_NAME,
          _popup: true,
        })

        await request({
          method: 'wallet_deleteNetwork',
          params: {password, networkId: db.getNetworkByType('eth')[0].eid},
        })

        res = request({
          _origin: 'foo.site',
          _inpage: true,
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: '0x538',
              chainName: ETH_MAINNET_NAME,
              nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: DEFAULT_CURRENCY_DECIMALS,
              },
              rpcUrls: [ETH_LOCALNET_RPC_ENDPOINT],
            },
          ],
        })

        expect((await res).error.message).toMatch(/Invalid chainId /)
      })
    })

    describe('wallet_addHdPath', function () {
      test('wallet_addHdPath', async function () {
        res = await request({
          method: 'wallet_addHdPath',
          params: {name: 'btc-1', hdPath: `m/44'/0'/0'/0`},
        })
        expect(typeof (await res).result === 'number').toEqual(true)
      })

      test('error call : wallet_addHdPath', async () => {
        res = request({
          method: 'wallet_addHdPath',
          params: {name: 'cfx-default', hdPath: DEFAULT_CFX_HDPATH},
        })
        expect((await res).error.message).toMatch(/Duplicate hd path name/)
        res = await request({
          method: 'wallet_addHdPath',
          params: {name: 'cfx-default1', hdPath: DEFAULT_CFX_HDPATH},
        })
        expect((await res).error.message).toMatch(/hd path already added/)
      })
    })

    describe('wallet_discoverAccount', function () {
      test('wallet_discoverAccount', async function () {
        await sendCFX({to: CFX_ACCOUNTS[0].address, balance: 1e10 * 21000})
        await sendCFX({to: CFX_ACCOUNTS[1].address, balance: 1e10 * 21000})
        await sendETH({to: ETH_ACCOUNTS[0].address, balance: 1e10 * 21000})
        await sendETH({to: ETH_ACCOUNTS[1].address, balance: 1e10 * 21000})

        expect(db.getVault().length).toBe(0)

        await request({
          method: 'wallet_importMnemonic',
          params: {mnemonic: MNEMONIC, password},
        })
        expect(db.getVault().length).toBe(1)
        expect(db.getVaultByType('hd').length).toBe(1)

        const groups = db.getAccountGroup()
        expect(groups.length).toBe(1)

        await waitForExpect(() => expect(db.getAccount().length).toBe(2))
        await waitForExpect(() => expect(db.getAddress().length).toBe(4))
      })
    })
    describe('cfx_sendTransaction', function () {
      describe('popup', function () {
        test('basic', async () => {
          await request({
            method: 'wallet_importMnemonic',
            params: {mnemonic: MNEMONIC, password},
          })

          await waitForExpect(() =>
            expect(db.getAddress().length).toBeGreaterThan(0),
          )

          await new Promise(resolve => setTimeout(resolve, 500))
          res = await request({
            method: 'cfx_sendTransaction',
            params: [
              {
                from: CFX_ACCOUNTS[0].base32,
                to: CFX_ACCOUNTS[1].base32,
                value: '0x1',
              },
            ],
            _popup: true,
          })
          expect(res.result).toBeDefined()
          expect(res.result.startsWith('0x')).toBe(true)
        })
        test('with data', async () => {
          await request({
            method: 'wallet_importMnemonic',
            params: {mnemonic: MNEMONIC, password},
          })

          await waitForExpect(() =>
            expect(db.getAddress().length).toBeGreaterThan(0),
          )

          await new Promise(resolve => setTimeout(resolve, 500))
          res = await request({
            method: 'cfx_sendTransaction',
            params: [
              {
                from: CFX_ACCOUNTS[0].base32,
                to: CFX_ACCOUNTS[1].base32,
                data: '0x10',
                value: '0x1',
              },
            ],
            _popup: true,
          })
          expect(res.result).toBeDefined()
          expect(res.result.startsWith('0x')).toBe(true)
        })
      })

      test('inpage', async () => {
        await request({
          method: 'wallet_importMnemonic',
          params: {mnemonic: MNEMONIC, password},
        })

        await waitForExpect(() =>
          expect(db.getAddress().length).toBeGreaterThan(0),
        )

        res = request({
          method: 'cfx_requestAccounts',
          _inpage: true,
          _origin: 'foo.site',
          networkName: CFX_MAINNET_NAME,
        })
        await waitForExpect(() => expect(db.getAuthReq().length).toBe(1))
        await request({
          method: 'wallet_requestPermissions',
          params: {
            permissions: [{cfx_accounts: {}}],
            accounts: [db.getAccount()[0].eid],
            authReqId: db.getAuthReq()[0].eid,
          },
          networkName: CFX_MAINNET_NAME,
          _popup: true,
        })

        await res

        res = request({
          _origin: 'foo.site',
          _inpage: true,
          networkName: CFX_MAINNET_NAME,
          method: 'cfx_sendTransaction',
          params: [
            {
              from: CFX_ACCOUNTS[0].base32,
              to: CFX_ACCOUNTS[1].base32,
              value: '0x1',
            },
          ],
        }).catch(console.error)

        await waitForExpect(() => expect(db.getAuthReq().length).toBe(1), 20000)

        await request({
          networkName: CFX_MAINNET_NAME,
          _popup: true,
          method: 'cfx_sendTransaction',
          params: {
            authReqId: db.getAuthReq()[0].eid,
            tx: [
              {
                from: CFX_ACCOUNTS[0].base32,
                to: CFX_ACCOUNTS[1].base32,
                value: '0x1',
              },
            ],
          },
        })
        res = await res
        expect(res.result.startsWith('0x')).toBe(true)
      })
    })
  })
})
