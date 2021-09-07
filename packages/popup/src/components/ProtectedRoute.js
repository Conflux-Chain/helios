import PropTypes from 'prop-types'
import {Route, Redirect} from 'react-router-dom'

import {getRouteWithAuth} from '../utils'

const ProtectedRoute = ({children, hasAccount, isLocked, ...rest}) => {
  return (
    <Route
      {...rest}
      render={() => {
        const to = getRouteWithAuth(hasAccount, isLocked)
        return !to ? children : <Redirect to={to} />
      }}
    />
  )
}

ProtectedRoute.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
  hasAccount: PropTypes.bool,
  isLocked: PropTypes.bool,
}

export default ProtectedRoute
