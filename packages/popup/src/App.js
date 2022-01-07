import PropTypes from 'prop-types'
import {ErrorBoundary} from 'react-error-boundary'
import history from 'history/browser'
import {isUndefined} from '@fluent-wallet/checks'
import React, {Suspense, cloneElement, useEffect} from 'react'
import {
  Outlet,
  Navigate,
  useNavigationType,
  useLocation,
  HashRouter,
  Route,
  Routes,
} from 'react-router-dom'
import {TransitionGroup, CSSTransition} from 'react-transition-group'
import {useDataForPopup} from './hooks/useApi'
import {ROUTES, FULL_WINDOW_ROUTES, DAPP_REQUEST_ROUTES} from './constants'
import PageLoading from './hooks/useLoading/PageLoading'
import './App.css'
import useGlobalStore from './stores/index.js'
import {getPageType} from './utils'

import ErrorPage from './pages/Error'
import HomePage from './pages/Home'
import ConfirmSeed from './pages/CreateSeed/ConfirmSeed'
import NewSeed from './pages/CreateSeed/NewSeed'
import Unlock from './pages/Unlock'
import Welcome from './pages/Welcome'
import SetPassword from './pages/SetPassword'
import SelectCreateType from './pages/SelectCreateType'
import ImportSeedPhrase from './pages/ImportSeedPhrase'
import ImportPrivateKey from './pages/ImportPrivateKey'
import BackupSeed from './pages/CreateSeed/BackupSeed'
import CurrentSeed from './pages/CurrentSeed'
import ConnectSite from './pages/ConnectSite'
import RequestSignature from './pages/RequestSignature'
import DappAddNetwork from './pages/DappAddNetwork'
import DappSwitchNetwork from './pages/DappSwitchNetwork'
import ConfirmAddSuggestedToken from './pages/ConfirmAddSuggestedToken'
import SendTransaction from './pages/SendTransaction'
import EditGasFee from './pages/EditGasFee'
import EditPermission from './pages/EditPermission'
import ConfirmTransaction from './pages/ConfirmTransaction'
import History from './pages/History'
import ViewData from './pages/ViewData'
import AccountManagement from './pages/AccountManagement'
import ExportSeed from './pages/ExportSeed'
import ExportPrivateKey from './pages/ExportPrivateKey'
import HardwareGuard from './pages/HardwareGuard'
import ConnectHardwareWallet from './pages/ConnectHardwareWallet'
import ImportHwAccount from './pages/ImportHwAccount'

const {
  HOME,
  WALLET_UNLOCK,
  WELCOME,
  CURRENT_SEED_PHRASE,
  NEW_SEED_PHRASE,
  BACKUP_SEED_PHRASE,
  CONFIRM_SEED_PHRASE,
  SET_PASSWORD,
  SELECT_CREATE_TYPE,
  IMPORT_SEED_PHRASE,
  WALLET_IMPORT_PRIVATE_KEY,
  ERROR,
  CONNECT_SITE,
  CONFIRM_ADD_SUGGESTED_TOKEN,
  REQUEST_SIGNATURE,
  DAPP_ADD_NETWORK,
  DAPP_SWITCH_NETWORK,
  SEND_TRANSACTION,
  EDIT_GAS_FEE,
  EDIT_PERMISSION,
  CONFIRM_TRANSACTION,
  VIEW_DATA,
  HISTORY,
  ACCOUNT_MANAGEMENT,
  EXPORT_SEED,
  EXPORT_PRIVATEKEY,
  HARDWARE_GUARD,
  CONNECT_HARDWARE_WALLET,
  IMPORT_HW_ACCOUNT,
} = ROUTES

function RouteTransition({AppRoutes}) {
  // The normal case of routing forward and backward applies a forward/backward sliding field to the left and right.
  // When switching completely to unrelated content: e.g. tap on the first screen of the wallet; switch to a locked page. Such places should use another transition animation.
  const location = useLocation()
  const navigationType = useNavigationType()

  const fullSwitch =
    location.pathname === WALLET_UNLOCK ||
    location.pathname === ERROR ||
    history.length === 1

  return (
    <div
      id="router"
      className={`m-auto light relative overflow-hidden ${
        FULL_WINDOW_ROUTES.includes(location.pathname)
          ? 'h-screen w-full'
          : 'h-150 w-93'
      }`}
    >
      <TransitionGroup
        component={null}
        childFactory={child =>
          cloneElement(child, {
            classNames: `router router-${
              fullSwitch
                ? 'full-switch'
                : navigationType === 'PUSH'
                ? 'forward'
                : 'back'
            }`,
          })
        }
      >
        <CSSTransition key={location.key} timeout={300} in>
          <AppRoutes location={location} />
        </CSSTransition>
      </TransitionGroup>
    </div>
  )
}

RouteTransition.propTypes = {
  AppRoutes: PropTypes.func.isRequired,
}

function LockedRoutes(props) {
  /* prettier-ignore */
  return (
    <Routes {...props}>
      <Route index element={<Navigate to={WALLET_UNLOCK} />} />
      <Route path={WALLET_UNLOCK} exect element={<Unlock />} />
    </Routes>
  )
}

function ZeroAccountRoutes(props) {
  /* prettier-ignore */
  return (
    <Routes {...props}>
      <Route path="/" element={<Navigate to={WELCOME} />} />
      <Route path={CURRENT_SEED_PHRASE} element={<CurrentSeed/>} />
      <Route path={NEW_SEED_PHRASE} element={<NewSeed/>} />
      <Route path={IMPORT_SEED_PHRASE} element={<ImportSeedPhrase/>} />
      <Route path={WALLET_IMPORT_PRIVATE_KEY} element={<ImportPrivateKey/>} />
      <Route path={NEW_SEED_PHRASE} element={<NewSeed/>} />
      <Route path={SET_PASSWORD} element={<SetPassword/>} />
      <Route path={SELECT_CREATE_TYPE} element={<SelectCreateType/>} />
      <Route path={WELCOME} element={<Welcome />} />
    </Routes>
  )
}

