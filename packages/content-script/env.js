export const isScriptingApiSupported =
  chrome?.runtime?.getManifest()?.manifest_version === 3
