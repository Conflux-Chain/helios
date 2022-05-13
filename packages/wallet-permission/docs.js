export default {
  wallet_basic: {
    en: 'permission for basic rpc methods that do not request user address or signature, eg. cfx_epochNumber, eth_blockNumber, wallet_generatePrivateKey, this permission is added by default',
  },
  wallet_accounts: {
    en: 'permission for methods that need user address or signature, eg. cfx_sendTransaction, eth_signTypedData_v4',
  },
  cfx_accounts: {en: 'alias for wallet_account'},
  eth_accounts: {en: 'alias for wallet_account'},
  wallet_crossNetworkTypeGetConfluxBase32Address: {
    en: "permission for methods need user's Conflux core space mainnet address on other network",
  },
  wallet_crossNetworkTypeGetEthereumHexAddress: {
    en: "permission for methods need user's Ethereum type address (hex address) on other(Conflux core) network",
  },
  wallet_networks: {
    en: 'permission for methods related to network change, eg. wallet_switchEthereumChain, wallet_switchConfluxChain, this permission is added by default',
  },
}
