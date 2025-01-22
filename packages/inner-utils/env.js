export const MODE = import.meta.env
  ? import.meta.env.NODE_ENV
  : process.env.NODE_ENV
export const IS_TEST_MODE = MODE === 'test'
export const IS_DEV_MODE = MODE === 'development'
export const IS_PROD_MODE = MODE === 'production'

export const PACKAGE_VERSION = process.env.PACKAGE_VERSION
// this version is use by view, it include the version suffix e.g v1.0.0.rc-1
export const VIEW_PACKAGE_VERSION =
  process.env.VIEW_PACKAGE_VERSION || PACKAGE_VERSION
