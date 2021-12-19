import {useAsync} from 'react-use'
import {useState, useEffect} from 'react'
import {isFalse} from '@fluent-wallet/checks'
import {useHistory} from 'react-router-dom'
import {
  Authorizing,
  OpenApp,
  ConnectWallet,
  ReConnectWallet,
  SearchingWallet,
} from './components'
import {ROUTES} from '../../constants'
import {useQuery} from '../../hooks'

import {Conflux} from '@fluent-wallet/ledger'
const cfx = new Conflux()
const {IMPORT_HW_ACCOUNT} = ROUTES

function WalletInner() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAppOpen, setIsAppOpen] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [showReconnectStatus, setShowReconnectStatus] = useState(false)
  const history = useHistory()
  const query = useQuery()

  const {loading, value} = useAsync(async () => {
    const [isAuthenticated, isAppOpen] = await Promise.all([
      cfx.isDeviceAuthed(),
      cfx.isAppOpen(),
    ])
    return {isAuthenticated, isAppOpen}
  }, [])

  useEffect(() => {
    if (value) {
      setIsAuthenticated(value.isAuthenticated)
      setIsAppOpen(value.isAppOpen)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Boolean(value)])

  const onConnectHwWallet = async () => {
    setConnecting(true)
    const authRet = await cfx.requestAuth()
    const openRet = await cfx.isAppOpen()
    setConnecting(false)
    setIsAppOpen(openRet)
    setIsAuthenticated(authRet)
    !authRet && setShowReconnectStatus(true)
  }

  if (isAuthenticated && isAppOpen) {
    if (query.get('action') === 'close') {
      window.open('about:blank', '_self')
      window.close()
      return
    }
    history.push(IMPORT_HW_ACCOUNT)
  }

  return (
    <div>
      {loading ? (
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
    <div
      id="connect-hardware-wallet"
      className="m-auto light flex flex-col h-full min-h-screen"
    >
      <div className="flex-2" />
      <WalletInner />
      <div className="flex-3" />
    </div>
  )
}

export default ConnectHardwareWallet
