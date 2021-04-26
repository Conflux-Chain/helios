import 'regenerator-runtime/runtime'

import {defRpcEngine} from '@cfxjs/rpc-engine'
import {persist} from './persist-db-to-ext-storage'
import {createdb} from '@cfxjs/db'

import {EXT_STORAGE} from 'consts'
import {IS_PROD_MODE} from 'utils'
import browser from 'webextension-polyfill'
import SCHEMA from './db-schema'
import {listen} from '@cfxjs/extension-runtime/background.js'

if (!IS_PROD_MODE) window.b = browser
import {rpcEngineOpts} from './rpc-engine-opts'
// import {BUILT_IN_NETWORKS} from './network/config'

// # initialize
// ## initialize db
;(async () => {
  const data = await browser.storage.local.get(EXT_STORAGE)?.[EXT_STORAGE]

  const dbConnection = createdb(SCHEMA, persist, data || null)
  if (!IS_PROD_MODE) window.d = dbConnection

  // ## initialize rpc engine
  const {request} = defRpcEngine(dbConnection, rpcEngineOpts)

  const {inpageStream, popupStream} = listen()

  popupStream.subscribe({
    next(req) {
      request(req).then(popupStream.post)
    },
  })

  inpageStream.subscribe({
    next(req) {
      request(req).then(inpageStream.post)
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
  }
})()
