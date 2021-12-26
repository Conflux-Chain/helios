import PropTypes from 'prop-types'
import {Redirect, Route} from 'react-router-dom'
import useGlobalStore from '../stores/index.js'

import {ROUTES} from '../constants'
const {ERROR, WALLET_UNLOCK, WELCOME} = ROUTES

const ProtectedRoute = ({hasAccount, isLocked, ...rest}) => {
  const {FATAL_ERROR} = useGlobalStore()
  switch (true) {
    case FATAL_ERROR:
      return <Redirect to={{pathname: ERROR}} />
    case !hasAccount:
      return <Redirect to={{pathname: WELCOME}} />
    case isLocked:
      return <Redirect to={{pathname: WALLET_UNLOCK}} />
    default:
      return <Route {...rest} />
  }
}

ProtectedRoute.propTypes = {
  hasAccount: PropTypes.bool,
  isLocked: PropTypes.bool,
}

export default ProtectedRoute
