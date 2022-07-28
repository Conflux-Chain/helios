import {cat, map, or, dbid, any, zeroOrMore} from '@fluent-wallet/spec'
import {
  ChainParameterSchema,
  firstHttpOrHttpsUrl,
} from '@fluent-wallet/wallet_add-network'

export const NAME = 'wallet_addEthereumChain'

const PublicSchema = [cat, ChainParameterSchema, [zeroOrMore, any]]
const InnerSchema = [
  map,
  {closed: true},
  ['authReqId', dbid],
  ['newChainConfig', PublicSchema],
]
export const schemas = {
  input: [or, PublicSchema, InnerSchema],
}

export const permissions = {
  external: ['inpage', 'popup'],
  methods: [
    'wallet_detectNetworkType',
    'wallet_addNetwork',
    'wallet_addPendingUserAuthRequest',
    'wallet_userApprovedAuthRequest',
    'wallet_userRejectedAuthRequest',
  ],
  db: ['getNetwork', 'getAuthReqById', 'getNetworkByEndpoint'],
  scope: null, // allowed to be called before connecting to dapp
}

export const main = async ({
  Err: {InvalidParams},
  db: {getAuthReqById, getNetworkByEndpoint, getNetwork},
  rpcs: {
    wallet_detectNetworkType,
    wallet_addNetwork,
    wallet_addPendingUserAuthRequest,
    wallet_userApprovedAuthRequest,
    wallet_userRejectedAuthRequest,
  },
  site,
  app,
  params,
  _popup,
  _inpage,
}) => {
  const chainConf = Array.isArray(params) ? params[0] : params.newChainConfig[0]
  const {chainId, rpcUrls} = chainConf
  const rpcUrl = firstHttpOrHttpsUrl(rpcUrls)
  const [dupEndpointNetwork] = getNetworkByEndpoint(rpcUrl)
  if (dupEndpointNetwork)
    throw InvalidParams(
      `Duplicate network endpoint with network ${dupEndpointNetwork.eid}`,
    )

  const {chainId: detectedChainId, type: detectedNetworkType} =
    await wallet_detectNetworkType({url: rpcUrl})
  if (chainId !== detectedChainId)
    throw InvalidParams(
      `Invalid chainId ${chainId}, got ${detectedChainId} from remote`,
    )

  const [dupChainIdBuiltInNetwork] = getNetwork({
    chainId,
    builtin: true,
    type: detectedNetworkType,
  })
  if (dupChainIdBuiltInNetwork)
    throw InvalidParams(`Duplicate chainId ${chainId} with builtin network`)

  if (_inpage) {
    const req = {method: NAME, params}
    const authReqParams = {req}
    if (app) authReqParams.appId = app.eid
    else authReqParams.siteId = site.eid
    return await wallet_addPendingUserAuthRequest(authReqParams)
  }

  // add network from popup
  if (_popup && Array.isArray(params)) {
    await wallet_addNetwork(params[0])
    return '__null__'
  }

  if (_popup) {
    const {authReqId} = params
    if (!authReqId) throw InvalidParams(`Invalid auth req id ${authReqId}`)
    const authReq = getAuthReqById(authReqId)
    if (!authReq) throw InvalidParams(`Invalid auth req id ${authReqId}`)
    if (authReq.processed)
      throw InvalidParams(`Already processing auth req ${authReqId}`)
    const rst = await wallet_addNetwork(chainConf)
    if (rst?.error) return await wallet_userRejectedAuthRequest({authReqId})
    return await wallet_userApprovedAuthRequest({authReqId, res: '__null__'})
  }
}
