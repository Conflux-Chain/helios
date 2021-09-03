import browser from 'webextension-polyfill'

const POPUP_HEIGHT = 620
const POPUP_WIDTH = 360
let FOCUS_LISTENER = null
let REMOVED_LISTENER = null

const focus = wid => {
  if (!FOCUS_LISTENER) {
    FOCUS_LISTENER = () => focus(wid)
    REMOVED_LISTENER = removedWId => {
      if (removedWId === wid) {
        browser.windows.onFocusChanged.hasListener(FOCUS_LISTENER) &&
          browser.windows.onFocusChanged.removeListener(FOCUS_LISTENER)
        FOCUS_LISTENER = null
        browser.windows.onRemoved.hasListener(REMOVED_LISTENER) &&
          browser.windows.onRemoved.removeListener(REMOVED_LISTENER)
        REMOVED_LISTENER = null
      }
    }

    browser.windows.onRemoved.addListener(REMOVED_LISTENER)
    browser.windows.onFocusChanged.addListener(FOCUS_LISTENER)
  }

  FOCUS_LISTENER &&
    browser.windows
      .get(wid)
      .then(browser.windows.update(wid, {focused: true}).catch(() => {}))
      .catch(() => {
        if (FOCUS_LISTENER) {
          browser.windows.onFocusChanged.hasListener(FOCUS_LISTENER) &&
            browser.windows.onFocusChanged.removeListener(FOCUS_LISTENER)
          FOCUS_LISTENER = null
        }
      })
}

const newPopup = async ({url, alwaysOnTop}) => {
  const lastFocused = await browser.windows
    .getLastFocused({windowTypes: ['normal']})
    .catch(() => {})

  const w = await browser.windows.create({
    type: 'popup',
    focused: true,
    url,
    width: POPUP_WIDTH,
    height: POPUP_HEIGHT,
    left: lastFocused?.left,
    top: lastFocused?.top,
  })

  alwaysOnTop && focus(w.id)

  return w
}

export const show = async ({url = 'popup.html', alwaysOnTop = false} = {}) => {
  let popup = (await browser.windows.getAll()).filter(
    w => w.type === 'popup',
  )?.[0]
  if (!popup) popup = await newPopup({url, alwaysOnTop})
  return popup
}
