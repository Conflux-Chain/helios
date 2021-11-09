import create from 'zustand'

const defaultSendTransactionParams = {
  toAddress: '',
  sendAmount: '',
  gasPrice: '1',
  gasLimit: '21000',
  nonce: '0',
  sendToken: {symbol: 'CFX', icon: ''},
}

const useGlobalStore = create(set => ({
  FATAL_ERROR: '',
  setFatalError: e => set({FATAL_ERROR: e?.message || e}),
  // value
  createdGroupName: '',
  createdSeedPhase: '',
  createdPassword: '',
  createdMnemonic: '',
  recommendPermissionLimit: '10000000000000000',
  customPermissionLimit: '0',

  // logic
  setCreatedPassword: createdPassword => set({createdPassword}),
  setCreatedGroupName: createdGroupName => set({createdGroupName}),
  setCreatedSeedPhase: createdSeedPhase => set({createdSeedPhase}),
  setCreatedMnemonic: createdMnemonic => set({createdMnemonic}),

  setToAddress: toAddress => set({toAddress}),
  setSendAmount: sendAmount => set({sendAmount}),
  setGasPrice: gasPrice => set({gasPrice}),
  setGasLimit: gasLimit => set({gasLimit}),
  setNonce: nonce => set({nonce}),
  setSendToken: sendToken => set({sendToken}),
  clearSendTransactionParams: () => set({...defaultSendTransactionParams}),
  setRecommendPermissionLimit: recommendPermissionLimit =>
    set({recommendPermissionLimit}),
  setCustomPermissionLimit: customPermissionLimit =>
    set({customPermissionLimit}),
}))

export default useGlobalStore
