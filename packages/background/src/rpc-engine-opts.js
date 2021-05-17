/**
 * @fileOverview init rpc engine options
 * @name rpc-engine-opts.js
 */

import {IS_DEV_MODE} from '@cfxjs/fluent-wallet-inner-utils'
import * as walletGeneratePrivateKey from '@cfxjs/wallet_generate-private-key'
import * as walletGenerateMnemonic from '@cfxjs/wallet_generate-mnemonic'
import * as walletUnlock from '@cfxjs/wallet_unlock'
import * as walletLock from '@cfxjs/wallet_lock'
import * as walletImportMnemonic from '@cfxjs/wallet_import-mnemonic'
import * as walletImportPrivateKey from '@cfxjs/wallet_import-private-key'
import * as walletValidatePassword from '@cfxjs/wallet_validate-password'
import * as walletGetVaults from '@cfxjs/wallet_get-vaults'
import * as walletAddVault from '@cfxjs/wallet_add-vault'
import * as walletImportAddress from '@cfxjs/wallet_import-address'
import * as cfxEpochNumber from '@cfxjs/cfx_epoch-number'

export const rpcEngineOpts = {
  isDev: IS_DEV_MODE,
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
    walletImportAddress,

    // cfxGetTransactionByHash,
    cfxEpochNumber,
  ],
}
