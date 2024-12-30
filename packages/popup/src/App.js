import {ErrorBoundary} from 'react-error-boundary'
import {isUndefined} from '@fluent-wallet/checks'
import React, {Suspense, cloneElement, useEffect} from 'react'
import {useTranslation} from 'react-i18next'
import {
  HashRouter as Router,
  Redirect,
  Route,
  Switch,
  withRouter,
} from 'react-router-dom'
import {TransitionGroup, CSSTransition} from 'react-transition-group'
import {useDataForPopup} from './hooks/useApi'
import {ProtectedRoute} from './components'
import {ROUTES, FULL_WINDOW_ROUTES} from './constants'
import PageLoading from './hooks/useLoading/PageLoading'
import './App.css'
import useGlobalStore from './stores/index.js'
import {formatLocalizationLang} from './utils'
// import {getPageType} from './utils'

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
import DappAddToken from './pages/DappAddToken'
import SendTransaction from './pages/SendTransaction'
import EditGasFee from './pages/EditGasFee'
import AdvancedGas from './pages/AdvancedGas'
import EditAllowance from './pages/EditAllowance'
import ConfirmTransaction from './pages/ConfirmTransaction'
import History from './pages/History'
import ViewData from './pages/ViewData'
import AccountManagement from './pages/AccountManagement'
import AuthorizedWebsite from './pages/AuthorizedWebsite'
import NetworkManagement from './pages/NetworkManagement'
import ExportSeed from './pages/ExportSeed'
import ExportPrivateKey from './pages/ExportPrivateKey'
import HardwareGuard from './pages/HardwareGuard'
import ConnectHardwareWallet from './pages/ConnectHardwareWallet'
import ImportHwAccount from './pages/ImportHwAccount'
import NetworkDetail from './pages/NetworkDetail'
import About from './pages/About'
import AdvancedSettings from './pages/AdvancedSettings'
import AddressBook from './pages/AddressBook'
import Contacts from './pages/Contacts'
import ResendTransaction from './pages/ResendTransaction'
import {isRunningInSidePanel} from './utils/side-panel'

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
  DAPP_ADD_TOKEN,
  REQUEST_SIGNATURE,
  DAPP_ADD_NETWORK,
  DAPP_SWITCH_NETWORK,
  SEND_TRANSACTION,
  EDIT_GAS_FEE,
  ADVANCED_GAS,
  EDIT_ALLOWANCE,
  CONFIRM_TRANSACTION,
  VIEW_DATA,
  HISTORY,
  ACCOUNT_MANAGEMENT,
  EXPORT_SEED,
  EXPORT_PRIVATEKEY,
  HARDWARE_GUARD,
  CONNECT_HARDWARE_WALLET,
  IMPORT_HW_ACCOUNT,
  NETWORK_MANAGEMENT,
  AUTHORIZED_WEBSITE,
  NETWORK_DETAIL,
  ABOUT,
  ADVANCED_SETTINGS,
  ADDRESS_BOOK,
  CONTACTS,
  RESEND_TRANSACTION,
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
    path: ADVANCED_GAS,
    component: AdvancedGas,
  },
  {
    path: EDIT_ALLOWANCE,
    component: EditAllowance,
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
    path: DAPP_ADD_TOKEN,
    component: DappAddToken,
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
    path: NETWORK_MANAGEMENT,
    component: NetworkManagement,
  },
  {
    path: AUTHORIZED_WEBSITE,
    component: AuthorizedWebsite,
  },
  {
    path: NETWORK_DETAIL,
    component: NetworkDetail,
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
  {
    path: ABOUT,
    component: About,
  },
  {
    path: ADVANCED_SETTINGS,
    component: AdvancedSettings,
  },
  {
    path: ADDRESS_BOOK,
    component: AddressBook,
  },
  {
    path: CONTACTS,
    component: Contacts,
  },
  {
    path: RESEND_TRANSACTION,
    component: ResendTransaction,
  },
]

const AppRoutes = withRouter(
  ({isLocked, isZeroGroup, pendingAuthReq, location, history}) => {
    // The normal case of routing forward and backward applies a forward/backward sliding field to the left and right.
    // When switching completely to unrelated content: e.g. tap on the first screen of the wallet; switch to a locked page. Such places should use another transition animation.
    const fullSwitch =
      location.pathname === WALLET_UNLOCK ||
      location.pathname === ERROR ||
      history.length === 1
    const {i18n} = useTranslation()

    return (
      <div
        id="router"
        className={`m-auto light relative overflow-hidden ${
          FULL_WINDOW_ROUTES.includes(location.pathname) ||
          isRunningInSidePanel()
            ? 'h-screen w-full'
            : 'h-150 w-93'
        } ${formatLocalizationLang(i18n.language) === 'zh' ? 'font-zh' : ''}`}
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
            <Switch location={location}>
              <ProtectedRoute
                key={HOME}
                hasAccount={!isZeroGroup}
                isLocked={isLocked}
                pendingAuthReq={pendingAuthReq}
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
  },
)

function App() {
  const {
    locked: isLocked,
    zeroGroup: isZeroGroup,
    pendingAuthReq,
  } = useDataForPopup()

  // TODO add this when make sure pendingAuthReq return right
  // useEffect(() => {
  //   if (getPageType() === 'popup' && pendingAuthReq?.length > 0) {
  //     console.log(pendingAuthReq)
  //     setTimeout(() => window.close(), 300)
  //   }
  // }, [pendingAuthReq?.length])

  const {setFatalError} = useGlobalStore()

  useEffect(() => {
    // make up for the rest of height
    window.resizeBy(
      document.body.clientWidth - window.innerWidth,
      600 - window.innerHeight,
    )
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
          <AppRoutes
            isLocked={isLocked}
            isZeroGroup={isZeroGroup}
            pendingAuthReq={pendingAuthReq}
          />
        </Suspense>
      </ErrorBoundary>
    </Router>
  )
}

export default App
