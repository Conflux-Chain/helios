export const MODE = import.meta.env
  ? import.meta.env.NODE_ENV
  : process.env.NODE_ENV
export const IS_TEST_MODE = MODE === 'test'
export const IS_DEV_MODE = MODE === 'development'
export const IS_PROD_MODE = MODE === 'production'

export const PACKAGE_VERSION = process.env.PACKAGE_VERSION
