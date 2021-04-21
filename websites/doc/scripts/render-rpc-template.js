const {resolve} = require('path')
const {render} = require('mustache')
const {readFileSync, writeFileSync} = require('fs')

const rpcTemplate = resolve(__dirname, '../docs/rpc.mdx.mustache')
const oneRpcTemplate = resolve(__dirname, '../docs/one-rpc.mdx.mustache')

let getAllRpcs, parseRpcPackage, rpcNameToDir

const cache = {}

function rpcInfoToRenderParam({name, packageJSON, paramDoc, doc}) {
  return {
    name,
    doc: doc.en,
    hasInputParam: Boolean(paramDoc.input),
    hasOutputParam: Boolean(paramDoc.output),
    inputParams: paramDoc.input
      ? JSON.stringify(paramDoc.input, null, 2)
      : '{}',
    outputParams: paramDoc.output
      ? JSON.stringify(paramDoc.output, null, 2)
      : '{}',
    sourceURL: `https://github.com/Conflux-Chain/helios/tree/dev/packages/rpcs/${name}`,
    npmUrl: packageJSON.private
      ? null
      : `https://npmjs.com/package/${packageJSON.name}`,
  }
}

function renderOneRpc(param) {
  return render(readFileSync(oneRpcTemplate, {encoding: 'utf-8'}), param)
}

module.exports = async function ({onlyRerenderRpcName} = {}) {
  const shouldRenderAllRpc =
    Object.keys(cache).length === 0 || !onlyRerenderRpcName

  if (!shouldRenderAllRpc) {
    parseRpcPackage =
      parseRpcPackage ||
      (await import('workspace-tools/rpc/parse-package.js')).default
    rpcNameToDir =
      rpcNameToDir ||
      (await import('workspace-tools/rpc/name-to-dir.js')).default

    cache[onlyRerenderRpcName] = renderOneRpc(
      rpcInfoToRenderParam(
        await parseRpcPackage(rpcNameToDir(onlyRerenderRpcName)),
      ),
    )
  } else {
    getAllRpcs =
      getAllRpcs || (await import('workspace-tools/rpc/get-all.js')).default
    const rpcs = await getAllRpcs()
    rpcs.forEach(rpc => {
      // eslint-disable-next-line testing-library/render-result-naming-convention
      const oneRpcContent = renderOneRpc(rpcInfoToRenderParam(rpc))
      cache[rpc.name] = oneRpcContent
    })
  }

  const content = Object.values(cache).join('\n\n')

  writeFileSync(
    resolve(__dirname, '../docs/rpc.mdx'),
    render(readFileSync(rpcTemplate, {encoding: 'utf-8'}), {
      content: content + '\n\n',
    }),
  )
}
