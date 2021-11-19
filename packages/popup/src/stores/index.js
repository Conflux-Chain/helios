import create from 'zustand'

const defaultSendTransactionParams = {
  toAddress: '',
  sendAmount: '',
  gasPrice: '',
  gasLimit: '',
  nonce: '',
  sendToken: {symbol: 'CFX', icon: '', decimals: 18},
  customAllowance: '',
}

const useGlobalStore = create(set => ({
  FATAL_ERROR: '',
  setFatalError: e => set({FATAL_ERROR: e?.message || e}),
  // value
  createdGroupName: '',
  createdSeedPhase: '',
  createdPassword: '',
  createdMnemonic: '',
  ...defaultSendTransactionParams,

  // logic
  setCreatedPassword: createdPassword => set({createdPassword}),
  setCreatedGroupName: createdGroupName => set({createdGroupName}),
  setCreatedSeedPhase: createdSeedPhase => set({createdSeedPhase}),
  setCreatedMnemonic: createdMnemonic => set({createdMnemonic}),

  setToAddress: toAddress => set({toAddress}),
  setSendAmount: sendAmount => set({sendAmount}),
  setGasPrice: gasPrice => set({gasPrice}),
  setGasLimit: gasLimit => set({gasLimit}),
  setCustomAllowance: customAllowance => set({customAllowance}),
  setNonce: nonce => set({nonce}),
  setSendToken: sendToken => set({sendToken}),
  clearSendTransactionParams: () => set({...defaultSendTransactionParams}),
}))

export default useGlobalStore
