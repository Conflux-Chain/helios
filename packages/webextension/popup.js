import browser from 'webextension-polyfill'
import {isFunction} from '@fluent-wallet/checks'

// TODO, hardcode is not accurate, need to find more effective way
const POPUP_HEIGHT = 629
const POPUP_WIDTH = 372
let FOCUS_LISTENER = null
let REMOVED_LISTENER = null
let CURRENT_POPUP_ID = null

const focus = async wid => {
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
  } else {
    try {
      const w = await browser.windows.get(wid)
      if (w) {
        await browser.windows.update(wid, {focused: true})
      }
    } catch (err) {
      // can't find window with id `wid`
      if (FOCUS_LISTENER) {
        browser.windows.onFocusChanged.hasListener(FOCUS_LISTENER) &&
          browser.windows.onFocusChanged.removeListener(FOCUS_LISTENER)
        FOCUS_LISTENER = null
      }
    }
  }
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

const getPopup = async () => {
  if (!browser?.windows?.getAll) return
  const windows = await browser.windows.getAll()
  return windows
    ? windows.find(
        win => win && win.type === 'popup' && win.id === CURRENT_POPUP_ID,
      )
    : null
}

export const show = async (arg = {}) => {
  let {url, alwaysOnTop = false} = arg
  url = url || 'notification.html'
  if (!browser?.windows?.getAll) return
  let popup = await getPopup()
  if (popup) {
    try {
      // for some reason, chrome won't throw the error if popup is destroyed
      // so we add
      // 1. setTimeout
      // 2. browser.windows.get &&
      // to ensure the logic goes into catch
      await new Promise(resolve => setTimeout(resolve, 1))
      ;(await browser.windows.get(popup.id)) &&
        (await browser.windows.update(popup.id, {focused: true}))
      // eslint-disable-next-line no-empty
    } catch (err) {
      // popup got deleted
      if (popup.id !== (await getPopup()?.id)) {
        show(arg)
      }
    }
  } else {
    popup = await newPopup({url, alwaysOnTop})
    CURRENT_POPUP_ID = popup.id
  }
  return popup
}

export const removePopup = async () => {
  if (!browser?.windows?.getAll) return
  try {
    const popup = await getPopup()

    if (popup) {
      await remove(popup.id)
    }
    return true
  } catch (err) {} // eslint-disable-line no-empty
  return false
}

let ON_FOCUS_CHANGED = []
let ON_REMOVED = []

if (browser?.windows?.onFocusChanged) {
  browser.windows.onFocusChanged.addListener(id => {
    ON_FOCUS_CHANGED = ON_FOCUS_CHANGED.reduce((acc, f) => {
      try {
        const dontRemoveListener = f(id)
        if (dontRemoveListener) return acc.concat(f)
      } catch (err) {} // eslint-disable-line no-empty

      return acc
    }, [])
  })

  browser.windows.onRemoved.addListener(id => {
    if (CURRENT_POPUP_ID === id) {
      CURRENT_POPUP_ID = undefined
    }
    ON_REMOVED = ON_REMOVED.reduce((acc, f) => {
      try {
        const dontRemoveListener = f(id)
        if (dontRemoveListener === true) return acc.concat(f)
      } catch (err) {} // eslint-disable-line no-empty

      return acc
    }, [])
  })
}
export const onFocusChanged = (windowId, f) => {
  if (!isFunction(f)) throw new Error('Invalid callback, must be a function')
  ON_FOCUS_CHANGED.push(id => {
    if (windowId === id) {
      return f(id)
    }
    return true
  })
}

export const onRemoved = (windowId, f) => {
  if (!isFunction(f)) throw new Error('Invalid callback, must be a function')
  ON_REMOVED.push(id => {
    if (windowId === id) {
      try {
        return f(id)
        // eslint-disable-next-line no-empty
      } catch (err) {}
    }
    return true
  })
}

export const remove = (...args) => {
  try {
    return browser.windows?.remove(...args)
    // eslint-disable-next-line no-empty
  } catch (err) {}
}
