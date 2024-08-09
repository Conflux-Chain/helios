import browser from 'webextension-polyfill'
import packageJson from '../../package.json'

export const MODE = import.meta.env.NODE_ENV
export const IS_TEST_MODE = MODE === 'test'
export const IS_DEV_MODE = MODE === 'development'
export const IS_PROD_MODE = MODE === 'production'
export const IS_CI = Boolean(
  typeof import.meta.env.CI === 'string'
    ? import.meta.env.CI === 'true'
    : import.meta.env.CI,
)

export const PACKAGE_VERSION = packageJson.version

export const isManifestV3 = browser.runtime.getManifest().manifest_version === 3
