import {ErrorBoundary} from 'react-error-boundary'
import {isUndefined} from '@fluent-wallet/checks'
import React, {lazy, Suspense} from 'react'
import {HashRouter as Router, Redirect, Route, Switch} from 'react-router-dom'
import {useIsLocked, useIsZeroGroup, usePendingAuthReq} from './hooks/useApi'
import {ProtectedRoute} from './components'
import {ROUTES} from './constants'
import './index.css'
import useGlobalStore from './stores/index.js'

import ErrorPage from './pages/Error'
const HomePage = lazy(() => import('./pages/Home'))
const ConfirmSeed = lazy(() => import('./pages/CreateSeed/ConfirmSeed'))
const NewSeed = lazy(() => import('./pages/CreateSeed/NewSeed'))
const Unlock = lazy(() => import('./pages/Unlock'))
const Welcome = lazy(() => import('./pages/Welcome'))
const SetPassword = lazy(() => import('./pages/SetPassword'))
const SelectCreateType = lazy(() => import('./pages/SelectCreateType'))
const ImportSeedPhrase = lazy(() => import('./pages/ImportSeedPhrase'))
const ImportPrivateKey = lazy(() => import('./pages/ImportPrivateKey'))
const BackupSeed = lazy(() => import('./pages/CreateSeed/BackupSeed'))
const CurrentSeed = lazy(() => import('./pages/CurrentSeed'))
const ConnectSite = lazy(() => import('./pages/ConnectSite'))
const RequestSignature = lazy(() => import('./pages/RequestSignature'))
const DappAddNetwork = lazy(() => import('./pages/DappAddNetwork'))
const DappSwitchNetwork = lazy(() => import('./pages/DappSwitchNetwork'))
const ConfirmAddSuggestedToken = lazy(() =>
  import('./pages/ConfirmAddSuggestedToken'),
)
const SendTransaction = lazy(() => import('./pages/SendTransaction'))
const EditGasFee = lazy(() => import('./pages/EditGasFee'))
const EditPermission = lazy(() => import('./pages/EditPermission'))
const ConfirmTransaction = lazy(() => import('./pages/ConfirmTransaction'))
const History = lazy(() => import('./pages/History'))
const ViewData = lazy(() => import('./pages/ViewData'))
const AccountManagement = lazy(() => import('./pages/AccountManagement'))
const ExportSeed = lazy(() => import('./pages/ExportSeed'))
const ExportPrivateKey = lazy(() => import('./pages/ExportPrivateKey'))
const HardwareGuard = lazy(() => import('./pages/HardwareGuard'))
const ConnectHardwareWallet = lazy(() =>
  import('./pages/ConnectHardwareWallet'),
)
const ImportHmAccount = lazy(() => import('./pages/ImportHmAccount'))

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
  IMPORT_HM_ACCOUNT,
} = ROUTES

function App() {
  const lockedData = useIsLocked()
  const zeroGroup = useIsZeroGroup()
  const pendingAuthReq = usePendingAuthReq(!zeroGroup && !lockedData)
  const {setFatalError} = useGlobalStore()
  if (
    isUndefined(lockedData) ||
    isUndefined(zeroGroup) ||
    (!zeroGroup && !lockedData && isUndefined(pendingAuthReq))
  ) {
    return <div>loading...</div>
  }
  return (
    <ErrorBoundary
      FallbackComponent={ErrorPage}
      onError={error => setFatalError(error)}
    >
      <Suspense
        fallback={
          <div className="w-full h-full flex items-center justify-center">
            loading
          </div>
        }
      >
        <Router>
          <Switch>
            <Route exact path={WALLET_UNLOCK} component={Unlock} />
            <Route exact path={WELCOME} component={Welcome} />
            <ProtectedRoute
              pendingAuthReq={pendingAuthReq}
              hasAccount={!zeroGroup}
              isLocked={!zeroGroup && lockedData}
              exact
              path={HOME}
              component={HomePage}
            />
            <Route exact path={CURRENT_SEED_PHRASE} component={CurrentSeed} />
            <Route exact path={NEW_SEED_PHRASE} component={NewSeed} />
            <Route exact path={BACKUP_SEED_PHRASE} component={BackupSeed} />
            <Route exact path={CONFIRM_SEED_PHRASE} component={ConfirmSeed} />
            <Route
              exact
              path={IMPORT_SEED_PHRASE}
              component={ImportSeedPhrase}
            />
            <Route
              exact
              path={WALLET_IMPORT_PRIVATE_KEY}
              component={ImportPrivateKey}
            />
            <Route exact path={SEND_TRANSACTION} component={SendTransaction} />
            <Route
              exact
              path={CONFIRM_TRANSACTION}
              component={ConfirmTransaction}
            />
            <Route exact path={EDIT_GAS_FEE} component={EditGasFee} />
            <Route exact path={EDIT_PERMISSION} component={EditPermission} />
            <Route exact path={SET_PASSWORD} component={SetPassword} />
            <Route
              exact
              path={SELECT_CREATE_TYPE}
              component={SelectCreateType}
            />
            <Route exact path={VIEW_DATA} component={ViewData} />
            <Route exact path={CONNECT_SITE} component={ConnectSite} />
            <Route
              exact
              path={CONFIRM_ADD_SUGGESTED_TOKEN}
              component={ConfirmAddSuggestedToken}
            />
            <Route
              exact
              path={REQUEST_SIGNATURE}
              component={RequestSignature}
            />
            <Route
              exact
              path={DAPP_SWITCH_NETWORK}
              component={DappSwitchNetwork}
            />
            <Route exact path={DAPP_ADD_NETWORK} component={DappAddNetwork} />
            <Route exact path={HISTORY} component={History} />
            <Route
              exact
              path={ACCOUNT_MANAGEMENT}
              component={AccountManagement}
            />
            <Route exact path={EXPORT_SEED} component={ExportSeed} />
            <Route
              exact
              path={EXPORT_PRIVATEKEY}
              component={ExportPrivateKey}
            />
            <Route
              exact
              path={CONNECT_HARDWARE_WALLET}
              component={ConnectHardwareWallet}
            />
            <Route exact path={HARDWARE_GUARD} component={HardwareGuard} />
            <Route exact path={IMPORT_HM_ACCOUNT} component={ImportHmAccount} />
            <Route exact path={ERROR} component={ErrorPage} />
            <Route path="*" render={() => <Redirect to={ERROR} />} />
          </Switch>
        </Router>
      </Suspense>
    </ErrorBoundary>
  )
}

export default App
