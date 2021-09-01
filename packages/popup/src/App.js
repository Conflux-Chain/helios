import React, {lazy, Suspense} from 'react'
import {HashRouter as Router, Route, Switch, Redirect} from 'react-router-dom'
import {useStore} from './store'
import './index.css'

const HomePage = lazy(() => import('./pages/Home'))
const ConfirmSeed = lazy(() => import('./pages/CreateSeed/ConfirmSeed'))
const CreateAccount = lazy(() => import('./pages/CreateAccount'))
const NewSeed = lazy(() => import('./pages/CreateSeed/NewSeed'))
const BackupSeed = lazy(() => import('./pages/CreateSeed/BackupSeed'))
const CurrentSeed = lazy(() => import('./pages/CurrentSeed'))

function App() {
  const {
    // locked: {lockedData, lockedIsValidating},
    // group: {groupData},
    getLocked,

    generatePrivateKey,
  } = useStore()
  // console.log(
  //   'lockedData = ',
  //   lockedData,
  //   'groupData =',
  //   groupData,
  //   'lockedIsValidating =',
  //   lockedIsValidating,
  // )

  const {data} = getLocked()
  console.log('data = ', data)

  return (
    <div className="h-160 w-95 m-auto light">
      <button
        onClick={() =>
          generatePrivateKey().then(res =>
            console.log("I'm the privateKey", res.result),
          )
        }
      >
        example
      </button>
      <Suspense
        fallback={
          <div className="w-full h-full flex items-center justify-center">
            loading...
          </div>
        }
      >
        <Router>
          <Switch>
            <Route exact path="/">
              <HomePage />
            </Route>
            <Route exact path="/create-account-default">
              <CreateAccount />
            </Route>
            <Route exact path="/create-account-current-seed-phrase">
              <CurrentSeed />
            </Route>
            <Route exact path="/create-account-new-seed-phrase">
              <NewSeed />
            </Route>
            <Route exact path="/create-account-backup-seed-phrase">
              <BackupSeed />
            </Route>
            <Route exact path="/create-account-confirm-seed-phrase">
              <ConfirmSeed />
            </Route>
            {/* TODO: Replace with 404 page */}
            <Route path="*">
              <Redirect to="/" />
            </Route>
          </Switch>
        </Router>
      </Suspense>
    </div>
  )
}

export default App
