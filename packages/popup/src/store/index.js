import create from '../hooks/zustand'

const useGlobalStore = create(set => ({
  // value
  createdGroupName: '',
  createdSeedPhase: '',

  // logic
  setCreatedGroupName: createdGroupName => set({createdGroupName}),
  setCreatedSeedPhase: createdSeedPhase => set({createdSeedPhase}),
}))

export default useGlobalStore
