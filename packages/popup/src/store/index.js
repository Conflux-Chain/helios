import create from 'zustand'

let GlobalStore = null

const createGlobalStore = () =>
  create(set => ({
    // value
    createdGroupName: '',
    createdSeedPhase: '',

    // logic
    setCreatedGroupName: createdGroupName => set({createdGroupName}),
    setCreatedSeedPhase: createdSeedPhase => set({createdSeedPhase}),
  }))

const useGlobalStore = () => {
  if (!GlobalStore) GlobalStore = createGlobalStore()

  return GlobalStore
}

export default useGlobalStore
