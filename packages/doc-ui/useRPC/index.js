import {useEffect} from 'react'
import create from 'zustand'

const RPCS = {}
const Stores = {}

const createRPC = rpcName =>
  create((set, get) => ({
    _retryCount: 0,
    cantLoadRPC: null,
    loadingRPC: true,
    rpcName,

    // setRpcName: rpcName => (set({rpcName}), get().setRPC()),
    setRPC: () => {
      const {rpcName} = get()
      if (!rpcName) return
      if (RPCS[rpcName]) return set({...RPCS[rpcName], loadingRPC: false})

      window &&
        import(
          /* webpackPreload: true */
          /* webpackMode: "lazy-once" */
          /* webpackInclude: /(cfx|wallet)_\w+\/index\.js$/ */
          /* webpackExclude: /(\test\.js|\.md)$/ */
          '@cfxjs/' + get().rpcName
        )
          .then(rpc => set({...rpc, loadingRPC: false}))
          .catch(err => {
            const {_retryCount, setRPC} = get()
            if (_retryCount < 5) {
              set(({_retryCount}) => ({_retryCount: _retryCount + 1}))
              setRPC()
              return
            }

            console.error(err)
            set({cantLoadRPC: err})
          })
    },
  }))

export const useRPC = rpcName => {
  if (!rpcName) throw new Error(`invalid rpcName: ${rpcName}`)

  // find/init the store of this rpc
  const isNewRpc = !Stores[rpcName]
  if (isNewRpc) Stores[rpcName] = createRPC(rpcName)
  const s = Stores[rpcName]()

  // init the rpc store if it's first call
  useEffect(() => {
    if (isNewRpc) s.setRPC()
  }, [isNewRpc])

  return s
}
