import {
  cat,
  map,
  stringp,
  or,
  ethHexAddress,
  base32UserAddress,
  dbid,
  validate,
} from '@fluent-wallet/spec'
import {personalSign} from '@fluent-wallet/signature'
import {decode} from '@fluent-wallet/base32-address'

export const NAME = 'personal_sign'

const innerSchema = [
  cat,
  [stringp, {doc: 'message string to sign'}],
  [or, ethHexAddress, base32UserAddress],
]

const publicSchema = [
  map,
  {closed: true},
  ['authReqId', dbid],
  ['data', innerSchema],
]

export const schemas = {
  input: [or, innerSchema, publicSchema],
}

export const permissions = {
  external: ['inpage', 'popup'],
  methods: [
    'wallet_addPendingUserAuthRequest',
    'wallet_userApprovedAuthRequest',
    'wallet_userRejectedAuthRequest',
    'wallet_getAddressPrivateKey',
  ],
  db: ['getAuthReqById', 'accountAddrByNetwork'],
  scope: {wallet_accounts: {}},
}

export const main = async ({
  Err: {InvalidParams, Unauthorized, UserRejected},
  db: {getAuthReqById, accountAddrByNetwork},
  rpcs: {
    wallet_getAddressPrivateKey,
    wallet_userApprovedAuthRequest,
    wallet_userRejectedAuthRequest,
    wallet_addPendingUserAuthRequest,
  },
  params,
  _inpage,
  _popup,
  app,
}) => {
  if (_inpage) {
    const type = app.currentNetwork.type
    const [, from] = params
    if (
      type === 'cfx' &&
      !validate(base32UserAddress, from, {netId: app.currentNetwork.netId})
    )
      throw InvalidParams(
        `Invalid from ${from} for the target network ${app.currentNetwork.name}`,
      )

    const addr = accountAddrByNetwork({
      account: app.currentAccount.eid,
      network: app.currentNetwork.eid,
    })

    if (type === 'cfx' && decode(from).hexAddress !== addr.cfxHex.toLowerCase())
      throw Unauthorized()
    if (type === 'eth' && from !== addr.hex) throw Unauthorized()
    if (addr.vault.type === 'pub') throw UserRejected()

    const req = {method: NAME, params}
    return await wallet_addPendingUserAuthRequest({appId: app.eid, req})
  }

  if (_popup) {
    const {
      authReqId,
      data: [message, from],
    } = params

    const authReq = getAuthReqById(authReqId)
    if (!authReq) throw InvalidParams(`Invalid auth req id ${authReqId}`)

    const type = authReq.app.currentNetwork.type
    const addr = accountAddrByNetwork({
      account: authReq.app.currentAccount.eid,
      network: authReq.app.currentNetwork.eid,
    })

    if (
      type === 'cfx' &&
      !validate(base32UserAddress, from, {
        netId: authReq.app.currentNetwork.netId,
      })
    )
      throw InvalidParams(
        `Invalid from ${from} for the target network ${authReq.app.currentNetwork.name}`,
      )

    if (addr.vault.type === 'pub')
      return wallet_userRejectedAuthRequest({authReqId})

    if (type === 'cfx' && decode(from).hexAddress !== addr.cfxHex.toLowerCase())
      return wallet_userRejectedAuthRequest({authReqId})

    if (type === 'eth' && from.toLowerCase() !== addr.hex.toLowerCase())
      return wallet_userRejectedAuthRequest({authReqId})

    const pk =
      addr.pk || (await wallet_getAddressPrivateKey({addressId: addr.eid}))
    const sig = await personalSign(type, pk, message)

    return await wallet_userApprovedAuthRequest({authReqId, res: sig})
  }
}
