import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import './i18n.js'
import {SWRConfig} from 'swr'

// import reportWebVitals from './reportWebVitals'

// Fix chrome extension render problem in external screen
if (
  // From testing the following conditions seem to indicate that the popup was opened on a secondary monitor
  chrome &&
  (window.screenLeft < 0 ||
    window.screenTop < 0 ||
    window.screenLeft > window.screen.width ||
    window.screenTop > window.screen.height)
) {
  chrome.runtime.getPlatformInfo(function (info) {
    if (info.os === 'mac') {
      const fontFaceSheet = new CSSStyleSheet()
      fontFaceSheet.insertRule(`
        @keyframes redraw {
          0% {
            opacity: 1;
          }
          100% {
            opacity: .99;
          }
        }
      `)
      fontFaceSheet.insertRule(`
        html {
          animation: redraw 1s linear infinite;
        }
      `)
      document.adoptedStyleSheets = [
        ...document.adoptedStyleSheets,
        fontFaceSheet,
      ]
    }
  })
}

ReactDOM.render(
  <React.StrictMode>
    <SWRConfig value={{revalidateOnMount: true, refreshInterval: 3000}}>
      <App />
    </SWRConfig>
  </React.StrictMode>,
  document.getElementById('root'), // eslint-disable-line testing-library/no-node-access
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals()
