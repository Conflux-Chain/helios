/**
 * @fileOverview init rpc engine options
 * @name rpc-engine-opts.js
 */

import * as portalInitState from 'portal_initState'
import * as portalInitNetwork from 'portal_initNetwork'

import * as cfxGetTransactionByHash from '@cfxjs/cfx_getTransactionByHash'
import * as walletImportMnemonic from '@cfxjs/wallet_importMnemonic'

export const rpcEngineOpts = {
  methods: [
    // init
    portalInitState,
    portalInitNetwork,

    walletImportMnemonic,
    cfxGetTransactionByHash,
  ],
}
