export const isScriptingApiSupported =
  window.chrome &&
  typeof chrome.scripting !== 'undefined' &&
  typeof chrome.scripting.registerContentScripts === 'function'
