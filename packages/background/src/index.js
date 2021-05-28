import 'regenerator-runtime/runtime'

import {defRpcEngine} from '@cfxjs/rpc-engine'
import {persist} from './persist-db-to-ext-storage'
import {createdb} from '@cfxjs/db'

import {EXT_STORAGE} from '@cfxjs/fluent-wallet-consts'
import {IS_PROD_MODE} from '@cfxjs/fluent-wallet-inner-utils'
import browser from 'webextension-polyfill'
import SCHEMA from './db-schema'
import {listen} from '@cfxjs/extension-runtime/background.js'
import initDB from './init-db.js'

if (!IS_PROD_MODE) window.b = browser
import {rpcEngineOpts} from './rpc-engine-opts'

// import {BUILT_IN_NETWORKS} from './network/config'

// # initialize
// ## initialize db
;(async () => {
  const data = await browser.storage.local.get(EXT_STORAGE)?.[EXT_STORAGE]

  const dbConnection = createdb(SCHEMA, persist, data || null)
  if (!IS_PROD_MODE) window.d = dbConnection
  initDB(dbConnection)

  // ## initialize rpc engine
  const {request} = defRpcEngine(dbConnection, rpcEngineOpts)

  const {inpageStream, popupStream} = listen()

  popupStream.subscribe({
    next([req, post]) {
      request(req).then(post)
    },
  })

  inpageStream.subscribe({
    next([req, post]) {
      request(req).then(post)
    },
  })

  {
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
      await request({
        method: 'wallet_lock',
      }),
    )

    console.log(
      await request({
        method: 'wallet_unlock',
        params: {password: '12345678'},
      }),
    )

    console.log(
      await request({
        method: 'wallet_importMnemonic',
        params: {mnemonic: mn, password: '12345678'},
      }),
    )

    console.log(
      await Promise.all([
        request({method: 'cfx_epochNumber', params: ['latest_state']}),
        request({method: 'cfx_epochNumber', params: ['latest_mined']}),
      ]),
    )
    console.log(
      await Promise.all([
        request({method: 'cfx_epochNumber', params: ['latest_state']}),
        request({method: 'cfx_epochNumber', params: ['latest_mined']}),
      ]),
    )
    console.log(
      await request({
        method: 'cfx_getAccount',
        params: ['cfx:aamwwx800rcw63n42kbehesuukjdjcnu4ueu84nhp5'],
      }),
    )
    console.log(
      await request({
        method: 'cfx_getAccount',
        params: ['cfx:aamwwx800rcw63n42kbehesuukjdjcnu4ueu84nhp5'],
      }),
    )
  }
})()
