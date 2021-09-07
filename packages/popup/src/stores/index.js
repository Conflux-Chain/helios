import create from 'zustand'

const useGlobalStore = create(set => ({
  // value
  createdGroupName: '',
  createdMnemonic: '',
  createdPassword: '',

  // logic
  setCreatedGroupName: createdGroupName => set({createdGroupName}),
  setCreatedMnemonic: createdMnemonic => set({createdMnemonic}),
  setCreatedPassword: createdPassword => set({createdPassword}),
}))

export default useGlobalStore
