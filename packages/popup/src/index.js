import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import './i18n.js'
import {SWRConfig} from 'swr'
import {ROUTES} from './constants'
import {IS_PROD_MODE, PACKAGE_VERSION} from '@fluent-wallet/inner-utils'

const {ERROR} = ROUTES
// import reportWebVitals from './reportWebVitals'

// Fix chrome extension render problem in external screen
if (
  // From testing the following conditions seem to indicate that the popup was opened on a secondary monitor
  window.chrome &&
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
            opacity: .99999;
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

const swrPostProcessDataMiddleware = useSWRNext => (key, fetcher, config) => {
  if (typeof config?.postprocessSuccessData === 'function') {
    const newFetcher = (...args) => {
      const data = fetcher(...args)
      if (typeof data?.then === 'function')
        return data.then(config?.postprocessSuccessData)
      return config?.postprocessSuccessData(data)
    }
    return useSWRNext(key, newFetcher, config)
  }
  return useSWRNext(key, fetcher, config)
}

ReactDOM.render(
  <React.StrictMode>
    <SWRConfig
      value={{
        revalidateOnMount: true,
        refreshInterval: 3000,
        use: [swrPostProcessDataMiddleware],
        onError: error => {
          if (error && location) {
            if (!IS_PROD_MODE) console.error(error)
            const prevPath = window?.location?.hash === '#/' ? 'home' : ''
            location.href = `${location.origin}${
              location.pathname
            }#${ERROR}?errorMsg=${
              encodeURIComponent(error.message) || ''
            }&from=${prevPath}`
          }
        },
      }}
    >
      <App />
    </SWRConfig>
  </React.StrictMode>,
  document.getElementById('root'), // eslint-disable-line testing-library/no-node-access
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals()

if (!IS_PROD_MODE) console.log(`Fluent Version: ${PACKAGE_VERSION}`)
