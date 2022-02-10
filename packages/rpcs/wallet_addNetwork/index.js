import {
  map,
  url,
  stringp,
  enums,
  or,
  dbid,
  hdPath,
  chainId,
  eq,
  plus,
  tokenSymbol,
} from '@fluent-wallet/spec'
import {DEFAULT_CFX_HDPATH, DEFAULT_ETH_HDPATH} from '@fluent-wallet/consts'

export const NAME = 'wallet_addNetwork'

const nativeCurrencySchema = [
  map,
  {closed: true, doc: 'Config of the native currency of the chain'},
  ['name', stringp],
  ['symbol', tokenSymbol],
  ['decimals', [eq, 18]],
  ['iconUrls', {optional: true}, [plus, url]],
]

export const ChainParameterSchema = [
  map,
  {
    closed: true,
    doc: 'Config of the chain to add, check it at https://docs.metamask.io/guide/rpc-api.html#wallet-addethereumchain',
  },
  ['chainId', chainId],
  ['chainName', stringp],
  ['nativeCurrency', nativeCurrencySchema],
  ['rpcUrls', [plus, url]],
  ['blockExplorerUrls', {optional: true}, [plus, url]],
  ['iconUrls', {optional: true}, [plus, url]],
  [
    'hdPath',
    {
      optional: true,
      doc: 'the hd path of this netowrk, default to the detected network type (cfx/eth), can be one of hd path dbid, hd path type "cfx"/"eth" or hd path value',
    },
    [or, [enums, 'cfx', 'eth'], dbid, hdPath],
  ],
]

export const schemas = {
  input: ChainParameterSchema,
}

export const permissions = {
  external: [],
  db: [
    't',
    'getNetwork',
    'getHdPathById',
    'getNetworkById',
    'getNetworkByName',
    'getNetworkByEndpoint',
    'getOneHdPath',
    'filterAccountGroupByNetworkType',
    'retractAttr',
  ],
  methods: [
    'wallet_addHdPath',
    'wallet_detectNetworkType',
    'wallet_discoverAccounts',
    'wallet_createAddress',
  ],
}

export const main = async ({
  Err: {InvalidParams},
  rpcs: {
    wallet_addHdPath,
    wallet_detectNetworkType,
    wallet_discoverAccounts,
    wallet_createAddress,
  },
  db: {
    t,
    retractAttr,
    getNetworkById,
    getHdPathById,
    getNetwork,
    getNetworkByName,
    getNetworkByEndpoint,
    getOneHdPath,
    filterAccountGroupByNetworkType,
  },
  networkName,
  network,
  params: {
    chainId,
    chainName: name,
    nativeCurrency: ticker,
    rpcUrls,
    blockExplorerUrls = [],
    iconUrls = [],
    hdPath,
  },
  // only when called from wallet_updateNetwork
  toUpdateNetwork,
}) => {
  const [url] = rpcUrls
  const [explorerUrl] = blockExplorerUrls
  const [iconUrl] = iconUrls

  // duplidate name
  const [dupNameNetwork] = getNetworkByName(name)
  if (
    (!toUpdateNetwork && dupNameNetwork) ||
    (dupNameNetwork &&
      toUpdateNetwork &&
      toUpdateNetwork.eid !== dupNameNetwork.eid)
  )
    throw InvalidParams('Duplicate network name')

  // duplicate rpc endpoint
  const [dupEndpointNetwork] = getNetworkByEndpoint(url)
  if (
    (!toUpdateNetwork && dupEndpointNetwork) ||
    (dupEndpointNetwork &&
      toUpdateNetwork &&
      toUpdateNetwork.eid !== dupEndpointNetwork?.eid)
  )
    throw InvalidParams(
      `Duplicate network endpoint with network ${dupEndpointNetwork.eid}`,
    )

  // invalid hdPath id
  if (Number.isInteger(hdPath) && !getHdPathById(hdPath))
    throw InvalidParams(`Invalid hdPath id ${hdPath}`)

  // chain id duplicate with builtin network
  const [dupChainIdBuiltInNetwork] = getNetwork({chainId, builtin: true})
  if (dupChainIdBuiltInNetwork)
    throw InvalidParams(`Duplicate chainId ${chainId} with builtin network`)

  // this returns menas the rpcurl is valid
  const {
    type: networkType,
    chainId: detectedChainId,
    netId,
  } = await wallet_detectNetworkType({url})

  if (chainId !== detectedChainId)
    throw InvalidParams(
      `Invalid chainId ${chainId}, got ${detectedChainId} from remote`,
    )

  hdPath = hdPath || networkType

  let hdPathId =
    (Number.isInteger(hdPath) && getHdPathById(hdPath).eid) ||
    (hdPath === 'cfx' && getOneHdPath({value: DEFAULT_CFX_HDPATH}).eid) ||
    (hdPath === 'eth' && getOneHdPath({value: DEFAULT_ETH_HDPATH}).eid) ||
    getOneHdPath({value: hdPath})?.eid ||
    'newHdPath'

  if (hdPathId === 'newHdPath') {
    hdPathId = await wallet_addHdPath({name: `${name}-hdPath`, value: hdPath})
  }

  const upsertResult = t([
    {
      eid: toUpdateNetwork?.eid || 'networkId',
      network: {
        isCustom: true,
        name,
        cacheTime: networkType === 'cfx' ? 1000 : 15000,
        endpoint: url,
        type: networkType,
        hdPath: hdPathId,
        chainId,
        netId: parseInt(netId, 10),
        ticker,
        builtin: false,
      },
    },
    explorerUrl && {
      eid: toUpdateNetwork?.eid || 'networkId',
      network: {scanUrl: explorerUrl},
    },
    iconUrl && {
      eid: toUpdateNetwork?.eid || 'networkId',
      network: {icon: iconUrl},
    },
  ])

  if (toUpdateNetwork?.eid && !explorerUrl) {
    retractAttr({eid: toUpdateNetwork.eid, attr: 'network/scanUrl'})
  }

  const groups = filterAccountGroupByNetworkType(networkType)

  if (!toUpdateNetwork) {
    // create new network address for each group
    await Promise.all(
      groups.map(({eid}) =>
        wallet_createAddress({
          accountGroupId: eid,
          networkId: upsertResult.tempids.networkId,
        }),
      ),
    )
  }

  let discoverAccounts = ({eid}) =>
    wallet_discoverAccounts({accountGroupId: eid})
  // current network name changed
  if (toUpdateNetwork?.eid === network.eid && name !== networkName) {
    discoverAccounts = ({eid}) =>
      wallet_discoverAccounts(
        {networkName: name, network: getNetworkById(network.eid)},
        {accountGroupId: eid},
      )
  }

  // discover new accounts for each hd group
  await Promise.all(
    groups.filter(({vault: {type}}) => type === 'hd').map(discoverAccounts),
  )

  return toUpdateNetwork?.eid || upsertResult.tempids.networkId
}
