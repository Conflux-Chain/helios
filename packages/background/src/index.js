import 'regenerator-runtime/runtime'

import {defRpcEngine} from '@cfxjs/rpc-engine'
import {EXT_STORAGE} from 'consts'
import apply from 'ramda/es/apply'
import partialRight from 'ramda/es/partialRight'
import pipe from 'ramda/es/pipe'
import {IS_PROD_MODE} from 'utils'
import browser from 'webextension-polyfill'
import {persist} from 'zustand/middleware'
import create from 'zustand/vanilla'

import {rpcEngineOpts} from './rpc-engine-opts'
// import {BUILT_IN_NETWORKS} from './network/config'

let MemStore = null
// # initialize
// ## initialize store middle
const persistToExtensionStorage = partialRight(persist, [
  {
    name: EXT_STORAGE,
    serialize: store => (
      (MemStore = store.state.MemStore), {...store.state, MemStore: null}
    ),
    deserialize: store => ({...store[EXT_STORAGE], MemStore}),
    getStorage: () => ({
      getItem: browser.storage.local.get,
      setItem(k, v) {
        // k is EXT_STORAGE, v is the store with MemStore=null
        return browser.storage.local.set({[k]: v})
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
          params: {
            oldState: s,
            initState: {a: 1, MemStore: {password: 'jjjj'}},
          },
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
    await request({
      method: 'wallet_generateMnemonic',
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
      method: 'wallet_lock',
    }),
  )
})()
