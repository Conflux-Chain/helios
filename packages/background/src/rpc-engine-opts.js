/**
 * @fileOverview init rpc engine options
 * @name rpc-engine-opts.js
 */

import * as cfxAccounts from '@cfxjs/cfx_accounts'
import * as cfxChainId from '@cfxjs/cfx_chain-id'
import * as cfxEpochNumber from '@cfxjs/cfx_epoch-number'
import * as cfxGasPrice from '@cfxjs/cfx_gas-price'
import * as cfxGetAccount from '@cfxjs/cfx_get-account'
import * as cfxGetBalance from '@cfxjs/cfx_get-balance'
import * as cfxGetCode from '@cfxjs/cfx_get-code'
import * as cfxGetNextNonce from '@cfxjs/cfx_get-next-nonce'
import * as cfxGetStatus from '@cfxjs/cfx_get-status'
import * as cfxNetVersion from '@cfxjs/cfx_net-version'
import * as cfxRequestAccounts from '@cfxjs/cfx_request-accounts'
import * as cfxTypedSignV4 from '@cfxjs/cfx_sign-typed-data_v4'
import * as ethAccounts from '@cfxjs/eth_accounts'
import * as ethBlockNumber from '@cfxjs/eth_block-number'
import * as ethChainId from '@cfxjs/eth_chain-id'
import * as ethGasPrice from '@cfxjs/eth_gas-price'
import * as ethGetBalance from '@cfxjs/eth_get-balance'
import * as ethGetCode from '@cfxjs/eth_get-code'
import * as ethGetTransactionCount from '@cfxjs/eth_get-transaction-count'
import * as ethRequestAccounts from '@cfxjs/eth_request-accounts'
import * as ethTypedSignV4 from '@cfxjs/eth_sign-typed-data_v4'
import {
  IS_DEV_MODE,
  IS_TEST_MODE,
  IS_PROD_MODE,
  IS_CI,
} from '@cfxjs/fluent-wallet-inner-utils'
import * as netVersion from '@cfxjs/net_version'
import * as personalSign from '@cfxjs/personal_sign'
import * as walletAddHdPath from '@cfxjs/wallet_add-hd-path'
import * as walletAddNetwork from '@cfxjs/wallet_add-network'
import * as walletAddPendingUserAuthRequest from '@cfxjs/wallet_add-pending-user-auth-request'
import * as walletAddVault from '@cfxjs/wallet_add-vault'
import * as walletCreateAccount from '@cfxjs/wallet_create-account'
import * as walletCreateAddress from '@cfxjs/wallet_create-address'
import * as walletDeleteAccountGroup from '@cfxjs/wallet_delete-account-group'
import * as walletDeleteNetwork from '@cfxjs/wallet_delete-network'
import * as walletDetectNetworkType from '@cfxjs/wallet_detect-network-type'
import * as walletDiscoverAccounts from '@cfxjs/wallet_discover-accounts'
import * as walletExportAccount from '@cfxjs/wallet_export-account'
import * as walletExportAccountGroup from '@cfxjs/wallet_export-account-group'
import * as walletExportAll from '@cfxjs/wallet_export-all'
import * as walletGenerateMnemonic from '@cfxjs/wallet_generate-mnemonic'
import * as walletGeneratePrivateKey from '@cfxjs/wallet_generate-private-key'
import * as walletGetAccountGroup from '@cfxjs/wallet_get-account-group'
import * as walletGetAccountGroupVaultValue from '@cfxjs/wallet_get-account-group-vault-value'
import * as walletGetAddressPrivateKey from '@cfxjs/wallet_get-address-private-key'
import * as walletGetBalance from '@cfxjs/wallet_get-balance'
import * as walletGetNextNonce from '@cfxjs/wallet_get-next-nonce'
import * as walletGetPendingAuthRequest from '@cfxjs/wallet_get-pending-auth-request'
import * as walletGetPermissions from '@cfxjs/wallet_get-permissions'
import * as walletImportAddress from '@cfxjs/wallet_import-address'
import * as walletImportAll from '@cfxjs/wallet_import-all'
import * as walletImportMnemonic from '@cfxjs/wallet_import-mnemonic'
import * as walletImportPrivateKey from '@cfxjs/wallet_import-private-key'
import * as walletIsLocked from '@cfxjs/wallet_is-locked'
import * as walletLock from '@cfxjs/wallet_lock'
import * as walletRegisterSiteMetadata from '@cfxjs/wallet_register-site-metadata'
import * as walletRequestPermissions from '@cfxjs/wallet_request-permissions'
import * as walletRequestUnlockUI from '@cfxjs/wallet_request-unlock-ui'
import * as walletSetAppCurrentAccount from '@cfxjs/wallet_set-app-current-account'
import * as walletSetAppCurrentNetwork from '@cfxjs/wallet_set-app-current-network'
import * as walletSetCurrentAccount from '@cfxjs/wallet_set-current-account'
import * as walletSetCurrentNetwork from '@cfxjs/wallet_set-current-network'
import * as walletUnlock from '@cfxjs/wallet_unlock'
import * as walletUpdateAccount from '@cfxjs/wallet_update-account'
import * as walletUpdateAccountGroup from '@cfxjs/wallet_update-account-group'
import * as walletUserApprovedAuthRequest from '@cfxjs/wallet_user-approved-auth-request'
import * as walletUserRejectedAuthRequest from '@cfxjs/wallet_user-rejected-auth-request'
import * as walletValidateAppPermissions from '@cfxjs/wallet_validate-app-permissions'
import * as walletValidateMnemonic from '@cfxjs/wallet_validate-mnemonic'
import * as walletValidatePassword from '@cfxjs/wallet_validate-password'
import * as walletValidatePrivateKey from '@cfxjs/wallet_validate-private-key'
import * as walletAddEthereumChain from '@cfxjs/wallet_add-ethereum-chain'
import * as walletAddConfluxChain from '@cfxjs/wallet_add-conflux-chain'
import * as walletSwitchEthereumChain from '@cfxjs/wallet_switch-ethereum-chain'
import * as walletSwitchConfluxChain from '@cfxjs/wallet_switch-conflux-chain'

