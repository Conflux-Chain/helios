const isDev = process.argv.includes('start')
const renderRpcTemplate = require('./scripts/render-rpc-template.js')
const {resolve} = require('path')

async function main() {
  await renderRpcTemplate()
  if (isDev) {
    const watcher = (await import('workspace-tools/rpc/watch.js')).default(
      ({name}) => renderRpcTemplate({onlyRerenderRpcName: name}),
    )

    watcher.add(resolve(__dirname, 'docs/*.mustache'))
  }

  await import('@docusaurus/core/bin/docusaurus.mjs')
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
