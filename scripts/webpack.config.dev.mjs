import path from 'node:path'
import {merge} from 'webpack-merge'
import webpackConfig from './webpack.config.cjs'
import Dotenv from 'dotenv-webpack'

/**
 * @type {import('webpack').Configuration}
 */
export default merge(webpackConfig, {
  mode: 'development',
  devtool: 'inline-source-map',
  watch: true,
  plugins: [
    new Dotenv({
      prefix: 'import.meta.env.',
      path: path.join(path.resolve(), './.env.development.local'),
    }),
  ],
})
