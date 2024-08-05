const path = require('node:path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const WextManifestWebpackPlugin = require('wext-manifest-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const {ProvidePlugin} = require('webpack')
const {ProgressPlugin} = require('webpack')
const {EsbuildPlugin} = require('esbuild-loader')
const packagesPath = path.join(path.resolve(), './packages')
const devMode = process.env.NODE_ENV !== 'production'


const targetBrowser = process.env.TARGET_BROWSER
/**
 * @type {import('webpack').Configuration}
 */
module.exports = {
  entry: {
    background: path.join(packagesPath, 'background/src/index.js'),
    'content-script': path.join(
      packagesPath,
      'content-script/indexTemplate.js', // TODO: remove and update
    ),
    manifest: path.join(packagesPath, 'manifest/manifestv2.json'),
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
        test: /manifestv2\.json$/,
        use: {
          loader: 'wext-manifest-loader',
          options: {
            usePackageJSONVersion: true, // set to false to not use package.json version for manifest
          },
        },
        exclude: /node_modules/,
      },
      {
        test: /\.(js|ts)x?$/,
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
    },
    alias: {
      '/images': path.join(packagesPath, 'browser-extension/images'),
    },
  },
  plugins: [
    new ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      React: 'react',
    }),
    new EsbuildPlugin({
      define: {
        'process.env.NODE_DEBUG': JSON.stringify(
          process.env.NODE_DEBUG || false,
        ),
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
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
