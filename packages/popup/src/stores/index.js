import create from 'zustand'

const useGlobalStore = create(set => ({
  // value
  createdGroupName: '',
  createdMnemonic: '',

  // logic
  setCreatedGroupName: createdGroupName => set({createdGroupName}),
  setCreatedMnemonic: createdMnemonic => set({createdMnemonic}),
}))

export default useGlobalStore
