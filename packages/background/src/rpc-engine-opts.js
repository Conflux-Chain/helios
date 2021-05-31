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
import * as walletGetNextNonce from '@cfxjs/wallet_get-next-nonce'
import * as cfxEpochNumber from '@cfxjs/cfx_epoch-number'
import * as cfxGetAccount from '@cfxjs/cfx_get-account'
import * as cfxGetCode from '@cfxjs/cfx_get-code'
import * as ethGetCode from '@cfxjs/eth_get-code'
import * as cfxGetNextNonce from '@cfxjs/cfx_get-next-nonce'
import * as ethGetTransactionCount from '@cfxjs/eth_get-transaction-count'
import * as cfxGetBalance from '@cfxjs/cfx_get-balance'
import * as ethGetBalance from '@cfxjs/eth_get-balance'
import * as walletGetBalance from '@cfxjs/wallet_get-balance'

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

    walletGetNextNonce,
    walletGetBalance,

    // cfx
    cfxEpochNumber,
    cfxGetAccount,
    cfxGetCode,
    cfxGetNextNonce,
    cfxGetBalance,

    // eth
    ethGetCode,
    ethGetTransactionCount,
    ethGetBalance,
  ],
}
