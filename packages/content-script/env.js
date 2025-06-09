export const isScriptingApiSupported =
  chrome &&
  typeof chrome.scripting !== 'undefined' &&
  typeof chrome.scripting.registerContentScripts === 'function'
