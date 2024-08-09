import path from 'node:path'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import webpackConfig from './webpack.config.cjs'
import Dotenv from 'dotenv-webpack'
import {merge} from 'webpack-merge'
import {EsbuildPlugin} from 'esbuild-loader'
import {BundleAnalyzerPlugin} from 'webpack-bundle-analyzer'

/**
 * @type {import('webpack').Configuration}
 */
export default merge(webpackConfig, {
  mode: 'production',
  devtool: false,
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
    minimizer: [
      new EsbuildPlugin({
        target: 'esnext', // Syntax to transpile to (see options below for possible values)
      }),
    ],
  },
})
