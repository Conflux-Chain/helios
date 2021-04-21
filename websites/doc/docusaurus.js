const args = process.argv
const isDev = args.includes('start')
// const isBuild = args.includes('build')
const renderRpcTemplate = require('./scripts/render-rpc-template.js')

;(async () => {
  await renderRpcTemplate()
  if (isDev) {
    ;(await import('workspace-tools/rpc/watch.js')).default(({name}) =>
      renderRpcTemplate({onlyRerenderRpcName: name}),
    )
  }

  require('@docusaurus/core/bin/docusaurus.js')
})()