function FatalErrorRoutes(props) {
  /* prettier-ignore */
  return (
    <Routes {...props}>
      <Route index element={<Navigate to={ERROR} />} />
      <Route path={ERROR} element={<ErrorPage/>} />
    </Routes>
  )
}

function AuthReqRoutes(props) {
  const {pendingAuthReq} = useDataForPopup()
  const path = DAPP_REQUEST_ROUTES[pendingAuthReq[0]?.req?.method]
  /* prettier-ignore */
  return (
    <Routes {...props}>
      <Route
        path="/"
        element={
          <Navigate
            to={path || ERROR}
            state={{params: path ? pendingAuthReq[0]?.req?.params : undefined,}}
          />
        }
      />
      <Route path={DAPP_SWITCH_NETWORK} element={<DappSwitchNetwork/>} />
      <Route path={WALLET_IMPORT_PRIVATE_KEY} element={<ImportPrivateKey/>} />
      <Route path={CONFIRM_ADD_SUGGESTED_TOKEN} element={<ConfirmAddSuggestedToken/>} />
      <Route path={CONNECT_SITE} element={<ConnectSite/>} />
      <Route path={EDIT_GAS_FEE} element={<EditGasFee/>} />
      <Route path={EDIT_PERMISSION} element={<EditPermission/>} />
      <Route path={CONFIRM_TRANSACTION} element={<ConfirmTransaction/>} />
      <Route path={VIEW_DATA} element={<ViewData/>} />
      <Route path={DAPP_ADD_NETWORK} element={<DappAddNetwork/>} />
      <Route path={REQUEST_SIGNATURE} element={<RequestSignature/>} />
      <Route path={ERROR} element={<ErrorPage/>} />
    </Routes>
  )
}

function PageRoutes(props) {
  /* prettier-ignore */
  return (
      <Routes { ...props }>
        <Route path="/" element={<Outlet/>}>
          <Route index element={<HomePage />}/>
          <Route path={HOME} element={<HomePage />} />

          <Route path={HISTORY} element={<History/>} />

          <Route path={SELECT_CREATE_TYPE} element={<SelectCreateType/>} />
          <Route path={CURRENT_SEED_PHRASE} element={<CurrentSeed/>} />
          <Route path={NEW_SEED_PHRASE} element={<NewSeed/>} />
          <Route path={CONFIRM_SEED_PHRASE} element={<ConfirmSeed/>} />
          <Route path={IMPORT_SEED_PHRASE} element={<ImportSeedPhrase/>} />
          <Route path={WALLET_IMPORT_PRIVATE_KEY} element={<ImportPrivateKey/>} />

          <Route path={SEND_TRANSACTION} element={<SendTransaction/>} />
          <Route path={CONFIRM_TRANSACTION} element={<ConfirmTransaction/>} />
          <Route path={EDIT_GAS_FEE} element={<EditGasFee/>} />
          <Route path={VIEW_DATA} element={<ViewData/>}/>


          <Route path={ACCOUNT_MANAGEMENT} element={<AccountManagement/>} />


          <Route path={BACKUP_SEED_PHRASE} element={<BackupSeed/>} />
          <Route path={EXPORT_SEED} element={<ExportSeed/>} />
          <Route path={EXPORT_PRIVATEKEY} element={<ExportPrivateKey/>} />

          <Route path={HARDWARE_GUARD} element={<HardwareGuard/>} />
          <Route path={CONNECT_HARDWARE_WALLET} element={<ConnectHardwareWallet/>} />
          <Route path={IMPORT_HW_ACCOUNT} element={<ImportHwAccount/>} />

          <Route path={ERROR} element={<ErrorPage/>} />
        </Route>
      </Routes> )
}

function AppRoutes(props) {
  const {
    locked: isLocked,
    zeroGroup: isZeroGroup,
    pendingAuthReq,
  } = useDataForPopup()

  const {FATAL_ERROR} = useGlobalStore()
  const isDapp = getPageType() === 'notification'
  const hasPendingAuthReq = pendingAuthReq?.length > 0

  if (FATAL_ERROR) {
    return <FatalErrorRoutes {...props} />
  }

  if (isZeroGroup) {
    return <ZeroAccountRoutes {...props} />
  }

  if (isLocked) {
    return <LockedRoutes {...props} />
  }

  if (isDapp && hasPendingAuthReq) {
    return <AuthReqRoutes {...props} />
  }

  return <PageRoutes {...props} />
}

function App() {
  const {locked: isLocked, pendingAuthReq} = useDataForPopup()

  const isLoading = isUndefined(isLocked)

  useEffect(() => {
    let timeout
    if (getPageType() === 'popup' && pendingAuthReq?.length > 0)
      timeout = setTimeout(() => window.close(), 300)
    return () => timeout && clearTimeout(timeout)
  }, [pendingAuthReq?.length > 0])

  const {setFatalError} = useGlobalStore()

  useEffect(() => {
    // make up for the rest of height
    window.resizeBy(0, 600 - window.innerHeight)
  }, [])

  return (
    <HashRouter>
      <ErrorBoundary
        FallbackComponent={ErrorPage}
        onError={error => {
          setFatalError(error)
        }}
      >
        {isLoading && <PageLoading />}
        {!isLoading && (
          <Suspense fallback={<PageLoading />}>
            <RouteTransition AppRoutes={AppRoutes} />
          </Suspense>
        )}
      </ErrorBoundary>
    </HashRouter>
  )
}

export default App
