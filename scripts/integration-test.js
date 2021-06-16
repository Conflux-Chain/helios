const {
  cfx, // , eth
} = require('@cfxjs/test-helpers')
const path = require('path')
const {spawn} = require('child_process')

async function cleanup(code) {
  console.log('exit code = ', code)
  return await Promise.all([
    cfx.quit(), // , eth.quit()
  ]).catch(() => {})
}

process.on('exit', cleanup)
process.on('SIGINT', cleanup)
process.on('SIGTERM', cleanup)
process.on('SIGUSR1', cleanup)
process.on('SIGUSR2', cleanup)

process.argv.push('--forceExit')
;(async () => {
  spawn('node', [path.resolve(__dirname, './start-ganache.js')])
  await Promise.all([
    cfx.start(),
    // , eth.start()
  ])

  require('jest-cli/bin/jest.js')
})()
