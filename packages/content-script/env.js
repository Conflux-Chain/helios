export const isManifestV3 =
  window.chrome?.runtime?.getManifest()?.manifest_version === 3
