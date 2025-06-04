import browser from 'webextension-polyfill'

export const isManifestV3 = browser.runtime.getManifest().manifest_version === 3
export const isScriptingApiSupported =
  chrome &&
  typeof chrome.scripting !== 'undefined' &&
  typeof chrome.scripting.registerContentScripts === 'function'
