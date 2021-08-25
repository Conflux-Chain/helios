import HomePage from './pages/Home'
import ConfirmSeed from './pages/ConfirmSeed'
import CreateAccount from './pages/CreateAccount'
import NewSeed from './pages/NewSeed'
import WithCurrentSeed from './pages/WithCurrentSeed'

const routes = [
  {
    path: '/',
    component: HomePage,
    exact: true,
  },
  {
    exact: true,
    path: '/create-account',
    component: CreateAccount,
  },
  {
    path: '/create-account/import-with-current-seed',
    component: WithCurrentSeed,
    exact: true,
  },
  {
    path: '/create-account/new-seed-phrase',
    component: NewSeed,
    exact: true,
  },
  {
    path: '/create-account/confirm-seed-phrase',
    component: ConfirmSeed,
    exact: true,
  },
  {
    path: '*',
    // TODO: Replace with no match page
    component: HomePage,
  },
]

export default routes
