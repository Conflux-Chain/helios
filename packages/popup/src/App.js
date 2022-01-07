import PropTypes from 'prop-types'
import {ErrorBoundary} from 'react-error-boundary'
import history from 'history/browser'
import {isUndefined} from '@fluent-wallet/checks'
import React, {Suspense, cloneElement, useEffect} from 'react'
import {
  useLocation,
  HashRouter as Router,
  Navigate,
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

function RouteTransition({children}) {
  // The normal case of routing forward and backward applies a forward/backward sliding field to the left and right.
  // When switching completely to unrelated content: e.g. tap on the first screen of the wallet; switch to a locked page. Such places should use another transition animation.
  const location = useLocation()

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
                : history.action === 'PUSH'
                ? 'forward'
                : 'back'
            }`,
          })
        }
      >
        <CSSTransition key={location.pathname} timeout={300} in>
          {children}
        </CSSTransition>
      </TransitionGroup>
    </div>
  )
}

RouteTransition.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
}

function LockedRoutes() {
  /* prettier-ignore */
  return (
    <Routes>
      <Route path={WALLET_UNLOCK} exect element={<Unlock />} />
      <Route path="*" element={<Navigate to={WALLET_UNLOCK} />} />
    </Routes>
  )
}

function ZeroAccountRoutes() {
  /* prettier-ignore */
  return (
    <Routes>
      <Route exact path={CURRENT_SEED_PHRASE} element={<CurrentSeed/>} />
      <Route exact path={NEW_SEED_PHRASE} element={<NewSeed/>} />
      <Route exact path={IMPORT_SEED_PHRASE} element={<ImportSeedPhrase/>} />
      <Route exact path={WALLET_IMPORT_PRIVATE_KEY} element={<ImportPrivateKey/>} />
      <Route exact path={NEW_SEED_PHRASE} element={<NewSeed/>} />
      <Route exact path={SET_PASSWORD} element={<SetPassword/>} />
      <Route exact path={SELECT_CREATE_TYPE} element={<SelectCreateType/>} />
      <Route exact path={WELCOME} element={<Welcome />} />
      <Route path="*" element={<Navigate to={{pathname: WELCOME}} />} />
    </Routes>
  )
}

function FatalErrorRoutes() {
  /* prettier-ignore */
  return (
    <Routes>
      <Route exact path={ERROR} element={<ErrorPage/>} />
      <Route path="*" element={<Navigate to={ERROR} />} />
    </Routes>
  )
}

function AuthReqRoutes() {
  const {pendingAuthReq} = useDataForPopup()
  const path = DAPP_REQUEST_ROUTES[pendingAuthReq[0]?.req?.method]
  /* prettier-ignore */
  return (
    <Routes>
      <Route exact path={DAPP_SWITCH_NETWORK} element={<DappSwitchNetwork/>} />
      <Route exact path={WALLET_IMPORT_PRIVATE_KEY} element={<ImportPrivateKey/>} />
      <Route exact path={CONFIRM_ADD_SUGGESTED_TOKEN} element={<ConfirmAddSuggestedToken/>} />
      <Route exact path={CONNECT_SITE} element={<ConnectSite/>} />
      <Route exact path={EDIT_GAS_FEE} element={<EditGasFee/>} />
      <Route exact path={EDIT_PERMISSION} element={<EditPermission/>} />
      <Route exact path={CONFIRM_TRANSACTION} element={<ConfirmTransaction/>} />
      <Route exact path={VIEW_DATA} element={<ViewData/>} />
      <Route exact path={DAPP_ADD_NETWORK} element={<DappAddNetwork/>} />
      <Route exact path={REQUEST_SIGNATURE} element={<RequestSignature/>} />
      <Route exact path={ERROR} element={<ErrorPage/>} />
      <Route
        path="*"
        element={
          <Navigate
            to={path || ERROR}
            state={{params: path ? pendingAuthReq[0]?.req?.params : undefined,}}
          />
        }
      />
    </Routes>
  )
}

function PageRoutes() {
  /* prettier-ignore */
  return (
      <Routes>
        <Route exact path={HOME} element={<HomePage />} />

        <Route exact path={HISTORY} element={<History/>} />

        <Route exact path={SELECT_CREATE_TYPE} element={<SelectCreateType/>} />
        <Route exact path={CURRENT_SEED_PHRASE} element={<CurrentSeed/>} />
        <Route exact path={NEW_SEED_PHRASE} element={<NewSeed/>} />
        <Route exact path={CONFIRM_SEED_PHRASE} element={<ConfirmSeed/>} />
        <Route exact path={IMPORT_SEED_PHRASE} element={<ImportSeedPhrase/>} />
        <Route exact path={WALLET_IMPORT_PRIVATE_KEY} element={<ImportPrivateKey/>} />

        <Route exact path={SEND_TRANSACTION} element={<SendTransaction/>} />
        <Route exact path={CONFIRM_TRANSACTION} element={<ConfirmTransaction/>} />
        <Route exact path={EDIT_GAS_FEE} element={<EditGasFee/>} />
        <Route exact path={VIEW_DATA} element={<ViewData/>}/>


        <Route exact path={ACCOUNT_MANAGEMENT} element={<AccountManagement/>} />


        <Route exact path={BACKUP_SEED_PHRASE} element={<BackupSeed/>} />
        <Route exact path={EXPORT_SEED} element={<ExportSeed/>} />
        <Route exact path={EXPORT_PRIVATEKEY} element={<ExportPrivateKey/>} />

        <Route exact path={HARDWARE_GUARD} element={<HardwareGuard/>} />
        <Route exact path={CONNECT_HARDWARE_WALLET} element={<ConnectHardwareWallet/>} />
        <Route exact path={IMPORT_HW_ACCOUNT} element={<ImportHwAccount/>} />

        <Route exact path={ERROR} element={<ErrorPage/>} />

        <Route path="*" element={<Navigate to={HOME} />} />
      </Routes> )
}

function AppRoutes() {
  const {
    locked: isLocked,
    zeroGroup: isZeroGroup,
    pendingAuthReq,
  } = useDataForPopup()
  const {FATAL_ERROR} = useGlobalStore()
  const isDapp = getPageType() === 'notification'
  const hasPendingAuthReq = pendingAuthReq?.length > 0

  if (FATAL_ERROR) {
    return (
      <RouteTransition>
        <FatalErrorRoutes />
      </RouteTransition>
    )
  }

  if (isZeroGroup) {
    return (
      <RouteTransition>
        <ZeroAccountRoutes />
      </RouteTransition>
    )
  }

  if (isLocked) {
    return (
      <RouteTransition>
        <LockedRoutes />
      </RouteTransition>
    )
  }

  if (isDapp && hasPendingAuthReq) {
    return (
      <RouteTransition>
        <AuthReqRoutes />
      </RouteTransition>
    )
  }

  return (
    <RouteTransition>
      <PageRoutes />
    </RouteTransition>
  )
}

function App() {
  const {
    locked: isLocked,
    zeroGroup: isZeroGroup,
    pendingAuthReq,
  } = useDataForPopup()

  useEffect(() => {
    if (isLocked !== false) return
    if (getPageType() !== 'popup') return
    if (pendingAuthReq?.length > 0) {
      setTimeout(() => window.close(), 300)
    }
  }, [isLocked, pendingAuthReq?.length])

  const {setFatalError} = useGlobalStore()

  useEffect(() => {
    // make up for the rest of height
    window.resizeBy(0, 600 - window.innerHeight)
  }, [])

  if (
    isUndefined(isLocked) ||
    isUndefined(isZeroGroup) ||
    isUndefined(pendingAuthReq)
  ) {
    return <PageLoading />
  }

  return (
    <Router>
      <ErrorBoundary
        FallbackComponent={ErrorPage}
        onError={error => setFatalError(error)}
      >
        <Suspense fallback={<PageLoading />}>
          <AppRoutes />
        </Suspense>
      </ErrorBoundary>
    </Router>
  )
}

export default App
