/**
 * @fileOverview init rpc engine options
 * @name rpc-engine-opts.js
 */

import * as walletSendTransactionWithAction from '@fluent-wallet/wallet_send-transaction-with-action'
import * as walletGetBlockOrEpochNumber from '@fluent-wallet/wallet_get-block-or-epoch-number'
import * as walletRefetchTxList from '@fluent-wallet/wallet_refetch-tx-list'
import * as walletDeleteMemo from '@fluent-wallet/wallet_delete-memo'
import * as walletUpsertMemo from '@fluent-wallet/wallet_upsert-memo'
import * as walletDeleteAccount from '@fluent-wallet/wallet_delete-account'
import * as walletGetBlockTime from '@fluent-wallet/wallet_get-block-time'
import * as ethGetLogs from '@fluent-wallet/eth_get-logs'
import * as cfxGetPosRewardByEpoch from '@fluent-wallet/cfx_get-pos-reward-by-epoch'
import * as ethSignTxWithLedgerNanoS from '@fluent-wallet/eth_sign-tx-with-ledger-nano-s'
import * as walletRequestAccounts from '@fluent-wallet/wallet_request-accounts'
import * as walletAccounts from '@fluent-wallet/wallet_accounts'
import * as walletChainId from '@fluent-wallet/wallet_chain-id'
import * as walletGetNextUsableNonce from '@fluent-wallet/wallet_get-next-usable-nonce'
import * as walletEnrichEthereumTx from '@fluent-wallet/wallet_enrich-ethereum-tx'
import * as walletSendTransaction from '@fluent-wallet/wallet_send-transaction'
import * as walletHandleUnfinishedETHTx from '@fluent-wallet/wallet_handle-unfinished-eth-tx'
import * as ethSendTransaction from '@fluent-wallet/eth_send-transaction'
import * as ethGetTransactionByHash from '@fluent-wallet/eth_get-transaction-by-hash'
import * as ethGetTransactionReceipt from '@fluent-wallet/eth_get-transaction-receipt'
import * as ethSendRawTransaction from '@fluent-wallet/eth_send-raw-transaction'
import * as ethSignTransaction from '@fluent-wallet/eth_sign-transaction'
import * as ethFeeHistory from '@fluent-wallet/eth_fee-history'
import * as walletNetwork1559Compatible from '@fluent-wallet/wallet_network1559compatible'
import * as ethGetBlockByHash from '@fluent-wallet/eth_get-block-by-hash'
import * as ethGetBlockByNumber from '@fluent-wallet/eth_get-block-by-number'
import * as walletSetPreferences from '@fluent-wallet/wallet_set-preferences'
import * as walletGetPreferences from '@fluent-wallet/wallet_get-preferences'
import * as walletUpdateNetwork from '@fluent-wallet/wallet_update-network'
import * as cfxGetMaxGasLimit from '@fluent-wallet/cfx_get-max-gas-limit'
import * as walletMetadataForPopup from '@fluent-wallet/wallet_metadata-for-popup'
import * as cfxSignTxWithLedgerNanoS from '@fluent-wallet/cfx_sign-tx-with-ledger-nano-s'
import * as walletGetImportHardwareWalletInfo from '@fluent-wallet/wallet_get-import-hardware-wallet-info'
import * as walletImportHardwareWalletAccountGroupOrAccount from '@fluent-wallet/wallet_import-hardware-wallet-account-group-or-account'
import * as walletGetFluentMetadata from '@fluent-wallet/wallet_get-fluent-metadata'
import * as walletCleanupTx from '@fluent-wallet/wallet_cleanup-tx'
import * as walletEnrichConfluxTx from '@fluent-wallet/wallet_enrich-conflux-tx'
import * as walletEnrichTxs from '@fluent-wallet/wallet_enrich-txs'
import * as walletGetBlockchainExplorerUrl from '@fluent-wallet/wallet_get-blockchain-explorer-url'
import * as cfxGetNextUsableNonce from '@fluent-wallet/cfx_get-next-usable-nonce'
import * as walletHandleUnfinishedTxs from '@fluent-wallet/wallet_handle-unfinished-txs'
import * as walletHandleUnfinishedCFXTx from '@fluent-wallet/wallet_handle-unfinished-cfx-tx'
import * as cfxGetBlockByEpochNumber from '@fluent-wallet/cfx_get-block-by-epoch-number'
import * as cfxGetBlockByBlockNumber from '@fluent-wallet/cfx_get-block-by-block-number'
import * as cfxGetAccountPendingInfo from '@fluent-wallet/cfx_get-account-pending-info'
import * as cfxGetAccountPendingTransactions from '@fluent-wallet/cfx_get-account-pending-transactions'
import * as cfxGetPoSEconomics from '@fluent-wallet/cfx_get-pos-economics'
import * as cfxGetSupplyInfo from '@fluent-wallet/cfx_get-supply-info'
import * as cfxOpenedMethodGroups from '@fluent-wallet/cfx_opened-method-groups'
import * as txpoolNextNonce from '@fluent-wallet/txpool_next-nonce'
import * as cfxGetVoteList from '@fluent-wallet/cfx_get-vote-list'
import * as cfxGetTransactionReceipt from '@fluent-wallet/cfx_get-transaction-receipt'
import * as cfxGetTransactionByHash from '@fluent-wallet/cfx_get-transaction-by-hash'
import * as cfxGetStorageAt from '@fluent-wallet/cfx_get-storage-at'
import * as cfxGetStorageRoot from '@fluent-wallet/cfx_get-storage-root'
import * as cfxGetStakingBalance from '@fluent-wallet/cfx_get-staking-balance'
import * as cfxGetSponsorInfo from '@fluent-wallet/cfx_get-sponsor-info'
import * as cfxGetSkippedBlocksByEpoch from '@fluent-wallet/cfx_get-skipped-blocks-by-epoch'
import * as cfxGetLogs from '@fluent-wallet/cfx_get-logs'
import * as cfxGetInterestRate from '@fluent-wallet/cfx_get-interest-rate'
import * as cfxGetConfirmationRiskByHash from '@fluent-wallet/cfx_get-confirmation-risk-by-hash'
import * as cfxGetCollateralForStorage from '@fluent-wallet/cfx_get-collateral-for-storage'
import * as cfxGetBlocksByEpoch from '@fluent-wallet/cfx_get-blocks-by-epoch'
import * as cfxGetBlockRewardInfo from '@fluent-wallet/cfx_get-block-reward-info'
import * as cfxGetBlockByHashWithPivotAssumption from '@fluent-wallet/cfx_get-block-by-hash-with-pivot-assumption'
import * as cfxGetBlockByHash from '@fluent-wallet/cfx_get-block-by-hash'
import * as cfxGetBestBlockHash from '@fluent-wallet/cfx_get-best-block-hash'
import * as cfxGetAdmin from '@fluent-wallet/cfx_get-admin'
import * as cfxGetAccumulateInterestRate from '@fluent-wallet/cfx_get-accumulate-interest-rate'
import * as cfxClientVersion from '@fluent-wallet/cfx_client-version'
import * as cfxAccounts from '@fluent-wallet/cfx_accounts'
import * as cfxCall from '@fluent-wallet/cfx_call'
import * as cfxChainId from '@fluent-wallet/cfx_chain-id'
import * as cfxCheckBalanceAgainstTransaction from '@fluent-wallet/cfx_check-balance-against-transaction'
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
import * as cfxSendRawTransaction from '@fluent-wallet/cfx_send-raw-transaction'
import * as cfxSendTransaction from '@fluent-wallet/cfx_send-transaction'
import * as cfxSignTransaction from '@fluent-wallet/cfx_sign-transaction'
import * as cfxTypedSignV4 from '@fluent-wallet/cfx_sign-typed-data_v4'
import * as cfxMaxPriorityFeePerGas from '@fluent-wallet/cfx_max-priority-fee-per-gas'
import * as cfxFeeHistory from '@fluent-wallet/cfx_fee-history'
import * as ethAccounts from '@fluent-wallet/eth_accounts'
import * as ethBlockNumber from '@fluent-wallet/eth_block-number'
import * as ethCall from '@fluent-wallet/eth_call'
import * as ethChainId from '@fluent-wallet/eth_chain-id'
import * as ethEstimateGas from '@fluent-wallet/eth_estimate-gas'
import * as ethGasPrice from '@fluent-wallet/eth_gas-price'
import * as ethGetBalance from '@fluent-wallet/eth_get-balance'
import * as ethGetCode from '@fluent-wallet/eth_get-code'
import * as ethGetTransactionCount from '@fluent-wallet/eth_get-transaction-count'
import * as ethRequestAccounts from '@fluent-wallet/eth_request-accounts'
import * as ethTypedSignV4 from '@fluent-wallet/eth_sign-typed-data_v4'
import * as ethMaxPriorityFeePerGas from '@fluent-wallet/eth_max-priority-fee-per-gas'
import * as ethEstimate1559Fee from '@fluent-wallet/eth_estimate-1559-fee'

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
import * as walletDbQuery from '@fluent-wallet/wallet_db-query'
import * as walletDeleteAccountGroup from '@fluent-wallet/wallet_delete-account-group'
import * as walletDeleteApp from '@fluent-wallet/wallet_delete-app'
import * as walletDeleteNetwork from '@fluent-wallet/wallet_delete-network'
import * as walletDetectAddressType from '@fluent-wallet/wallet_detect-address-type'
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
import * as walletRefreshBalance from '@fluent-wallet/wallet_refetch-balance'
import * as walletRefetchTokenList from '@fluent-wallet/wallet_refetch-token-list'
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
import * as walletUpdateTokenList from '@fluent-wallet/wallet_update-token-list'
import * as walletUserApprovedAuthRequest from '@fluent-wallet/wallet_user-approved-auth-request'
import * as walletUserRejectedAuthRequest from '@fluent-wallet/wallet_user-rejected-auth-request'
import * as walletValidateAppPermissions from '@fluent-wallet/wallet_validate-app-permissions'
import * as walletValidateMnemonic from '@fluent-wallet/wallet_validate-mnemonic'
import * as walletValidatePassword from '@fluent-wallet/wallet_validate-password'
import * as walletValidatePrivateKey from '@fluent-wallet/wallet_validate-private-key'
import * as walletValidate20Token from '@fluent-wallet/wallet_validate20token'
import * as walletWatchAsset from '@fluent-wallet/wallet_watch-asset'
import * as unwalletWatchAsset from '@fluent-wallet/wallet_unwatch-asset'
import * as walletZeroAccountGroup from '@fluent-wallet/wallet_zero-account-group'
import * as walletAfterUnlock from '@fluent-wallet/wallet_after-unlock'

