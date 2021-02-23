/**
 * @fileOverview init rpc engine options
 * @name rpc-engine-opts.js
 */

import * as cfxGetTransactionByHash from '@cfxjs/cfx_getTransactionByHash'
import * as walletImportMnemonic from '@cfxjs/wallet_importMnemonic'

export const rpcEngineOpts = [cfxGetTransactionByHash, walletImportMnemonic]
