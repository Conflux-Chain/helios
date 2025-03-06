import {request} from '.'
import {WALLET_SET_SIDE_PANEL_ENABLED} from '../constants/rpcMethods'
import browser from 'webextension-polyfill'

export const isRunningInSidePanel = () => {
  return new URL(window.location.href).pathname === '/sidePanel.html'
}

export const toggleSidePanelMode = async (enabled, onRes) => {
  await request(WALLET_SET_SIDE_PANEL_ENABLED, {
    enabled,
  })
  onRes?.()

  if (enabled) {
    if (
      typeof chrome !== 'undefined' &&
      typeof chrome.sidePanel !== 'undefined'
    ) {
      const selfCloseId = Math.random() * 100000
      window.__self_id_for_closing_view_side_panel = selfCloseId
      const viewsBefore = browser.extension.getViews()

      try {
        const activeTabs = await browser.tabs.query({
          active: true,
          currentWindow: true,
        })
        if (activeTabs.length > 0) {
          const id = activeTabs[0].id
          if (id != null) {
            await chrome.sidePanel.open({
              tabId: id,
            })
          }
        }
      } catch (e) {
        console.log(e)
      } finally {
        for (const view of viewsBefore) {
          if (window.__self_id_for_closing_view_side_panel !== selfCloseId) {
            view.window.close()
          }
        }

        window.close()
      }
    } else {
      window.close()
    }
  } else {
    const selfCloseId = Math.random() * 100000
    window.__self_id_for_closing_view_side_panel = selfCloseId
    const views = browser.extension.getViews()

    for (const view of views) {
      if (window.__self_id_for_closing_view_side_panel !== selfCloseId) {
        view.window.close()
      }
    }

    window.close()
  }
}
