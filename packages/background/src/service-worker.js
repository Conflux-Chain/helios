// // # imports
import {IS_PROD_MODE, IS_TEST_MODE} from '@fluent-wallet/inner-utils'
import {EXT_STORAGE} from '@fluent-wallet/consts'
import {isManifestV3} from './env.js'
import {defRpcEngine} from '@fluent-wallet/rpc-engine'
import {persist as persistToExtStorageHandler} from './persist-db-to-ext-storage.js'

import browser from 'webextension-polyfill'
import SCHEMA from './db-schema.js'
import {listen} from '@fluent-wallet/extension-runtime/background.js'
import fillInitialDBData from './init-db.js'
import * as bb from '@fluent-wallet/webextension'

import {rpcEngineOpts} from './rpc-engine-opts.js'

// # setup
// ## dev helper
// if (!IS_PROD_MODE) window.b = browser
// if (!IS_PROD_MODE) window.bb = bb
// // ## ext shortcuts
// // shortcut for popup page in big screen
bb.commands.onCommand.addListener(commandName => {
  if (commandName === 'inner_debug_only')
    if (IS_PROD_MODE) window.open(`${location.origin}/popup/index.html`)
    else window.open(`${location.origin}/popup.html`)
})

// ## init db
async function initDB(initDBFn, skipRestore) {
  const {createdb} = await import('@fluent-wallet/db')

  // check if there's importAll request
  // importAll is used to override wallet config with config from other wallet
  // check wallet_importAll for detail
  const importAllTx = (await browser.storage.local.get('wallet_importAll'))
    ?.wallet_importAll

  const data =
    skipRestore || Boolean(importAllTx)
      ? null
      : (await browser.storage.local.get(EXT_STORAGE))?.[EXT_STORAGE]

  // create db
  const dbConnection = createdb(SCHEMA, persistToExtStorageHandler, data)

  //   if (!IS_PROD_MODE) window.d = dbConnection
  //   else window.__FLUENT_DB_CONN = dbConnection

  if (!data) await initDBFn(dbConnection, {importAllTx})

  // cleanup imported importAll data
  if (importAllTx) browser.storage.local.remove('wallet_importAll')

  return dbConnection
}

// ## init rpc engine
async function initRPCEngine(dbConnection) {
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

  //   if (!IS_PROD_MODE) window.r = protectedRequest
  //   else window.__FLUENT_REQUEST = protectedRequest

  return protectedRequest
}

// ## initBG
export const initBG = async ({
  initDBFn = fillInitialDBData,
  skipRestore = false,
} = {}) => {
  const dbConnection = await initDB(initDBFn, skipRestore)
  const protectedRequest = await initRPCEngine(dbConnection)

  return {db: dbConnection, request: protectedRequest}
}

function saveTimestamp() {
  const timestamp = new Date().toISOString()
  browser.storage.session.set({timestamp})
}

// # initialize

async function initApp() {
  const {request} = await initBG()

  // ## start long running jobs
  if (!IS_TEST_MODE) {
    // start handle unfinished txs
    request({method: 'wallet_handleUnfinishedTxs', _rpcStack: ['frombg']})
    // start enrich tx
    request({method: 'wallet_enrichTxs', _rpcStack: ['frombg']})
    // start cleanup tx
    setInterval(
      () => request({method: 'wallet_cleanupTx', _rpcStack: ['frombg']}),
      1000 * 60 * 60,
    )
    // set panel behavior
    request({method: 'wallet_setSidePanelBehavior', _rpcStack: ['frombg']})
  }

  if (isManifestV3) {
    const SAVE_TIMESTAMP_INTERVAL_MS = 2 * 1000
    saveTimestamp()
    setInterval(saveTimestamp, SAVE_TIMESTAMP_INTERVAL_MS)
  }
}

initApp()

let count = 0
const registerInPageContentScript = async () => {
  count++
  try {
    await chrome.scripting.registerContentScripts([
      {
        id: 'inpage',
        matches: ['file://*/*', 'http://*/*', 'https://*/*'],
        js: ['inpage.js'],
        runAt: 'document_start',
        world: 'MAIN',
        allFrames: true,
      },
    ])
  } catch (err) {
    console.error('registerInPageContentScript failed:', err)
    if (count < 3) {
      // retry
      registerInPageContentScript()
    }
  }
}

registerInPageContentScript()
