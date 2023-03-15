const webpack = require('webpack')
const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const WriteFilePlugin = require('write-file-webpack-plugin')
const env = require('./scripts/env')

const fileExtensions = [
  'jpg',
  'jpeg',
  'png',
  'gif',
  'eot',
  'otf',
  'svg',
  'ttf',
  'woff',
  'woff2',
]

const options = {
  mode: process.env.NODE_ENV || 'development',
  experiments: {
    topLevelAwait: true,
  },
  entry: {
    // popup: path.join(__dirname, "src", "popup.js"),
    popup: path.join(__dirname, 'src', 'popup', 'index.jsx'),
    // background: path.join(__dirname, "src", "background.js"),
    background: path.join(__dirname, 'src', 'background', 'index.js'),
    content: path.join(__dirname, 'src', 'content', 'index.js'),
    // content: path.join(__dirname, "src", "content.js"),
  },
  output: {
    globalObject: 'this',
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js',
  },
  module: {
    rules: [
      // {
      //     // look for .css or .scss files
      //     test: /\.(css|scss)$/,
      //     // in the `src` directory
      //     use: [
      //         {
      //             loader: 'style-loader',
      //         },
      //         {
      //             loader: 'css-loader',
      //         },
      //         {
      //             loader: 'sass-loader',
      //             options: {
      //                 sourceMap: true,
      //             },
      //         },
      //     ],
      // },
      // {
      //     test: new RegExp('.(' + fileExtensions.join('|') + ')$'),
      //     loader: 'file-loader?name=[name].[ext]',
      //     exclude: /node_modules/,
      // },
      {
        test: /\.html$/,
        loader: 'html-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(js|jsx)$/,
        loader: 'babel-loader',
        // options: {
        //   // presets: [
        //   //   '@babel/preset-env',
        //   //   ['@babel/preset-react', { runtime: 'automatic' }],
        //   // ],
        //   // plugins: [
        //   //   ['@babel/plugin-proposal-decorators', { legacy: true }],
        //   //   ['@babel/plugin-proposal-class-properties', { loose: true }],
        //   //   [
        //   //     '@babel/plugin-transform-runtime',
        //   //     {
        //   //       helpers: true,
        //   //       regenerator: true,
        //   //     },
        //   //   ],
        //   // ],
        // },
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: fileExtensions
      .map((extension) => `.${extension}`)
      .concat(['.jsx', '.js', '.css']),
  },
  plugins: [
    new webpack.ProgressPlugin(),
    // clean the build folder
    new CleanWebpackPlugin({
      verbose: true,
      cleanStaleWebpackAssets: false,
    }),
    // expose and write the allowed env vars on the compiled bundle
    new webpack.EnvironmentPlugin(['NODE_ENV']),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'src/manifest.json',
          to: path.join(__dirname, 'dist'),
          force: true,
          transform(content) {
            // generates the manifest file using the package.json information
            return Buffer.from(
              JSON.stringify(
                {
                  description: process.env.npm_package_description,
                  version: process.env.npm_package_version,
                  ...JSON.parse(content.toString()),
                },
                null,
                '\t'
              )
            )
          },
        },
        {
          from: 'src/background/background-wrapper.js',
          to: path.join(__dirname, 'dist'),
        },
        {
          from: 'src/pages',
          to: path.join(__dirname, 'dist', 'pages'),
        },
      ],
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src', 'pages', 'popup.html'),
      filename: 'popup.html',
      chunks: ['popup'],
    }),
    new WriteFilePlugin(),
  ],
}

if (env.NODE_ENV === 'development') {
  options.devtool = 'cheap-module-source-map'
}

module.exports = options
