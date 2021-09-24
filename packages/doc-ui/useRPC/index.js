import {useEffect} from 'react'
import create from 'zustand'
import {paramCase} from 'param-case'

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
      const rpcNameSplit = rpcName.split('_')
      const [rpcPkgNamePrefix, ...rpcPkgNameRest] = rpcNameSplit
      const rpcPkgName = rpcPkgNameRest.reduce(
        (acc, n) => acc + '_' + paramCase(n),
        rpcPkgNamePrefix,
      )

      window &&
        import(
          /* webpackPreload: true */
          /* webpackMode: "lazy-once" */
          /* webpackInclude: /(cfx|eth|wallet|net|web3|personal)_(\w|-)+\/index\.js$/ */
          /* webpackExclude: /(\test\.js|\.md)$/ */
          '@fluent-wallet/' + rpcPkgName
        )
          .then(rpc => {
            return set({...rpc, loadingRPC: false})
          })
          .catch(err => {
            if (
              /\[Package Error\]/.test(err?.message) &&
              /skypack\.dev/.test(err?.fileName)
            ) {
              console.error(err)
              return
            }
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
  }, [isNewRpc, s])

  return s
}
