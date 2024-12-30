import {optParam} from '@fluent-wallet/spec'
import {SIDE_PANEL_KEY} from '@fluent-wallet/consts'
import browser from 'webextension-polyfill'

export const NAME = 'wallet_getSidePanelEnabled'

const getSidePanel = () => browser.storage.local.get(SIDE_PANEL_KEY)

export const schemas = {
  input: optParam,
}

export const permissions = {
  external: ['popup'],
  methods: ['wallet_getSidePanelSupported'],
  locked: true,
}

export const main = async ({rpcs: {wallet_getSidePanelSupported}}) => {
  if (!wallet_getSidePanelSupported()) {
    return false
  }
  const res = await getSidePanel()
  return res ? !!res[SIDE_PANEL_KEY] : false
}
