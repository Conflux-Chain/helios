#!/usr/bin/env node
'use strict'
const {cli} = require('@yqrashawn/snowpack')
const {setEnvBasedOnArgv} = require('./snowpack.utils')
const setupDotenv = require('./setup-dotenv.js')
setupDotenv()

setEnvBasedOnArgv()

cli(process.argv).catch(function (error) {
  console.error(`
${error.stack || error.message || error}
`)
  process.exit(1)
})
