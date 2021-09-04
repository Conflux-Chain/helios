import create from 'zustand'

// let GlobalStore = null

// const createGlobalStore = () =>
//   create(set => ({
//     // value
//     createdGroupName: '',
//     createdSeedPhase: '',
//     createdPassword: '',

//     // logic
//     setCreatedPassword: createdPassword => set({createdPassword}),
//     setCreatedGroupName: createdGroupName => set({createdGroupName}),
//     setCreatedSeedPhase: createdSeedPhase => set({createdSeedPhase}),
//   }))

// const useGlobalStore = () => {
//   if (!GlobalStore) GlobalStore = createGlobalStore()

//   return GlobalStore
// }

// export default useGlobalStore

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
