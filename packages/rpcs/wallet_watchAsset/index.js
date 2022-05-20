import {
  map,
  enums,
  base32ContractAddress,
  ethHexAddress,
  tokenSymbol,
  posInt,
  or,
  dbid,
  url,
} from '@fluent-wallet/spec'

export const NAME = 'wallet_watchAsset'

const publicSchema = [
  map,
  {closed: true},
  ['type', [enums, 'ERC20', 'CRC20']],
  [
    'options',
    [
      map,
      ['address', [or, base32ContractAddress, ethHexAddress]],
      ['symbol', tokenSymbol],
      ['decimals', [posInt, {max: 255}]],
      ['image', {optional: true}, url],
    ],
  ],
]

const internalSchema = [
  map,
  {closed: true},
  ['authReqId', dbid],
  ['asset', publicSchema],
]

const tokenIdSchema = [map, {closed: true}, ['tokenId', dbid]]

export const schemas = {
  input: [or, publicSchema, internalSchema, tokenIdSchema],
}

export const permissions = {
  external: ['popup', 'inpage'],
  methods: [
    'wallet_addPendingUserAuthRequest',
    'wallet_userApprovedAuthRequest',
    'wallet_validate20Token',
  ],
  db: [
    'getAuthReqById',
    'getCurrentAddr',
    'addTokenToAddr',
    'findAddress',
    'findToken',
  ],
}

export const main = async ({
  Err: {InvalidParams},
  db: {getAuthReqById, addTokenToAddr, getCurrentAddr, findAddress, findToken},
  rpcs: {
    wallet_addPendingUserAuthRequest,
    wallet_userApprovedAuthRequest,
    wallet_validate20Token,
  },
  app,
  params,
  _popup,
  network,
}) => {
  if (params?.tokenId && _popup) {
    const token = findToken({
      tokenId: params.tokenId,
      g: {
        name: 1,
        symbol: 1,
        address: 1,
        decimals: 1,
        logoURI: 1,
        network: {eid: 1},
      },
    })

    if (!token || token.network.eid !== network.eid)
      throw InvalidParams(`Invalid token id ${params.tokenId}`)

    const curAddr = getCurrentAddr()
    addTokenToAddr({
      name: token.name,
      symbol: token.symbol,
      address: token.address,
      decimals: token.decimals,
      image: token.logoURI,
      network: network.eid,
      targetAddressId: curAddr.eid,
      fromUser: true,
    })
    return true
  }
  if (params?.type) {
    const {address} = params.options
    const {name, symbol, decimals, valid} = await wallet_validate20Token({
      ...params.options,
      tokenAddress: address,
    })
    if (!valid) throw InvalidParams('Invalid token')

    if (_popup) {
      const curAddr = getCurrentAddr()
      addTokenToAddr({
        ...params.options,
        name,
        symbol,
        address,
        decimals,
        network: network.eid,
        targetAddressId: curAddr.eid,
        fromUser: true,
      })

      return true
    }

    // from dapp
    const curAddr = findAddress({appId: app.eid})
    const {alreadyInAddr} = addTokenToAddr({
      ...params.options,
      network: app.currentNetwork.eid,
      targetAddressId: curAddr,
      checkOnly: true,
    })
    if (alreadyInAddr) return true

    return await wallet_addPendingUserAuthRequest({
      appId: app.eid,
      req: {
        method: NAME,
        params: {
          ...params,
          options: {...params.options, name, symbol, decimals},
        },
      },
    })
  }

  if (params.authReqId) {
    const authReq = getAuthReqById(params.authReqId)
    if (!authReq) throw InvalidParams(`Invalid auth req id ${params.authReqId}`)
    if (authReq.processed)
      throw InvalidParams(`Already processing auth req ${params.authReqId}`)
    const authedApp = authReq.app
    const addr = findAddress({appId: authedApp.eid})
    addTokenToAddr({
      ...authReq.req.params.options,
      network: authedApp.currentNetwork.eid,
      targetAddressId: addr,
      fromApp: true,
    })

    return await wallet_userApprovedAuthRequest({
      authReqId: params.authReqId,
      res: true,
    })
  }
}
