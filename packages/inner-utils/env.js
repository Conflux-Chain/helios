import browser from 'webextension-polyfill'

export const MODE = import.meta.env.NODE_ENV
export const IS_TEST_MODE = MODE === 'test'
export const IS_DEV_MODE = MODE === 'development'
export const IS_PROD_MODE = MODE === 'production'
export const IS_CI = Boolean(import.meta.env.CI)

export const isManifestV3 = browser.runtime.getManifest().manifest_version === 3
