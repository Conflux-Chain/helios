import create from 'zustand'

const useStore = create(set => ({
  newPassword: '',
  createNewPassword: password => set(() => ({newPassword: password})),
  // removeAllState: () => set({newPassword: 0}),
}))

export default useStore
