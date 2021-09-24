import {LockOutLined} from '@fluent-wallet/component-icons'
import {request} from '../utils'
import {RPC_METHODS} from '../constants'
import useGlobalStore from '../stores/index.js'
const {LOCK} = RPC_METHODS

function HomeNav() {
  const {setFatalError} = useGlobalStore()
  const onLock = () => {
    request(LOCK).then(({error}) => setFatalError(error))
  }
  return (
    <nav className="flex h-13 items-center justify-between px-4 bg-secondary z-10">
      <img className="w-6 h-6" src="images/logo.svg" alt="logo" />
      <LockOutLined
        className="w-4 h-4 text-white cursor-pointer"
        onClick={onLock}
      />
    </nav>
  )
}

export default HomeNav
