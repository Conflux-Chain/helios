import browser from 'webextension-polyfill'

const DETECTION_INTERVAL = 15

browser?.idle?.setDetectionInterval(DETECTION_INTERVAL)

export const query = () => {
  return browser.idle.queryState(DETECTION_INTERVAL)
}

export const isLocked = async () => {
  return (await query()) === 'locked'
}

export const isIdle = async () => {
  return (await query()) === 'idle'
}

// NOTE: firefox don't support locked right now
export const listen = f => {
  const listener = s => s?.newState && s?.newState !== 'active' && f(s.newState)
  browser.idle.onStateChanged.addListener(listener)
  return
}
