import {map, url, stringp, enums, or, dbid, hdPath} from '@cfxjs/spec'
import {
  DEFAULT_CFX_HDPATH,
  DEFAULT_ETH_HDPATH,
} from '@cfxjs/fluent-wallet-consts'

export const NAME = 'wallet_addNetwork'

export const schemas = {
  input: [
    map,
    {closed: true},
    ['url', url],
    ['name', [stringp, {min: 3, max: 128}]],
    ['ticker', [stringp, {min: 2, max: 16}]],
    [
      'hdPath',
      {
        optional: true,
        doc: 'the hd path of this netowrk, default to the detected network type (cfx/eth), can be one of hd path dbid, hd path type "cfx"/"eth" or hd path value',
      },
      [or, [enums, 'cfx', 'eth'], dbid, hdPath],
    ],
  ],
}

export const permissions = {
  external: ['popup'],
  db: [
    't',
    'getHdPathById',
    'getNetworkByName',
    'getNetworkByEndpoint',
    'getOneHdPath',
    'filterAccountGroupByNetworkType',
  ],
  methods: [
    'wallet_addHdPath',
    'wallet_detectNetworkType',
    'wallet_discoverAccounts',
    'wallet_createAddress',
  ],
}

export const main = async ({
  Err: {InvalidParam},
  rpcs: {
    wallet_addHdPath,
    wallet_detectNetworkType,
    wallet_discoverAccounts,
    wallet_createAddress,
  },
  db: {
    t,
    getHdPathById,
    getNetworkByName,
    getNetworkByEndpoint,
    getOneHdPath,
    filterAccountGroupByNetworkType,
  },
  params: {url, name, ticker, hdPath},
}) => {
  const [dupNameNetwork] = getNetworkByName(name)
  if (dupNameNetwork) throw InvalidParam('Duplicate network name')
  const [dupEndpointNetwork] = getNetworkByEndpoint(url)
  if (dupEndpointNetwork)
    throw InvalidParam(
      `Duplicate network endpoint with network ${dupEndpointNetwork.eid}`,
    )
  if (Number.isInteger(hdPath) && !getHdPathById(hdPath))
    throw InvalidParam(`Invalid hdPath id ${hdPath}`)

  const {
    type: networkType,
    chainId,
    netId,
  } = await wallet_detectNetworkType({url})

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

  const {
    tempids: {networkId},
  } = t([
    {
      eid: 'networkId',
      network: {
        name,
        endpoint: url,
        type: networkType,
        hdPath: hdPathId,
        chainId,
        netId: parseInt(netId, 10),
        ticker,
        builtin: false,
      },
    },
  ])

  const groups = filterAccountGroupByNetworkType(networkType)

  await Promise.all(
    groups.map(({eid}) =>
      wallet_createAddress({accountGroupId: eid, networkId}),
    ),
  )

  await Promise.all(
    groups
      .filter(({vault: {type}}) => type === 'hd')
      .map(({eid}) => wallet_discoverAccounts({accountGroupId: eid})),
  )

  return networkId
}
