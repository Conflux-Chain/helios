import 'regenerator-runtime/runtime'

import {defRpcEngine} from '@cfxjs/rpc-engine'
import {EXT_STORAGE} from 'consts'
import apply from 'ramda/es/apply'
import identity from 'ramda/es/identity'
import partialRight from 'ramda/es/partialRight'
import pipe from 'ramda/es/pipe'
import {IS_PROD_MODE} from 'utils'
import browser from 'webextension-polyfill'
import {persist} from 'zustand/middleware'
import create from 'zustand/vanilla'

import {rpcEngineOpts} from './rpc-engine-opts'
import {BUILT_IN_NETWORKS} from './network/config'

// # initialize
// ## initialize store middle
const persistToExtensionStorage = partialRight(persist, [
  {
    name: EXT_STORAGE,
    serialize: identity,
    deserialize: identity,
    getStorage: () => ({
      getItem: browser.storage.local.get,
      setItem(k, v) {
        return browser.storage.local.set({[k]: v.state})
      },
    }),
  },
])

const middlewares = [persistToExtensionStorage]

if (!IS_PROD_MODE) window.b = browser

const createStore = apply(pipe, [...middlewares, create])

// ## initialize store
/**
 * WalletStore, a store compatible with zustand store
 * @see (@link https://github.com/pmndrs/zustand#using-zustand-without-react)
 * @typedef {Object} WalletStore
 * @property {function} getState - a function that returns the state tree of the store
 * @property {function} setState - a function that sets the state of the store
 * @property {function} subscribe - a function that can subscribe to state change
 * @property {function} destroy - a function that can destroy the store
 */
const store = createStore(() => {})
if (!IS_PROD_MODE) window.s = store

// ## initialize rpc engine
const {request} = defRpcEngine(store, rpcEngineOpts)

// test
;(async () => {
  console.log(
    await browser.storage.local
      .get()
      .then(s => s[EXT_STORAGE])
      .then(s =>
        request({
          method: 'wallet_initState',
          params: {oldState: s, initState: {a: 1}},
        }),
      ),
  )
  console.log(
    await request({
      method: 'wallet_generatePrivateKey',
      params: {entropy: 'abc'},
    }),
  )
  console.log(
    await request({method: 'wallet_addNetwork', params: BUILT_IN_NETWORKS}),
  )
  console.log(
    await request({
      method: 'wallet_generateMnemonic',
    }),
  )
})()
