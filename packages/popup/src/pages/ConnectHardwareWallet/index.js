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
import {Conflux} from '@fluent-wallet/ledger'
const cfx = new Conflux()
const {IMPORT_HW_ACCOUNT} = ROUTES

function WalletInner() {
  const [isAuthenticated, setIsAuthed] = useState(false)
  const [isAppOpen, setIsAppOpen] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [showReconnectStatus, setShowReconnectStatus] = useState(false)
  const history = useHistory()

  const {loading, value} = useAsync(async () => {
    const [isAuthenticated, isAppOpen] = await Promise.all([
      cfx.isDeviceAuthed(),
      cfx.isAppOpen(),
    ])
    return {isAuthenticated, isAppOpen}
  })

  useEffect(() => {
    if (value) {
      setIsAuthed(value.isAuthenticated)
      setIsAppOpen(value.isAppOpen)
    }
  }, [value])

  const onConnectHwWallet = async () => {
    setConnecting(true)
    const authRet = await cfx.requestAuth()
    const openRet = await cfx.isAppOpen()
    setConnecting(false)
    if (authRet) {
      // TODO: deal with query
      setIsAppOpen(openRet)
      openRet && history.push(IMPORT_HW_ACCOUNT)
      return
    }
    setShowReconnectStatus(true)
  }

  console.log('loading', loading)
  console.log('value', value)

  if (isAuthenticated && isAppOpen) {
    // TODO: deal with query
    history.push(IMPORT_HW_ACCOUNT)
  }

  if (loading) {
    return <SearchingWallet />
  }
  if (connecting) {
    return <Authorizing />
  }
  if (showReconnectStatus) {
    return <ReConnectWallet onConnectHwWallet={onConnectHwWallet} />
  }
  if (isFalse(loading) && isFalse(isAuthenticated)) {
    return <ConnectWallet onConnectHwWallet={onConnectHwWallet} />
  }
  if (isFalse(loading) && isAuthenticated && isFalse(isAppOpen)) {
    return <OpenApp />
  }

  return null
}

function ConnectHardwareWallet() {
  return (
    <div
      id="connect-hardware-wallet"
      className="m-auto light flex flex-col h-full min-h-screen"
    >
      <div className="flex-2" />
      <WalletInner />
      {/* {loading ? <SearchingWallet /> : value?.isDeviceAuthed ?  <ConnectWallet /> } */}
      {/* <Authorizing />
      <OpenApp />
      <ConnectWallet />
      <ReConnectWallet />
      <SearchingWallet /> */}
      <div className="flex-3" />
    </div>
  )
}

export default ConnectHardwareWallet
