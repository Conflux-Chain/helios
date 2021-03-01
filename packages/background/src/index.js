import 'regenerator-runtime/runtime';

import { RpcEngine } from '@cfxjs/rpc-engine';
import { EXT_STORAGE } from 'consts';
import apply from 'ramda/es/apply';
import identity from 'ramda/es/identity';
import partialRight from 'ramda/es/partialRight';
import pipe from 'ramda/es/pipe';
import { isProdMode } from 'utils';
import browser from 'webextension-polyfill';
import { persist } from 'zustand/middleware';
import create from 'zustand/vanilla';

import { rpcEngineOpts } from './rpc-engine-opts';

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

if (!isProdMode()) window.b = browser

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
if (!isProdMode()) window.s = store

// ## initialize rpc engine
const rpcEngine = new RpcEngine(store, rpcEngineOpts)
;(async () => {
  await rpcEngine.request({method: 'portal_initState'})
})()
