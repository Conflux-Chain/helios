import {Route, Redirect} from 'react-router-dom'
import {getRouteWithAuthInfo} from '../utils/index'

// eslint-disable-next-line react/prop-types
const ProtectedRoute = ({children, hasAccount, isLocked, ...rest}) => {
  return (
    <Route
      {...rest}
      render={() => {
        const to = getRouteWithAuthInfo(hasAccount, isLocked)
        return !to ? children : <Redirect to={to} />
      }}
    />
  )
}

export default ProtectedRoute
