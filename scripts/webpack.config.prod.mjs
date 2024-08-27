import path from 'node:path'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import {defaultConfig, entries} from './webpack.config.cjs'
import Dotenv from 'dotenv-webpack'
import {merge} from 'webpack-merge'
import {EsbuildPlugin} from 'esbuild-loader'
import {BundleAnalyzerPlugin} from 'webpack-bundle-analyzer'

const isFirefox = process.env.TARGET_BROWSER === 'firefox'
/**
 * @type {import('webpack').Configuration}
 */
const prodConfig = {
  mode: 'production',
  devtool: false,
  performance: {
    maxEntrypointSize: 2500000,
    maxAssetSize: 2500000,
  },
  output: isFirefox
    ? {
        chunkFormat: 'array-push',
      }
    : undefined,
  plugins: [
    new MiniCssExtractPlugin(),
    new Dotenv({
      prefix: 'import.meta.env.',
      path: path.join(path.resolve(), './.env'),
      safe: true,
    }),
    // new BundleAnalyzerPlugin(),
  ],
  optimization: {
    minimize: true,
    minimizer: [
      new EsbuildPlugin({
        target: 'esnext', // Syntax to transpile to (see options below for possible values)
      }),
    ],
  },
}

prodConfig.entry = isFirefox ? entries.v2 : entries.v3
/**
 * @type {import('webpack').Configuration}
 */
export default merge(defaultConfig, prodConfig)
