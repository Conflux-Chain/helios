/**
 * @fileOverview init rpc engine options
 * @name rpc-engine-opts.js
 */

import * as cfxAccounts from '@fluent-wallet/cfx_accounts'
import * as cfxChainId from '@fluent-wallet/cfx_chain-id'
import * as cfxEpochNumber from '@fluent-wallet/cfx_epoch-number'
import * as cfxEstimateGasAndCollateral from '@fluent-wallet/cfx_estimate-gas-and-collateral'
import * as cfxGasPrice from '@fluent-wallet/cfx_gas-price'
import * as cfxGetAccount from '@fluent-wallet/cfx_get-account'
import * as cfxGetBalance from '@fluent-wallet/cfx_get-balance'
import * as cfxGetCode from '@fluent-wallet/cfx_get-code'
import * as cfxGetNextNonce from '@fluent-wallet/cfx_get-next-nonce'
import * as cfxGetStatus from '@fluent-wallet/cfx_get-status'
import * as cfxNetVersion from '@fluent-wallet/cfx_net-version'
import * as cfxRequestAccounts from '@fluent-wallet/cfx_request-accounts'
import * as cfxTypedSignV4 from '@fluent-wallet/cfx_sign-typed-data_v4'
import * as ethAccounts from '@fluent-wallet/eth_accounts'
import * as ethBlockNumber from '@fluent-wallet/eth_block-number'
import * as ethChainId from '@fluent-wallet/eth_chain-id'
import * as ethEstimateGas from '@fluent-wallet/eth_estimate-gas'
import * as ethGasPrice from '@fluent-wallet/eth_gas-price'
import * as ethGetBalance from '@fluent-wallet/eth_get-balance'
import * as ethGetCode from '@fluent-wallet/eth_get-code'
import * as ethGetTransactionCount from '@fluent-wallet/eth_get-transaction-count'
import * as ethRequestAccounts from '@fluent-wallet/eth_request-accounts'
import * as ethTypedSignV4 from '@fluent-wallet/eth_sign-typed-data_v4'
import * as walletRefetchTokenList from '@fluent-wallet/wallet_refetch-token-list'
import * as walletUpdateTokenList from '@fluent-wallet/wallet_update-token-list'

