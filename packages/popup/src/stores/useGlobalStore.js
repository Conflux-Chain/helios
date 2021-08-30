import create from 'zustand'

let Store = null

const createGlobalStore = () =>
  // eslint-disable-next-line no-unused-vars
  create((set, get) => ({
    accountGroups: null,
    isLocked: false,

    setAccountGroups: accountGroups => set({accountGroups}),
  }))

export const useGlobalState = () => {
  if (!Store) Store = createGlobalStore()
  const useStore = Store
  const state = useStore()

  return state
}
