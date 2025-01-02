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
  const isSupported = await wallet_getSidePanelSupported()
  if (!isSupported) return
  const isEnabled = await wallet_getSidePanelEnabled()
  await chrome.sidePanel.setPanelBehavior({
    openPanelOnActionClick: isEnabled,
  })
}
