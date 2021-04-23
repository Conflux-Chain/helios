const args = process.argv
const isDev = args.includes('start')
// const isBuild = args.includes('build')
const renderRpcTemplate = require('./scripts/render-rpc-template.js')
const {resolve} = require('path')

async function cleanup(exitCode) {
  console.log('Clanup before exit...')
  process.exit(exitCode)
}

process.on('exit', cleanup)
process.on('SIGINT', cleanup)
process.on('SIGTERM', cleanup)
process.on('SIGUSR1', cleanup)
process.on('SIGUSR2', cleanup)
process.on('uncaughtException', (...args) => console.error(...args))
;(async () => {
  await renderRpcTemplate()
  if (isDev) {
    const watcher = (
      await import('workspace-tools/rpc/watch.js')
    ).default(({name}) => renderRpcTemplate({onlyRerenderRpcName: name}))

    watcher.add(resolve(__dirname, 'docs/*.mustache'))
  }

  require('@docusaurus/core/bin/docusaurus.js')
})()
