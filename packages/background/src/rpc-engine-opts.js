/**
 * @fileOverview init rpc engine options
 * @name rpc-engine-opts.js
 */

import * as walletInitState from '@cfxjs/wallet_initState'
import * as wallet_addNetwork from '@cfxjs/wallet_addNetwork'

// import * as cfxGetTransactionByHash from '@cfxjs/cfx_getTransactionByHash'
// import * as walletImportMnemonic from '@cfxjs/wallet_importMnemonic'

export const rpcEngineOpts = {
  methods: [
    // init
    walletInitState,
    wallet_addNetwork,

    // walletImportMnemonic,
    // cfxGetTransactionByHash,
  ],
}
