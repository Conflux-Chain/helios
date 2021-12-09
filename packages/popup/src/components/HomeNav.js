import {LockOutLined} from '@fluent-wallet/component-icons'
import {request} from '../utils'
import {useSWRConfig} from 'swr'
import {RPC_METHODS} from '../constants'
import useGlobalStore from '../stores/index.js'
const {LOCK} = RPC_METHODS

function HomeNav() {
  const {setFatalError} = useGlobalStore()
  const {mutate} = useSWRConfig()
  const onLock = () => {
    request(LOCK)
      .then(() => mutate([RPC_METHODS.WALLET_IS_LOCKED], true, true))
      .catch(error => setFatalError(error))
  }
  return (
    <nav className="flex h-13 items-center justify-between px-4 bg-secondary z-10 flex-shrink-0">
      <img className="w-6 h-6" src="/images/logo.svg" alt="logo" />
      <LockOutLined
        className="w-4 h-4 text-white cursor-pointer"
        id="lockBtn"
        onClick={onLock}
      />
    </nav>
  )
}

export default HomeNav
