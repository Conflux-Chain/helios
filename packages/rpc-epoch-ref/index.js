const RPC_EPOCH_TAG_CONFIG = {
  // cfx
  cfx_getBlockByEpochNumber: 0,
  cfx_epochNumber: 0,
  cfx_getBlocksByEpoch: 0,
  cfx_getBalance: 1,
  cfx_getStakingBalance: 1,
  cfx_getCollateralForStorage: 1,
  cfx_getAdmin: 1,
  cfx_getCode: 1,
  cfx_getStorageAt: 2,
  cfx_getStorageRoot: 1,
  cfx_getSponsorInfo: 1,
  cfx_getNextNonce: 1,
  cfx_call: 1,
  cfx_estimateGasAndCollateral: 1,
  cfx_getAccount: 1,
  cfx_getInterestRate: 0,
  cfx_getAccumulateInterestRate: 0,
  cfx_checkBalanceAgainstTransaction: 5,
  cfx_getSkippedBlocksByEpoch: 0,
  cfx_getBlockRewardInfo: 0,
  cfx_getDepositList: 1,
  cfx_getVoteList: 1,
  // cfx_getLogs: [{fromEpoch: true, toEpoch: true}],

  ////
  cfx_getTransactionByHash: 'latest_mined',
  cfx_getTransactionReceipt: 'latest_executed',
  cfx_getBestBlockHash: 'latest_state',
  cfx_getBlockByHash: 'latest_mined',

  // eth
  eth_getBalance: 1,
  eth_getStorageAt: 2,
  eth_getTransactionCount: 1,
  eth_getBlockTransactionCountByNumber: 0,
  eth_getUncleCountByBlockNumber: 0,
  eth_getCode: 1,
  eth_call: 1,
  eth_getBlockByNumber: 0,
  eth_getTransactionByBlockNumberAndIndex: 0,
  eth_getUncleByBlockNumberAndIndex: 0,
  eth_feeHistory: 1,
  // eth_newFilter: [{fromBlock: true, toBlock: true}],
  // eth_getLogs: [{fromBlock: true, toBlock: true}],
  ////
  eth_getTransactionByHash: 'latest',
  eth_getTransactionReceipt: 'latest',
  eth_getBlockByHash: 'latest',
}

export default RPC_EPOCH_TAG_CONFIG
