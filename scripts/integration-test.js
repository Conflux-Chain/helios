const {
  cfx, // , eth
} = require('@cfxjs/test-helpers')

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
  await Promise.all([
    cfx.start(),
    // , eth.start()
  ])

  require('jest-cli/bin/jest.js')
})()
