const {resolve} = require('path')
const {render} = require('mustache')
const {readFileSync, promises} = require('fs')

const providerRpcTemplate = resolve(
  __dirname,
  '../docs/provider-rpc.mdx.mustache',
)
const standardRpcTemplate = resolve(
  __dirname,
  '../docs/standard-rpc.mdx.mustache',
)
const innerRpcTemplate = resolve(__dirname, '../docs/inner-rpc.mdx.mustache')
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
      if (
        // rpc?.module?.NAME?.startsWith?.('eth_') ||
        // rpc?.module?.NAME?.includes?.('Ethereum') ||
        rpc?.module?.NAME?.includes?.('wallet_getNextNonce')
      )
        return
      // eslint-disable-next-line testing-library/render-result-naming-convention
      const oneRpcContent = renderOneRpc(rpcInfoToRenderParam(rpc))
      cache[rpc.name] = {content: oneRpcContent, doc: rpc.doc}
    })
  }

  const [providerRpcContent, standardRpcContent, innerRpcContent] =
    Object.values(cache).reduce(
      ([p, s, i], {content, doc}) => {
        if (doc?.metadata?.standard) s += content + '\n\n'
        else if (doc?.metadata?.provider) p += content + '\n\n'
        else i += content + '\n\n'
        return [p, s, i]
      },
      ['', '', ''],
    )

  await Promise.all([
    promises.writeFile(
      resolve(__dirname, '../docs/provider-rpc.mdx'),
      render(readFileSync(providerRpcTemplate, {encoding: 'utf-8'}), {
        content: providerRpcContent + '\n\n',
      }),
    ),
    promises.writeFile(
      resolve(__dirname, '../docs/standard-rpc.mdx'),
      render(readFileSync(standardRpcTemplate, {encoding: 'utf-8'}), {
        content: standardRpcContent + '\n\n',
      }),
    ),
    promises.writeFile(
      resolve(__dirname, '../docs/inner-rpc.mdx'),
      render(readFileSync(innerRpcTemplate, {encoding: 'utf-8'}), {
        content: innerRpcContent + '\n\n',
      }),
    ),
  ])
}
