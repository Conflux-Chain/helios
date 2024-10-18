const path = require('node:path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const {ProvidePlugin} = require('webpack')
const {ProgressPlugin} = require('webpack')
const {EsbuildPlugin} = require('esbuild-loader')
const packageJson = require('../package.json')
const packagesPath = path.join(path.resolve(), './packages')
const devMode = process.env.NODE_ENV !== 'production'

const targetBrowser = process.env.TARGET_BROWSER
/**
 * @type {import('webpack').Configuration}
 */
const defaultConfig = {
  entry: {
    'content-script': path.join(
      packagesPath,
      'content-script/indexTemplate.js', // TODO: remove and update
    ),
    popup: path.join(packagesPath, 'popup/src/index.js'),
    inpage: path.join(packagesPath, 'inpage/index.js'),
  },

  output: {
    path: path.join(path.resolve(), `./dist/${targetBrowser}`),
    filename: '[name].js',
    clean: true,
    assetModuleFilename: 'images/[name].[ext]',
    chunkFormat: false,
  },

  module: {
    rules: [
      {
        type: 'javascript/auto', // prevent webpack handling json with its own loaders,
        test: /manifestv?\d*\.json$/,
        use: {
          loader: 'wext-manifest-loader',
          options: {
            usePackageJSONVersion: true, // set to false to not use package.json version for manifest
          },
        },
        exclude: /node_modules/,
      },
      {
        test: /\.js$/,
        loader: 'esbuild-loader',
        exclude: /node_modules/,
        resolve: {
          fullySpecified: false, // disable the behaviour
        },
        options: {
          // JavaScript version to compile to
          target: 'esnext',
          loader: 'jsx',
        },
      },
      {
        test: /\.(jsx|ts|tsx)$/,
        loader: 'esbuild-loader',
        exclude: /node_modules/,
        resolve: {
          fullySpecified: false, // disable the behaviour
        },
        options: {
          // JavaScript version to compile to
          target: 'esnext',
        },
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'postcss-loader',
          },
        ],
      },
      {
        test: /\.svg$/,
        use: [
          '@svgr/webpack',
          {
            loader: 'url-loader',
            options: {
              limit: false,
              outputPath: 'images/',
            },
          },
        ],
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    fallback: {
      http: false,
      https: false,
      buffer: require.resolve('buffer/'),
      stream: require.resolve('stream-browserify'),
      process: 'process/browser', 
    },
    alias: {
      '/images': path.join(packagesPath, 'browser-extension/images'),
      "js-conflux-sdk": path.join(path.resolve(), './node_modules/js-conflux-sdk'),
    },
  },
  plugins: [
    new ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      React: 'react',
      process: 'process/browser.js',
    }),
    new EsbuildPlugin({
      define: {
        'process.env.NODE_DEBUG': JSON.stringify(
          process.env.NODE_DEBUG || false,
        ),
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
        'process.env.CI': JSON.stringify(process.env.CI || false),
        'process.env.SENTRY_DSN': JSON.stringify(
          process.env.SNOWPACK_PUBLIC_SENTRY_DSN || '',
        ),
        'process.env.PACKAGE_VERSION': JSON.stringify(packageJson.version),
      },
    }),
    // Plugin to not generate js bundle for manifest entry
    new HtmlWebpackPlugin({
      template: path.join(packagesPath, 'popup/public/template.html'),
      inject: 'body',
      chunks: ['popup'],
      hash: true,
      filename: 'popup.html',
      meta: {
        'popup-type': 'popup',
      },
    }),
    new HtmlWebpackPlugin({
      template: path.join(packagesPath, 'popup/public/template.html'),
      inject: 'body',
      chunks: ['popup'],
      hash: true,
      filename: 'popup.html',
      meta: {
        'popup-type': 'popup',
      },
    }),
    new HtmlWebpackPlugin({
      template: path.join(packagesPath, 'popup/public/template.html'),
      inject: 'body',
      chunks: ['popup'],
      hash: true,
      filename: 'notification.html',
      meta: {
        'popup-type': 'notification',
      },
    }),
    new HtmlWebpackPlugin({
      template: path.join(packagesPath, 'popup/public/template.html'),
      inject: 'body',
      chunks: ['popup'],
      hash: true,
      filename: 'page.html',
      meta: {
        'popup-type': 'big',
      },
    }),
    new ProgressPlugin({entries: true}),
    new CopyPlugin({
      patterns: [
        {
          from: path.join(packagesPath, 'browser-extension/_locales'),
          to: path.join(path.resolve(), `./dist/${targetBrowser}/_locales`),
        },
        {
          from: path.join(packagesPath, 'browser-extension/images/'),
          to: path.join(path.resolve(), `./dist/${targetBrowser}/images/`),
        },
      ],
    }),
  ],
}

const entries = {
  v2: {
    background: path.join(packagesPath, 'service-worker/index.ts'),
    manifest: path.join(packagesPath, 'manifest/manifestv2.json'),
  },
  v3: {
    service_worker: path.join(packagesPath, 'service-worker/index.ts'),
    manifest: path.join(packagesPath, 'manifest/manifestv3.json'),
  },
}

module.exports = {defaultConfig, entries}
