import React from 'react'
import {Route, Redirect} from 'react-router-dom'

// eslint-disable-next-line react/prop-types
const ProtectedRoute = ({children, ...rest}) => {
  const Auth = {}
  return (
    <Route
      {...rest}
      render={() => {
        const to = Auth.isWelcome
          ? '/welcome'
          : Auth.isUnlocked
          ? '/unlock'
          : null
        return !to ? children : <Redirect to={to} />
      }}
    />
  )
}

export default ProtectedRoute
