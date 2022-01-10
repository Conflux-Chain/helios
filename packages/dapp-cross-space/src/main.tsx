import React from 'react'
import ReactDOM from 'react-dom'
import {Provider} from './manage'
import Nav from './pages/Nav'
import App from './pages'
import './index.css'

ReactDOM.render(
  <React.StrictMode>
    <Provider>
      <Nav />
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root'),
)
