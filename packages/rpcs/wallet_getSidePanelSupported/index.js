import {optParam} from '@fluent-wallet/spec'

export const NAME = 'wallet_getSidePanelSupported'

const isServiceWorker = () => {
  return (
    typeof self !== 'undefined' &&
    typeof self.ServiceWorkerGlobalScope !== 'undefined' &&
    self instanceof self.ServiceWorkerGlobalScope
  )
}

export const schemas = {
  input: optParam,
}

export const permissions = {
  external: ['popup'],
  methods: [],
  locked: true,
}

export const main = () => {
  if (!isServiceWorker()) {
    return false
  }

  try {
    const anyNavigator = navigator
    if ('userAgentData' in anyNavigator) {
      const brandNames = anyNavigator.userAgentData.brands.map(
        brand => brand.brand,
      )

      if (
        !brandNames.includes('Google Chrome') &&
        !brandNames.includes('Microsoft Edge') &&
        !brandNames.includes('Brave')
      ) {
        return false
      }
    }
  } catch (e) {
    return false
  }

  return (
    typeof chrome !== 'undefined' && typeof chrome.sidePanel !== 'undefined'
  )
}
