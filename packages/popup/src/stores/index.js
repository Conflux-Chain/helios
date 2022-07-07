import create from 'zustand'

const useGlobalStore = create(set => ({
  FATAL_ERROR: '',
  setFatalError: e => set({FATAL_ERROR: e?.message || e}),
  // value
  createdGroupName: '',
  createdSeedPhase: '',
  createdPassword: '',
  createdMnemonic: '',
  networkInfo: {},
  addressNote: {},
  exportPrivateKeyData: [],
  exportSeedPhrase: '',
  resendInfo: {},

  // logic
  setCreatedPassword: createdPassword => set({createdPassword}),
  setCreatedGroupName: createdGroupName => set({createdGroupName}),
  setCreatedSeedPhase: createdSeedPhase => set({createdSeedPhase}),
  setCreatedMnemonic: createdMnemonic => set({createdMnemonic}),
  setNetworkInfo: networkInfo => set({networkInfo}),
  setAddressNote: addressNote => set({addressNote}),
  setResendInfo: resendInfo => set({resendInfo}),

  setExportPrivateKeyData: exportPrivateKeyData => set({exportPrivateKeyData}),
  setExportSeedPhrase: exportSeedPhrase => set({exportSeedPhrase}),
}))

export default useGlobalStore
