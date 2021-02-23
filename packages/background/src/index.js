import 'regenerator-runtime/runtime'

import browser from 'webextension-polyfill'

import {isProdMode} from './utils'

import create from 'zustand/vanilla'
import {persist} from 'zustand/middleware'

// import {RpcEngine} from '@cfxjs/rpc-engine'
// import {rpcEngineOpts} from './rpc-engine-opts'

import {initNetwork} from './network'

if (!isProdMode()) window.b = browser

const INIT_STATE = {a: 1}

const store = create(
  persist(
    () => ({
      ...INIT_STATE,
    }),
    {
      name: 'ext-storage',
      getStorage: () => browser.stroage.local,
    },
  ),
)

if (!isProdMode()) window.s = store

initNetwork({store})
// const rpcEngine = new RpcEngine(store, rpcEngineOpts)
