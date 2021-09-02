import React from 'react'
import {Route, Redirect} from 'react-router-dom'

// eslint-disable-next-line react/prop-types
const ProtectedRoute = ({children, hasAccount, isLocked, ...rest}) => {
  return (
    <Route
      {...rest}
      render={() => {
        const to =
          typeof hasAccount !== 'boolean' || typeof isLocked !== 'boolean'
            ? null
            : hasAccount && isLocked
            ? '/unlock'
            : !hasAccount
            ? '/welcome'
            : null
        return !to ? children : <Redirect to={to} />
      }}
    />
  )
}

export default ProtectedRoute
