import PropTypes from 'prop-types'
import {Redirect, Route} from 'react-router-dom'
import useGlobalStore from '../stores/index.js'
import {ROUTES} from '../constants'
const {ERROR, UNLOCK, WELCOME, PENDING_AUTH_REQ} = ROUTES

const ProtectedRoute = ({hasPendingAuthReq, hasAccount, isLocked, ...rest}) => {
  const {FATAL_ERROR} = useGlobalStore()
  switch (true) {
    case FATAL_ERROR:
      return <Redirect to={{pathname: ERROR}} />
    case !hasAccount:
      return <Redirect to={{pathname: WELCOME}} />
    case isLocked:
      return <Redirect to={{pathname: UNLOCK}} />
    case hasPendingAuthReq:
      return <Redirect to={{pathname: PENDING_AUTH_REQ}} />
    default:
      return <Route {...rest} />
  }
}

ProtectedRoute.propTypes = {
  hasPendingAuthReq: PropTypes.bool,
  hasAccount: PropTypes.bool,
  isLocked: PropTypes.bool,
}

export default ProtectedRoute
