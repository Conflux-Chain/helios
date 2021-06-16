import 'regenerator-runtime/runtime'

import {defRpcEngine} from '@cfxjs/rpc-engine'
import {persist} from './persist-db-to-ext-storage'
import {createdb} from '@cfxjs/db'

import {EXT_STORAGE} from '@cfxjs/fluent-wallet-consts'
import {IS_PROD_MODE, IS_DEV_MODE} from '@cfxjs/fluent-wallet-inner-utils'
import browser from 'webextension-polyfill'
import SCHEMA from './db-schema'
import {listen} from '@cfxjs/extension-runtime/background.js'
import initDB from './init-db.js'

if (!IS_PROD_MODE) window.b = browser
import {rpcEngineOpts} from './rpc-engine-opts'

export const initBG = async ({initDBFn = initDB, skipRestore = false} = {}) => {
  const data = skipRestore
    ? null
    : (await browser.storage.local.get(EXT_STORAGE))?.[EXT_STORAGE]

  const dbConnection = createdb(SCHEMA, persist, data || null)
  if (!IS_PROD_MODE) window.d = dbConnection
  if (!data) initDBFn(dbConnection)

  // ## initialize rpc engine
  const {request} = defRpcEngine(dbConnection, rpcEngineOpts)
  const protectedRequest = (req = {}) =>
    request({
      networkName: req.networkName,
      method: req.method,
      params: req.params,
      _popup: req._popup,
      _inpage: req._inpage,
      _origin: req._origin,
    })

  const {inpageStream, popupStream} = listen()

  popupStream.subscribe({
    next([req, post]) {
      protectedRequest({
        ...(req || {}),
        _popup: true,
        _inpage: false,
        _origin: undefined,
      }).then(post)
    },
  })

  inpageStream.subscribe({
    next([req, post]) {
      protectedRequest({...(req || {}), _popup: false, _inpage: true}).then(
        post,
      )
    },
  })

  return {db: dbConnection, request: protectedRequest}
}

// # initialize
// ## initialize db
;(async () => {
  const {request} = await initBG()
  if (IS_DEV_MODE) {
    const {result: pk} = await request({
      method: 'wallet_generatePrivateKey',
      params: {entropy: 'abc'},
    })
    const {result: mn} = await request({
      method: 'wallet_generateMnemonic',
    })
    console.log(pk, mn)
    console.log(
      await Promise.all([
        request({
          method: 'wallet_generateMnemonic',
        }),
        request({
          method: 'wallet_generatePrivateKey',
          params: {entropy: 'abc'},
        }),
      ]),
    )

    console.log(
      'wallet_unlock',
      await request({
        method: 'wallet_unlock',
        params: {password: '12345678'},
      }),
    )

    console.log(
      'wallet_importMnemonic',
      await request({
        method: 'wallet_importMnemonic',
        params: {
          mnemonic: mn,
          password: '12345678',
        },
      }),
    )
    // console.log(
    //   'wallet_importMnemonic',
    //   await request({
    //     method: 'wallet_importMnemonic',
    //     params: {
    //       mnemonic:
    //         'error mom brown point sun magnet armor fish urge business until plastic',
    //       password: '12345678',
    //     },
    //   }),
    // )
    // console.log(
    //   'wallet_importPrivateKey',
    //   await request({
    //     method: 'wallet_importPrivateKey',
    //     params: {
    //       privateKey:
    //         '0xe11910396cc6d896160315bb18d219e182fcb415ad80dccda4fad65a3190218c',
    //       password: '12345678',
    //     },
    //   }),
    // )

    console.log(
      'wallet_importAddress',
      await request({
        method: 'wallet_importAddress',
        params: {
          address: 'cfx:aajj1b1gm7k51mhzm80czcx31kwxrm2f6jxvy30mvk',
          password: '12345678',
        },
      }),
    )

    console.log(
      'latest_state',
      'latest_mined',
      await Promise.all([
        request({method: 'cfx_epochNumber', params: ['latest_state']}),
        request({method: 'cfx_epochNumber', params: ['latest_mined']}),
      ]),
    )
    console.log(
      'latest_state',
      'latest_mined',
      await Promise.all([
        request({method: 'cfx_epochNumber', params: ['latest_state']}),
        request({method: 'cfx_epochNumber', params: ['latest_mined']}),
      ]),
    )
    console.log(
      'cfx_getAccount',
      await request({
        method: 'cfx_getAccount',
        params: ['cfx:aamwwx800rcw63n42kbehesuukjdjcnu4ueu84nhp5'],
      }),
    )
    console.log(
      'cfx_getAccount',
      await request({
        method: 'cfx_getAccount',
        params: ['cfx:aamwwx800rcw63n42kbehesuukjdjcnu4ueu84nhp5'],
      }),
    )

    console.log(
      'wallet_getAccountGroup',
      await request({method: 'wallet_getAccountGroup'}),
    )

    // await request({
    //   method: 'wallet_updateAccount',
    //   params: {
    //     accountId: 14,
    //     nickname: 'foo',
    //   }
    // })

    // console.log(dbConnection.getAccount().map(({eid}) => eid))
    // console.log(dbConnection.getAddress().map(({eid}) => eid))
  }
})()