import {
  IS_CI,
  IS_DEV_MODE,
  IS_PROD_MODE,
  IS_TEST_MODE,
} from '@fluent-wallet/inner-utils'
import * as netVersion from '@fluent-wallet/net_version'
import * as personalSign from '@fluent-wallet/personal_sign'
import * as walletAddConfluxChain from '@fluent-wallet/wallet_add-conflux-chain'
import * as walletAddEthereumChain from '@fluent-wallet/wallet_add-ethereum-chain'
import * as walletAddHdPath from '@fluent-wallet/wallet_add-hd-path'
import * as walletAddNetwork from '@fluent-wallet/wallet_add-network'
import * as walletAddPendingUserAuthRequest from '@fluent-wallet/wallet_add-pending-user-auth-request'
import * as walletAddVault from '@fluent-wallet/wallet_add-vault'
import * as walletCreateAccount from '@fluent-wallet/wallet_create-account'
import * as walletCreateAddress from '@fluent-wallet/wallet_create-address'
import * as walletDeleteAccountGroup from '@fluent-wallet/wallet_delete-account-group'
import * as walletDeleteApp from '@fluent-wallet/wallet_delete-app'
import * as walletDeleteNetwork from '@fluent-wallet/wallet_delete-network'
import * as walletDetectNetworkType from '@fluent-wallet/wallet_detect-network-type'
import * as walletDiscoverAccounts from '@fluent-wallet/wallet_discover-accounts'
import * as walletExportAccount from '@fluent-wallet/wallet_export-account'
import * as walletExportAccountGroup from '@fluent-wallet/wallet_export-account-group'
import * as walletExportAll from '@fluent-wallet/wallet_export-all'
import * as walletGenerateMnemonic from '@fluent-wallet/wallet_generate-mnemonic'
import * as walletGeneratePrivateKey from '@fluent-wallet/wallet_generate-private-key'
import * as walletGetAccountAddressByNetwork from '@fluent-wallet/wallet_get-account-address-by-network'
import * as walletGetAccountGroup from '@fluent-wallet/wallet_get-account-group'
import * as walletGetAccountGroupVaultValue from '@fluent-wallet/wallet_get-account-group-vault-value'
import * as walletGetAddressPrivateKey from '@fluent-wallet/wallet_get-address-private-key'
import * as walletGetBalance from '@fluent-wallet/wallet_get-balance'
import * as walletRefreshBalance from '@fluent-wallet/wallet_refresh-balance'
import * as walletGetCurrentAccount from '@fluent-wallet/wallet_get-current-account'
import * as walletGetCurrentNetwork from '@fluent-wallet/wallet_get-current-network'
import * as walletGetCurrentViewingApp from '@fluent-wallet/wallet_get-current-viewing-app'
import * as walletGetNetwork from '@fluent-wallet/wallet_get-network'
import * as walletGetNextNonce from '@fluent-wallet/wallet_get-next-nonce'
import * as walletGetPendingAuthRequest from '@fluent-wallet/wallet_get-pending-auth-request'
import * as walletGetPermissions from '@fluent-wallet/wallet_get-permissions'
import * as walletImportAddress from '@fluent-wallet/wallet_import-address'
import * as walletImportAll from '@fluent-wallet/wallet_import-all'
import * as walletImportMnemonic from '@fluent-wallet/wallet_import-mnemonic'
import * as walletImportPrivateKey from '@fluent-wallet/wallet_import-private-key'
import * as walletIsLocked from '@fluent-wallet/wallet_is-locked'
import * as walletLock from '@fluent-wallet/wallet_lock'
import * as walletRegisterSiteMetadata from '@fluent-wallet/wallet_register-site-metadata'
import * as walletRequestPermissions from '@fluent-wallet/wallet_request-permissions'
import * as walletRequestUnlockUI from '@fluent-wallet/wallet_request-unlock-ui'
import * as walletSetAppCurrentAccount from '@fluent-wallet/wallet_set-app-current-account'
import * as walletSetAppCurrentNetwork from '@fluent-wallet/wallet_set-app-current-network'
import * as walletSetCurrentAccount from '@fluent-wallet/wallet_set-current-account'
import * as walletSetCurrentNetwork from '@fluent-wallet/wallet_set-current-network'
import * as walletSwitchConfluxChain from '@fluent-wallet/wallet_switch-conflux-chain'
import * as walletSwitchEthereumChain from '@fluent-wallet/wallet_switch-ethereum-chain'
import * as walletUnlock from '@fluent-wallet/wallet_unlock'
import * as walletUpdateAccount from '@fluent-wallet/wallet_update-account'
import * as walletUpdateAccountGroup from '@fluent-wallet/wallet_update-account-group'
import * as walletUserApprovedAuthRequest from '@fluent-wallet/wallet_user-approved-auth-request'
import * as walletUserRejectedAuthRequest from '@fluent-wallet/wallet_user-rejected-auth-request'
import * as walletValidateAppPermissions from '@fluent-wallet/wallet_validate-app-permissions'
import * as walletValidateMnemonic from '@fluent-wallet/wallet_validate-mnemonic'
import * as walletValidatePassword from '@fluent-wallet/wallet_validate-password'
import * as walletValidatePrivateKey from '@fluent-wallet/wallet_validate-private-key'
import * as walletZeroAccountGroup from '@fluent-wallet/wallet_zero-account-group'
import * as cfxCall from '@fluent-wallet/cfx_call'
import * as ethCall from '@fluent-wallet/eth_call'

export const rpcEngineOpts = {
  isProd: IS_PROD_MODE,
  isDev: IS_DEV_MODE,
  isTest: IS_TEST_MODE,
  isCI: IS_CI,
  methods: [
    walletZeroAccountGroup,
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
    walletGetNetwork,
    walletDeleteNetwork,
    walletDetectNetworkType,
    walletGetAddressPrivateKey,
    walletGetAccountGroupVaultValue,
    walletSetAppCurrentAccount,
    walletSetAppCurrentNetwork,
    walletSetCurrentAccount,
    walletSetCurrentNetwork,
    walletGetCurrentViewingApp,
    walletGetCurrentNetwork,
    walletGetCurrentAccount,

    walletGetNextNonce,
    walletGetBalance,
    walletRefreshBalance,

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
    walletDeleteApp,
    walletGetAccountAddressByNetwork,
    walletRefetchTokenList,
    walletUpdateTokenList,

    // cfx
    cfxEpochNumber,
    cfxGetAccount,
    cfxGetCode,
    cfxGetNextNonce,
    cfxGetBalance,
    cfxCall,
    cfxGetStatus,
    cfxNetVersion,
    cfxChainId,
    cfxAccounts,
    cfxGasPrice,
    cfxEstimateGasAndCollateral,
    walletAddConfluxChain,
    walletSwitchConfluxChain,

    // eth
    ethGetCode,
    ethGetTransactionCount,
    ethGetBalance,
    ethCall,
    ethChainId,
    netVersion,
    ethAccounts,
    ethGasPrice,
    ethEstimateGas,
    ethBlockNumber,
    walletAddEthereumChain,
    walletSwitchEthereumChain,

    // sign
    personalSign,
    ethTypedSignV4,
    cfxTypedSignV4,
  ],
}
