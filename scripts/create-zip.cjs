import {PACKAGE_VERSION} from '@fluent-wallet/inner-utils'

const {zip} = require('zip-a-folder')
const path = require('path')
const mkdirp = require('mkdirp')

const buildPath = path.resolve(__dirname, '../packages/browser-extension/build')
const targetPath = path.resolve(__dirname, '../releases')
const targetFile = path.resolve(
  targetPath,
  `fluent-wallet-${PACKAGE_VERSION || 'na_version'}-${
    process.env.GITHUB_SHA || 'na_sha'
  }.zip`,
)

;(async function () {
  await mkdirp(targetPath)
  await zip(buildPath, targetFile)
})()
