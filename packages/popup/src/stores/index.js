import create from 'zustand'

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

  // logic
  setCreatedPassword: createdPassword => set({createdPassword}),
  setCreatedGroupName: createdGroupName => set({createdGroupName}),
  setCreatedSeedPhase: createdSeedPhase => set({createdSeedPhase}),
  setCreatedMnemonic: createdMnemonic => set({createdMnemonic}),

  setExportPrivateKey: exportPrivateKey => set({exportPrivateKey}),
  setExportSeedPhrase: exportSeedPhrase => set({exportSeedPhrase}),
}))

export default useGlobalStore
