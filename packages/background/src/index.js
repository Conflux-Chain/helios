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
import * as bb from '@cfxjs/webextension'

if (!IS_PROD_MODE) window.b = browser
if (!IS_PROD_MODE) window.bb = bb
import {rpcEngineOpts} from './rpc-engine-opts'

export const initBG = async ({initDBFn = initDB, skipRestore = false} = {}) => {
  const importAllTx = (await browser.storage.local.get('wallet_importAll'))
    ?.wallet_importAll
  const data =
    skipRestore || Boolean(importAllTx)
      ? null
      : (await browser.storage.local.get(EXT_STORAGE))?.[EXT_STORAGE]

  const dbConnection = createdb(SCHEMA, persist, data || null)
  if (!IS_PROD_MODE) window.d = dbConnection
  if (!data) await initDBFn(dbConnection, {importAllTx})

  // ## initialize rpc engine
  const {request} = defRpcEngine(dbConnection, rpcEngineOpts)
  const protectedRequest = (req = {}) =>
    request({
      id: req.id,
      jsonrpc: req.jsonrpc,
      networkName: req.networkName,
      method: req.method,
      params: req.params,
      _popup: req._popup,
      _inpage: req._inpage,
      _origin: req._origin,
      _post: req._post,
    })

  const {inpageStream, popupStream} = listen()

  popupStream.subscribe({
    next([req, post]) {
      protectedRequest({
        ...(req || {}),
        _popup: true,
        _inpage: false,
        _origin: undefined,
        _post: post,
      }).then(post)
    },
  })

  inpageStream.subscribe({
    next([req, post]) {
      protectedRequest({
        ...(req || {}),
        _popup: false,
        _inpage: true,
        _post: post,
      }).then(post)
    },
  })

  if (!IS_PROD_MODE) window.r = protectedRequest
  return {db: dbConnection, request: protectedRequest}
}

// # initialize
// ## initialize db
;(async () => {
  const {request} = await initBG()
  if (IS_DEV_MODE) {
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
          mnemonic:
            'error mom brown point sun magnet armor fish urge business until plastic',
          password: '12345678',
        },
      }),
    )

    await request({
      method: 'wallet_importAddress',
      params: {
        address: 'cfx:aamysddjren1zfp36agsek5fxt2w0st8feps3297ek',
        password: '12345678',
      },
    })
  }
})()