export const rpcEngineOpts = {
  isProd: IS_PROD_MODE,
  isDev: IS_DEV_MODE,
  isTest: IS_TEST_MODE,
  isCI: IS_CI,
  methods: [
    walletIsLocked,
    walletRequestUnlockUI,

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
    walletCreateAddress,
    walletCreateAccount,
    walletUpdateAccount,
    walletUpdateAccountGroup,
    walletGetAccountGroup,
    walletExportAccount,
    walletExportAccountGroup,
    walletExportAll,
    walletImportAll,
    walletDeleteAccountGroup,
    walletAddHdPath,
    walletAddNetwork,
    walletDeleteNetwork,
    walletDetectNetworkType,
    walletGetAddressPrivateKey,
    walletGetAccountGroupVaultValue,
    walletSetAppCurrentAccount,
    walletSetAppCurrentNetwork,
    walletSetCurrentAccount,
    walletSetCurrentNetwork,

    walletGetNextNonce,
    walletGetBalance,

    cfxRequestAccounts,
    ethRequestAccounts,
    walletRequestPermissions,
    walletRegisterSiteMetadata,
    walletAddPendingUserAuthRequest,
    walletUserApprovedAuthRequest,
    walletUserRejectedAuthRequest,
    walletGetPendingAuthRequest,
    walletValidateAppPermissions,
    walletGetPermissions,

    // cfx
    cfxEpochNumber,
    cfxGetAccount,
    cfxGetCode,
    cfxGetNextNonce,
    cfxGetBalance,
    cfxGetStatus,
    cfxNetVersion,
    cfxChainId,
    cfxAccounts,
    cfxGasPrice,
    walletAddConfluxChain,
    walletSwitchConfluxChain,

    // eth
    ethGetCode,
    ethGetTransactionCount,
    ethGetBalance,
    ethChainId,
    netVersion,
    ethAccounts,
    ethGasPrice,
    ethBlockNumber,
    walletAddEthereumChain,
    walletSwitchEthereumChain,

    // sign
    personalSign,
    ethTypedSignV4,
    cfxTypedSignV4,
  ],
}
