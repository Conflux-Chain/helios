import create from 'zustand'

const useGlobalStore = create(set => ({
  // value
  createdGroupName: '',
  createdSeedPhase: '',
  createdPassword: '',

  // logic
  setCreatedPassword: createdPassword => set({createdPassword}),
  setCreatedGroupName: createdGroupName => set({createdGroupName}),
  setCreatedSeedPhase: createdSeedPhase => set({createdSeedPhase}),
}))

export default useGlobalStore
