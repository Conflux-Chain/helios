import {or, cat, map, chainId, dbid} from '@fluent-wallet/spec'

export const NAME = 'wallet_switchEthereumChain'

const publicSchema = [cat, [map, {closed: true}, ['chainId', chainId]]]
const innerSchema = [
  map,
  {closed: true},
  ['authReqId', dbid],
  ['chainConfig', publicSchema],
]

export const schemas = {
  input: [or, publicSchema, innerSchema],
}

export const permissions = {
  external: ['inpage', 'popup'],
  // TODO: use setAppCurrentNetwork in v2
  methods: [
    'wallet_setCurrentNetwork',
    'wallet_addPendingUserAuthRequest',
    'wallet_userApprovedAuthRequest',
    'wallet_userRejectedAuthRequest',
  ],
  db: ['getNetwork', 'getAuthReqById'],
  scope: {wallet_networks: {}},
}

export const generateMain =
  type =>
  async ({
    Err: {InvalidParams, UnrecognizedChainId},
    db: {getNetwork, getAuthReqById},
    rpcs: {
      wallet_setCurrentNetwork,
      wallet_addPendingUserAuthRequest,
      wallet_userApprovedAuthRequest,
      wallet_userRejectedAuthRequest,
    },
    params,
    app,
    _popup,
    _inpage,
    network: currentNetwork,
  }) => {
    const {chainId} = Array.isArray(params) ? params[0] : params.chainConfig[0]
    if (currentNetwork.type === type && currentNetwork.chainId === chainId)
      return '__null__'
    const [network] = getNetwork({chainId, type: type}) || []
    if (!network)
      throw UnrecognizedChainId(
        `Unrecognized chain ID "${chainId}". Try adding the chain using ${
          type === 'eth' ? 'wallet_addEthereumChain' : 'wallet_addConfluxChain'
        } first.`,
      )

    if (_inpage) {
      return await wallet_addPendingUserAuthRequest({
        appId: app.eid,
        req: {
          method: type === 'cfx' ? 'wallet_switchConfluxChain' : NAME,
          params,
        },
      })
    }

    if (_popup) {
      const {authReqId} = params
      const authReq = getAuthReqById(authReqId)
      if (!authReq) throw InvalidParams(`Invalid auth req id ${authReqId}`)
      const rst = await wallet_setCurrentNetwork({app: authReq.app}, [
        network.eid,
      ])
      if (rst?.error) return await wallet_userRejectedAuthRequest({authReqId})
      return await wallet_userApprovedAuthRequest({authReqId, res: '__null__'})
    }
  }

export const main = generateMain('eth')
