import React from 'react'
import ReactDOM from 'react-dom'
import {Provider} from './manage'
import Nav from './pages/Nav'
import App from './pages'
import './index.css'

export const ConfluxSpace = 'Conflux Core';
export const EvmSpace = 'Conflux eSpace';

ReactDOM.render(
  <React.StrictMode>
    <Provider>
      <Nav />
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root'),
)
