import 'regenerator-runtime/runtime'

import {defRpcEngine} from '@fluent-wallet/rpc-engine'
import {persist} from './persist-db-to-ext-storage'
import {createdb} from '@fluent-wallet/db'
import {EXT_STORAGE} from '@fluent-wallet/consts'
import {
  IS_PROD_MODE,
  IS_DEV_MODE,
  IS_TEST_MODE,
} from '@fluent-wallet/inner-utils'
import {
  Sentry,
  init as initSentry,
  capture as sentryCapture,
} from '@fluent-wallet/sentry'
import {getDefaultOptions} from '@fluent-wallet/sentry/computeDefaultOptions'

import browser from 'webextension-polyfill'
import SCHEMA from './db-schema'
import {listen} from '@fluent-wallet/extension-runtime/background.js'
import initDB from './init-db.js'
import * as bb from '@fluent-wallet/webextension'
import {updateUserId} from '@fluent-wallet/sentry'

if (!IS_PROD_MODE) window.b = browser
if (!IS_PROD_MODE) window.bb = bb

bb.commands.onCommand.addListener(commandName => {
  if (commandName === 'inner_debug_only')
    window.open(`${location.origin}/popup.html`)
})

import {rpcEngineOpts} from './rpc-engine-opts'

initSentry(getDefaultOptions())
Sentry.setTag('custom_location', 'background')

export const initBG = async ({initDBFn = initDB, skipRestore = false} = {}) => {
  const importAllTx = (await browser.storage.local.get('wallet_importAll'))
    ?.wallet_importAll
  const data =
    skipRestore || Boolean(importAllTx)
      ? null
      : (await browser.storage.local.get(EXT_STORAGE))?.[EXT_STORAGE]

  const dbConnection = createdb(SCHEMA, persist, data || null)
  if (!IS_PROD_MODE) window.d = dbConnection
  else window.__FLUENT_DB_CONN = dbConnection
  if (!data) await initDBFn(dbConnection, {importAllTx})

  rpcEngineOpts.sentryCapture = sentryCapture

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
      _rpcStack: req._rpcStack,
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
      //.then(res => (console.log(req, res), post(res)))
    },
  })

  inpageStream.subscribe({
    next([req, post]) {
      protectedRequest({
        ...(req || {}),
        _popup: false,
        _inpage: true,
        _post: post,
        _rpcStack: undefined,
      }).then(post)
      // .then(res => (console.log(req, res), post(res)))
    },
  })

  if (!IS_PROD_MODE) window.r = protectedRequest
  else window.__FLUENT_REQUEST = protectedRequest
  return {db: dbConnection, request: protectedRequest}
}

// # initialize
// ## initialize db
;(async () => {
  // ## initialize db
  const {request, db} = await initBG()
  updateUserId(db.getAddress()?.[0]?.hex)
  request({method: 'wallet_handleUnfinishedTxs', _rpcStack: ['frombg']})
  request({method: 'wallet_enrichTxs', _rpcStack: ['frombg']})
  setInterval(
    () => request({method: 'wallet_cleanupTx', _rpcStack: ['frombg']}),
    1000 * 60 * 60,
  )

  // ## Dev/Test
  if (!IS_TEST_MODE) {
    if (IS_DEV_MODE) {
      if (import.meta.env?.SNOWPACK_PUBLIC_DEV_INIT_SCRIPT_PATH) {
        try {
          const localDevModule = await import(
            import.meta.env?.SNOWPACK_PUBLIC_DEV_INIT_SCRIPT_PATH
          )
          await localDevModule.run({request, db})
        } catch (err) {
          console.log('local dev error', err)
        }
      }
      // if (db.getAccountGroup()?.length) {
      //   // console.log(
      //   //   'wallet_unlock',
      //   //   await request({
      //   //     method: 'wallet_unlock',
      //   //     params: {password: '1111aaaa'},
      //   //   }),
      //   // )
      // }
      // console.log(
      //   'wallet_importMnemonic',
      //   await request({
      //     method: 'wallet_importMnemonic',
      //     params: {
      //       mnemonic:
      //         'error mom brown point sun magnet armor fish urge business until plastic',
      //       password: '1111aaaa',
      //     },
      //   }),
      // )
      // await request({
      //   method: 'wallet_importAddress',
      //   params: {
      //     address: 'cfx:aamysddjren1zfp36agsek5fxt2w0st8feps3297ek',
      //     password: '1111aaaa',
      //   },
      // })
    }
  }
})()
