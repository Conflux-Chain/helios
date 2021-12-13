import create from 'zustand'

const defaultSendTransactionParams = {
  toAddress: '',
  sendAmount: '',
  gasPrice: '',
  gasLimit: '',
  storageLimit: '',
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
  exportPrivateKey: '',
  exportSeedPhrase: '',
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
  setStorageLimit: storageLimit => set({storageLimit}),
  setCustomAllowance: customAllowance => set({customAllowance}),
  setNonce: nonce => set({nonce}),
  setSendToken: sendToken => set({sendToken}),
  setExportPrivateKey: exportPrivateKey => set({exportPrivateKey}),
  setExportSeedPhrase: exportSeedPhrase => set({exportSeedPhrase}),
  clearSendTransactionParams: () => set({...defaultSendTransactionParams}),
}))

export default useGlobalStore
