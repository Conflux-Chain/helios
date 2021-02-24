import 'regenerator-runtime/runtime'

import browser from 'webextension-polyfill'

import {isProdMode} from 'utils'

import create from 'zustand/vanilla'
import {persist} from 'zustand/middleware'
import partialRight from 'ramda/es/partialRight'
import apply from 'ramda/es/apply'
import pipe from 'ramda/es/pipe'
import identity from 'ramda/es/identity'
import {EXT_STORAGE} from 'consts'

import {RpcEngine} from '@cfxjs/rpc-engine'
import {rpcEngineOpts} from './rpc-engine-opts'

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
const store = createStore(() => {})
if (!isProdMode()) window.s = store

// ## initialize rpc engine
// TODO: can't read snowpack env in utils consts package
const rpcEngine = new RpcEngine(rpcEngineOpts)
;(async () => {
  await rpcEngine.request({method: 'portal_initState'})
})()
