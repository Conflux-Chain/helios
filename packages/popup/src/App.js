import {ErrorBoundary} from 'react-error-boundary'
import {isUndefined} from '@fluent-wallet/checks'
import React, {Suspense, cloneElement} from 'react'
import {
  HashRouter as Router,
  Redirect,
  Route,
  Switch,
  withRouter,
} from 'react-router-dom'
import {TransitionGroup, CSSTransition} from 'react-transition-group'
import {useIsLocked, useIsZeroGroup} from './hooks/useApi'
import {ProtectedRoute} from './components'
import {ROUTES, FULL_WINDOW_ROUTES} from './constants'
import PageLoading from './hooks/useLoading/PageLoading'
import './App.css'
import useGlobalStore from './stores/index.js'

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

const routes = [
  {
    path: WALLET_UNLOCK,
    component: Unlock,
  },
  {
    path: WELCOME,
    component: Welcome,
  },
  {
    path: CURRENT_SEED_PHRASE,
    component: CurrentSeed,
  },
  {
    path: NEW_SEED_PHRASE,
    component: NewSeed,
  },
  {
    path: BACKUP_SEED_PHRASE,
    component: BackupSeed,
  },
  {
    path: CONFIRM_SEED_PHRASE,
    component: ConfirmSeed,
  },
  {
    path: IMPORT_SEED_PHRASE,
    component: ImportSeedPhrase,
  },
  {
    path: WALLET_IMPORT_PRIVATE_KEY,
    component: ImportPrivateKey,
  },
  {
    path: SEND_TRANSACTION,
    component: SendTransaction,
  },
  {
    path: CONFIRM_TRANSACTION,
    component: ConfirmTransaction,
  },
  {
    path: EDIT_GAS_FEE,
    component: EditGasFee,
  },
  {
    path: EDIT_PERMISSION,
    component: EditPermission,
  },
  {
    path: SET_PASSWORD,
    component: SetPassword,
  },
  {
    path: SELECT_CREATE_TYPE,
    component: SelectCreateType,
  },
  {
    path: VIEW_DATA,
    component: ViewData,
  },
  {
    path: CONNECT_SITE,
    component: ConnectSite,
  },
  {
    path: CONFIRM_ADD_SUGGESTED_TOKEN,
    component: ConfirmAddSuggestedToken,
  },
  {
    path: REQUEST_SIGNATURE,
    component: RequestSignature,
  },
  {
    path: DAPP_SWITCH_NETWORK,
    component: DappSwitchNetwork,
  },
  {
    path: DAPP_ADD_NETWORK,
    component: DappAddNetwork,
  },
  {
    path: HISTORY,
    component: History,
  },
  {
    path: ACCOUNT_MANAGEMENT,
    component: AccountManagement,
  },
  {
    path: EXPORT_SEED,
    component: ExportSeed,
  },
  {
    path: EXPORT_PRIVATEKEY,
    component: ExportPrivateKey,
  },
  {
    path: ERROR,
    component: ErrorPage,
  },
  {
    path: HARDWARE_GUARD,
    component: HardwareGuard,
  },
  {
    path: CONNECT_HARDWARE_WALLET,
    component: ConnectHardwareWallet,
  },
  {
    path: IMPORT_HW_ACCOUNT,
    component: ImportHwAccount,
  },
]

const AppRoutes = withRouter(({lockedData, zeroGroup, location, history}) => {
  // The normal case of routing forward and backward applies a forward/backward sliding field to the left and right.
  // When switching completely to unrelated content: e.g. tap on the first screen of the wallet; switch to a locked page. Such places should use another transition animation.
  const fullSwitch = location.pathname === WALLET_UNLOCK || history.length === 1

  return (
    <div
      id="router"
      className={`m-auto light relative overflow-hidden ${
        FULL_WINDOW_ROUTES.includes(location.pathname)
          ? 'min-h-screen w-full'
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
        <CSSTransition
          key={location.pathname}
          timeout={!fullSwitch ? 380 : 620}
          appear
          in
        >
          <Switch location={location}>
            <ProtectedRoute
              key={HOME}
              hasAccount={!zeroGroup}
              isLocked={!zeroGroup && lockedData}
              exact
              path={HOME}
              component={HomePage}
            />
            {routes.map(route => (
              <Route
                key={route.path}
                exact
                path={route.path}
                component={route.component}
              />
            ))}
            <Route path="*" render={() => <Redirect to={ERROR} />} />
          </Switch>
        </CSSTransition>
      </TransitionGroup>
    </div>
  )
})

function App() {
  const lockedData = useIsLocked()
  const zeroGroup = useIsZeroGroup()
  const {setFatalError} = useGlobalStore()
  if (isUndefined(lockedData) || isUndefined(zeroGroup)) {
    return <PageLoading />
  }

  return (
    <Router>
      <ErrorBoundary
        FallbackComponent={ErrorPage}
        onError={error => setFatalError(error)}
      >
        <Suspense fallback={<PageLoading />}>
          <AppRoutes lockedData={lockedData} zeroGroup={zeroGroup} />
        </Suspense>
      </ErrorBoundary>
    </Router>
  )
}

export default App