export const rpcEngineOpts = {
  isProd: IS_PROD_MODE,
  isDev: IS_DEV_MODE,
  isTest: IS_TEST_MODE,
  isCI: IS_CI,
  methods: [
    walletMetadataForPopup,
    walletDbQuery,
    walletValidate20Token,

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
    walletImportHardwareWalletAccountGroupOrAccount,
    walletImportMnemonic,
    walletImportPrivateKey,
    walletImportAddress,
    walletDiscoverAccounts,
    walletCreateAddress,
    walletCreateAccount,
    walletUpdateAccount,
    walletUpdateAccountGroup,
    walletGetAccountGroup,
    walletGetImportHardwareWalletInfo,
    walletExportAccount,
    walletExportAccountGroup,
    walletExportAll,
    walletImportAll,
    walletDeleteAccountGroup,
    walletDeleteAccount,
    walletAddHdPath,
    walletAddNetwork,
    walletUpdateNetwork,
    walletGetNetwork,
    walletDeleteNetwork,
    walletDetectNetworkType,
    walletDetectAddressType,
    walletGetAddressPrivateKey,
    walletGetAccountGroupVaultValue,
    walletSetAppCurrentAccount,
    walletSetAppCurrentNetwork,
    walletSetCurrentAccount,
    walletSetCurrentNetwork,
    walletGetCurrentViewingApp,
    walletGetCurrentNetwork,
    walletGetCurrentAccount,

    walletRequestAccounts,
    walletAccounts,
    walletGetNextUsableNonce,
    walletGetNextNonce,
    walletGetBlockOrEpochNumber,
    walletGetBalance,
    walletRefreshBalance,
    walletChainId,

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
    walletRefetchTxList,
    walletUpdateTokenList,
    walletGetBlockchainExplorerUrl,
    walletEnrichTxs,
    walletEnrichConfluxTx,
    walletEnrichEthereumTx,

    walletWatchAsset,
    unwalletWatchAsset,

    // cfx
    cfxClientVersion,
    cfxGetAccumulateInterestRate,
    cfxGetBestBlockHash,
    cfxGetBlockByHash,
    cfxGetBlockByHashWithPivotAssumption,
    cfxGetBlockRewardInfo,
    cfxGetBlocksByEpoch,
    cfxGetCollateralForStorage,
    cfxGetConfirmationRiskByHash,
    cfxGetLogs,
    cfxGetSkippedBlocksByEpoch,
    cfxGetSponsorInfo,
    cfxGetStakingBalance,
    cfxGetStorageAt,
    cfxGetTransactionByHash,
    cfxGetTransactionReceipt,
    cfxGetVoteList,
    cfxGetBlockByBlockNumber,
    cfxGetBlockByEpochNumber,
    cfxGetAccountPendingInfo,
    cfxGetAccountPendingTransactions,
    cfxGetPoSEconomics,
    cfxGetPosRewardByEpoch,
    cfxGetInterestRate,
    cfxGetSupplyInfo,
    cfxOpenedMethodGroups,
    txpoolNextNonce,
    cfxGetStorageRoot,
    cfxGetAdmin,
    cfxEpochNumber,
    cfxGetAccount,
    cfxGetCode,
    cfxGetNextNonce,
    cfxGetNextUsableNonce,
    cfxGetBalance,
    cfxCall,
    cfxGetStatus,
    cfxNetVersion,
    cfxChainId,
    cfxAccounts,
    cfxGasPrice,
    cfxCheckBalanceAgainstTransaction,
    cfxEstimateGasAndCollateral,
    walletAddConfluxChain,
    walletSwitchConfluxChain,
    cfxSendRawTransaction,
    cfxSignTransaction,
    cfxSendTransaction,
    cfxSignTxWithLedgerNanoS,
    cfxGetMaxGasLimit,
    cfxMaxPriorityFeePerGas,
    cfxFeeHistory,

    // eth
    ethGetCode,
    ethGetLogs,
    ethGetTransactionCount,
    ethGetBalance,
    ethCall,
    ethChainId,
    netVersion,
    ethAccounts,
    ethFeeHistory,
    ethGasPrice,
    ethEstimateGas,
    ethBlockNumber,
    ethGetBlockByNumber,
    ethGetBlockByHash,
    walletAddEthereumChain,
    walletSwitchEthereumChain,
    walletNetwork1559Compatible,
    ethSignTransaction,
    ethSendRawTransaction,
    ethGetTransactionReceipt,
    ethGetTransactionByHash,
    ethSendTransaction,
    ethSignTxWithLedgerNanoS,
    ethMaxPriorityFeePerGas,
    ethEstimate1559Fee,
    // sign
    personalSign,
    ethTypedSignV4,
    cfxTypedSignV4,

    walletSendTransactionWithAction,
    walletSendTransaction,
    walletHandleUnfinishedETHTx,
    walletHandleUnfinishedCFXTx,
    walletHandleUnfinishedTxs,
    walletCleanupTx,
    walletGetFluentMetadata,
    walletGetPreferences,
    walletSetPreferences,
    walletUpsertMemo,
    walletDeleteMemo,
    walletGetBlockTime,

    walletAfterUnlock,
  ],
}
