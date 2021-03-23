/**
 * @fileOverview init rpc engine options
 * @name rpc-engine-opts.js
 */

import * as walletInitState from '@cfxjs/wallet_initState'
import * as walletGeneratePrivateKey from '@cfxjs/wallet_generatePrivateKey'
import * as walletGenerateMnemonic from '@cfxjs/wallet_generateMnemonic'

// import * as cfxGetTransactionByHash from '@cfxjs/cfx_getTransactionByHash'
// import * as walletImportMnemonic from '@cfxjs/wallet_importMnemonic'

export const rpcEngineOpts = {
  methods: [
    // init
    walletInitState,
    walletGeneratePrivateKey,
    walletGenerateMnemonic,

    // walletImportMnemonic,
    // cfxGetTransactionByHash,
  ],
}
