export default {
  // basic rpc methods like cfx_epochNumber, eth_blockNumber
  wallet_basic: {},
  // methods
  // to get user addresses like eth_accounts, cfx_accounts
  // to request user's signature of these accounts, eg. cfx_sendTransaction, eth_signTypedData_v4
  wallet_accounts: {},
  cfx_accounts: {},
  eth_accounts: {},
  // methods to about networks
  // eg. wallet_addEthereumChain, wallet_switchConfluxChain
  wallet_networks: {},
}
