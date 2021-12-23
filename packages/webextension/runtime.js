import browser from 'webextension-polyfill'

export function reload() {
  return browser.runtime.reload()
}
