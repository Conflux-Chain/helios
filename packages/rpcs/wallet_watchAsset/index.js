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
      {closed: true},
      ['address', [or, base32ContractAddress, ethHexAddress]],
      ['symbol', tokenSymbol],
      ['decimals', [posInt, {max: 255}]],
      ['image', url],
    ],
  ],
]

const internalSchema = [
  map,
  {closed: true},
  ['authReqId', dbid],
  ['asset', publicSchema],
]

export const schemas = {
  input: [or, publicSchema, internalSchema],
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
    'accountAddrByNetwork',
    'getCurrentAddr',
    'addTokenToAddr',
  ],
}

export const main = async ({
  Err: {InvalidParams},
  db: {getAuthReqById, accountAddrByNetwork, addTokenToAddr, getCurrentAddr},
  rpcs: {
    wallet_addPendingUserAuthRequest,
    wallet_userApprovedAuthRequest,
    wallet_validate20Token,
  },
  app,
  params,
  _popup,
}) => {
  if (params?.type) {
    const {name, symbol, address, decimals} = params.options
    const {valid} = await wallet_validate20Token({
      name,
      symbol,
      tokenAddress: address,
      decimals,
    })
    if (!valid) throw InvalidParams('Invalid token')

    if (_popup) {
      const curAddr = getCurrentAddr()
      addTokenToAddr({
        ...params.options,
        targetAddressId: curAddr.eid,
        fromUser: true,
      })

      return true
    }

    // from dapp
    const curAddr = accountAddrByNetwork({
      network: app.currentNetwork.eid,
      account: app.currentAccount.eid,
    })
    const {alreadyInAddr} = addTokenToAddr({
      ...params.options,
      targetAddressId: curAddr.eid,
      checkOnly: true,
    })
    if (alreadyInAddr) return true

    return await wallet_addPendingUserAuthRequest({
      appId: app.eid,
      req: {method: NAME, params},
    })
  }

  if (params.authReqId) {
    const authReq = getAuthReqById(params.authReqId)
    if (!authReq) throw InvalidParams(`Invalid auth req id ${params.authReqId}`)
    const authedApp = authReq.app
    const addr = accountAddrByNetwork({
      network: authedApp.currentNetwork.eid,
      account: authedApp.currentAccount.eid,
    })
    addTokenToAddr({
      ...authReq.req.params.options,
      targetAddressId: addr.eid,
      fromApp: true,
    })

    return await wallet_userApprovedAuthRequest({
      authReqId: params.authReqId,
      res: true,
    })
  }
}
