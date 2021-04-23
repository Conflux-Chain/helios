const args = process.argv
const isDev = args.includes('start')
// const isBuild = args.includes('build')
const renderRpcTemplate = require('./scripts/render-rpc-template.js')
const {resolve} = require('path')

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
