import React from 'react'
import {
  HashRouter as Router,
  Route,
  Switch,
  Redirect,
  Link,
} from 'react-router-dom'
import A from './pages/a'
import B from './pages/b'
const {Suspense} = React

function AppDemo() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-full flex items-center justify-center">
          loading...
        </div>
      }
    >
      <Router>
        <div>
          <ul>
            <li>
              <button onClick={() => open(location.href)}>open</button>
            </li>
            <li>
              <Link to="/">a</Link>
            </li>
            <li>
              <Link to="/b">b</Link>
            </li>
          </ul>

          <hr />

          {/*
          A <Switch> looks through all its children <Route>
          elements and renders the first one whose path
          matches the current URL. Use a <Switch> any time
          you have multiple routes, but you want only one
          of them to render at a time
        */}
          <Switch>
            <Route exact path="/">
              <A />
            </Route>
            <Route path="/b">
              <B />
            </Route>
            <Route path="*">
              <Redirect to="/b" />
            </Route>
          </Switch>
        </div>
      </Router>
    </Suspense>
  )
}

export default AppDemo
