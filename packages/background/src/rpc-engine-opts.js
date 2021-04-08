/**
 * @fileOverview init rpc engine options
 * @name rpc-engine-opts.js
 */

import * as walletGeneratePrivateKey from '@cfxjs/wallet_generatePrivateKey'
import * as walletGenerateMnemonic from '@cfxjs/wallet_generateMnemonic'
import * as walletUnlock from '@cfxjs/wallet_unlock'
import * as walletLock from '@cfxjs/wallet_lock'
import * as walletImportMnemonic from '@cfxjs/wallet_importMnemonic'
import * as walletImportPrivateKey from '@cfxjs/wallet_importPrivateKey'
import * as walletValidatePassword from '@cfxjs/wallet_validatePassword'
import * as walletGetVaults from '@cfxjs/wallet_getVaults'
import * as walletAddVault from '@cfxjs/wallet_addVault'

export const rpcEngineOpts = {
  methods: [
    // init
    walletGeneratePrivateKey,
    walletGenerateMnemonic,

    walletAddVault,
    walletGetVaults,
    walletValidatePassword,
    walletLock,
    walletUnlock,
    walletImportMnemonic,
    walletImportPrivateKey,

    // cfxGetTransactionByHash,
  ],
}
