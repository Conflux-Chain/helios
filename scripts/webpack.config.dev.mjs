import path from 'node:path'
import {merge} from 'webpack-merge'
import {defaultConfig, entries} from './webpack.config.cjs'
import Dotenv from 'dotenv-webpack'

const isFirefox = process.env.TARGET_BROWSER === 'firefox'

/**
 * firefox is not support the manifest v3 yet
 */
/**
 * @type {import('webpack').Configuration}
 */
const devConfig = {
  mode: 'development',
  devtool: 'inline-cheap-module-source-map',
  watch: true,
  output: isFirefox
    ? {
        chunkFormat: 'array-push',
      }
    : undefined,
  plugins: [
    new Dotenv({
      prefix: 'import.meta.env.',
      path: path.join(path.resolve(), './.env.development.local'),
    }),
  ],
}

devConfig.entry = isFirefox ? entries.v2 : entries.v3
/**
 * @type {import('webpack').Configuration}
 */
export default merge(defaultConfig, devConfig)
