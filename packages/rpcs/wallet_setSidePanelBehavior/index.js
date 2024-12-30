export const NAME = 'wallet_setSidePanelBehavior'

export const schemas = {}

export const permissions = {
  external: ['popup'],
  methods: ['wallet_getSidePanelSupported', 'wallet_getSidePanelEnabled'],
  locked: true,
}

export const main = async ({
  rpcs: {wallet_getSidePanelSupported, wallet_getSidePanelEnabled},
}) => {
  const isEnabled = await wallet_getSidePanelEnabled()
  const isSupported = wallet_getSidePanelSupported()
  if (isEnabled) {
    if (isSupported) {
      await chrome.sidePanel.setPanelBehavior({
        openPanelOnActionClick: true,
      })
    }
  } else {
    if (isSupported) {
      await chrome.sidePanel.setPanelBehavior({
        openPanelOnActionClick: false,
      })
    }
  }
}
