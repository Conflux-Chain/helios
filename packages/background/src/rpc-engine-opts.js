/**
 * @fileOverview init rpc engine options
 * @name rpc-engine-opts.js
 */

import {IS_PROD_MODE} from '@cfxjs/fluent-wallet-inner-utils'
import * as walletGeneratePrivateKey from '@cfxjs/wallet_generate-private-key'
import * as walletGenerateMnemonic from '@cfxjs/wallet_generate-mnemonic'
import * as walletUnlock from '@cfxjs/wallet_unlock'
import * as walletLock from '@cfxjs/wallet_lock'
import * as walletImportMnemonic from '@cfxjs/wallet_import-mnemonic'
import * as walletImportPrivateKey from '@cfxjs/wallet_import-private-key'
import * as walletValidatePassword from '@cfxjs/wallet_validate-password'
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
import * as walletDiscoverAccounts from '@cfxjs/wallet_discover-accounts'
import * as walletCreateAccount from '@cfxjs/wallet_create-account'
import * as walletUpdateAccount from '@cfxjs/wallet_update-account'
import * as walletUpdateAccountGroup from '@cfxjs/wallet_update-account-group'
import * as walletIsLocked from '@cfxjs/wallet_is-locked'
import * as walletGetAccountGroup from '@cfxjs/wallet_get-account-group'
import * as walletValidateMnemonic from '@cfxjs/wallet_validate-mnemonic'
import * as walletValidatePrivateKey from '@cfxjs/wallet_validate-private-key'
import * as walletExportAccount from '@cfxjs/wallet_export-account'
import * as walletExportAccountGroup from '@cfxjs/wallet_export-account-group'
import * as walletDeleteAccountGroup from '@cfxjs/wallet_delete-account-group'

export const rpcEngineOpts = {
  isProd: IS_PROD_MODE,
  methods: [
    walletIsLocked,

    // init
    walletGeneratePrivateKey,
    walletGenerateMnemonic,

    walletAddVault,
    walletValidatePassword,
    walletLock,
    walletUnlock,

    walletValidatePrivateKey,
    walletValidateMnemonic,
    walletImportMnemonic,
    walletImportPrivateKey,
    walletImportAddress,
    walletDiscoverAccounts,
    walletCreateAccount,
    walletUpdateAccount,
    walletUpdateAccountGroup,
    walletGetAccountGroup,
    walletExportAccount,
    walletExportAccountGroup,
    walletDeleteAccountGroup,

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
