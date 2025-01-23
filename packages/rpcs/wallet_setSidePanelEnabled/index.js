import {map, boolean} from '@fluent-wallet/spec'
import {SIDE_PANEL_KEY} from '@fluent-wallet/consts'

export const NAME = 'wallet_setSidePanelEnabled'

const setSidePanel = async enabled => {
  const browser = (await import('webextension-polyfill')).default
  return browser.storage.local.set({[SIDE_PANEL_KEY]: enabled})
}

export const schemas = {
  input: [map, {closed: true}, ['enabled', boolean]],
}

export const permissions = {
  external: ['popup'],
  methods: ['wallet_getSidePanelSupported', 'wallet_setSidePanelBehavior'],
  locked: true,
}

export const main = async ({
  params,
  rpcs: {wallet_getSidePanelSupported, wallet_setSidePanelBehavior},
}) => {
  if (!(await wallet_getSidePanelSupported())) {
    throw new Error('Side panel is not supported')
  }
  await setSidePanel(params.enabled)
  await wallet_setSidePanelBehavior()
}
