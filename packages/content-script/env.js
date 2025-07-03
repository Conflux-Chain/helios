export const isScriptingApiSupported =
  window.chrome?.runtime?.getManifest()?.manifest_version === 3
