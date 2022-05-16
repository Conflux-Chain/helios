import {useAsync} from 'react-use'
import {useState, useEffect} from 'react'
import {isFalse} from '@fluent-wallet/checks'
import {useHistory} from 'react-router-dom'
import {CurrentNetworkDisplay} from '../../components'
import {
  Authorizing,
  OpenApp,
  ConnectWallet,
  ReConnectWallet,
  SearchingWallet,
} from './components'
import {ROUTES} from '../../constants'
import {useQuery, useLedgerBindingApi} from '../../hooks'

const {IMPORT_HW_ACCOUNT} = ROUTES

function WalletInner() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAppOpen, setIsAppOpen] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [showReconnectStatus, setShowReconnectStatus] = useState(false)
  const history = useHistory()
  const query = useQuery()

  const ledgerBindingApi = useLedgerBindingApi()
  const {loading, value} = useAsync(async () => {
    if (ledgerBindingApi) {
      const [isAuthenticated, isAppOpen] = await Promise.all([
        ledgerBindingApi.isDeviceAuthed(),
        ledgerBindingApi.isAppOpen(),
      ])
      return {isAuthenticated, isAppOpen}
    }
  }, [ledgerBindingApi])

  useEffect(() => {
    if (value) {
      setIsAuthenticated(value.isAuthenticated)
      setIsAppOpen(value.isAppOpen)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Boolean(value)])

  useEffect(() => {
    if (isAuthenticated && isAppOpen && history && query) {
      if (query.get('action') === 'close') {
        window.open(' ', '_self')
        window.close()
        return
      }
      history.push(IMPORT_HW_ACCOUNT)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isAppOpen])

  const onConnectHwWallet = async () => {
    if (!ledgerBindingApi) {
      return
    }
    setConnecting(true)
    const authRet = await ledgerBindingApi.requestAuth()
    const openRet = await ledgerBindingApi.isAppOpen()
    setConnecting(false)
    setIsAppOpen(openRet)
    setIsAuthenticated(authRet)
    setShowReconnectStatus(!authRet)
  }
  return (
    <div className="overflow-auto">
      {loading && ledgerBindingApi ? (
        <SearchingWallet />
      ) : connecting ? (
        <Authorizing />
      ) : showReconnectStatus ? (
        <ReConnectWallet onConnectHwWallet={onConnectHwWallet} />
      ) : isFalse(loading) && isFalse(isAuthenticated) ? (
        <ConnectWallet onConnectHwWallet={onConnectHwWallet} />
      ) : isFalse(loading) && isAuthenticated && isFalse(isAppOpen) ? (
        <OpenApp />
      ) : null}
    </div>
  )
}

function ConnectHardwareWallet() {
  return (
    <div id="connect-hardware-wallet" className="h-full">
      <div className="w-screen flex justify-between px-10 p-4">
        <img
          className="w-auto h-6"
          src="/images/logo-horizontal-light.svg"
          alt="logo"
        />
        <CurrentNetworkDisplay />
      </div>
      <div className="flex flex-col h-full w-full">
        <div className="flex-1" />
        <WalletInner />
        <div className="flex-2" />
      </div>
    </div>
  )
}

export default ConnectHardwareWallet
