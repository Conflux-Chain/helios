import * as spec from '@fluent-wallet/spec'
import getTypedDataSpec from '@fluent-wallet/typed-data-spec'
import {signTypedData_v4, hashTypedData} from '@fluent-wallet/signature'
import {decode} from '@fluent-wallet/base32-address'

const {map, dbid, or} = spec

function validateAndFormatTypedDataString({
  type,
  typedDataString,
  spec,
  InvalidParams,
}) {
  let typedData
  try {
    typedData = JSON.parse(typedDataString)
  } catch (err) {
    throw InvalidParams("Invalid typed data, can't parse with JSON.parse")
  }

  if (!spec.validate(typedDataSpec, typedData)) {
    throw InvalidParams(
      `Invalid typed data\n${JSON.stringify(
        spec.explain(typedDataSpec, typedData),
      )}`,
    )
  }

  try {
    hashTypedData(type, typedData)
  } catch (err) {
    throw InvalidParams(`Error hashing typed data:\n${err.message}`)
  }

  return typedData
}

const {catn, ethHexAddress, base32UserAddress, stringp} = spec
const typedDataSpec = getTypedDataSpec('eth', spec)

export const gen = {
  schemas: type => {
    const publicSchema = [
      catn,
      ['from', type === 'cfx' ? base32UserAddress : ethHexAddress],
      ['typedDataString', stringp],
    ]
    const innerSchema = [
      map,
      {closed: true},
      ['authReqId', dbid],
      ['data', publicSchema],
    ]

    return {
      input: [or, publicSchema, innerSchema],
    }
  },
  main:
    type =>
    async ({
      Err: {InvalidParams, Unauthorized, UserRejected},
      db: {getAuthReqById, accountAddrByNetwork},
      rpcs: {
        wallet_getAddressPrivateKey,
        wallet_addPendingUserAuthRequest,
        wallet_userApprovedAuthRequest,
        wallet_userRejectedAuthRequest,
      },
      app,
      params,
      _inpage,
      _popup,
    }) => {
      if (_inpage) {
        const [from, typedDataString] = params

        const addr = accountAddrByNetwork({
          account: app.currentAccount.eid,
          network: app.currentNetwork.eid,
        })

        if (type === 'cfx' && from.toLowerCase() !== addr.cfxHex.toLowerCase())
          throw Unauthorized()
        if (type === 'eth' && from.toLowerCase() !== addr.hex.toLowerCase())
          throw Unauthorized()

        validateAndFormatTypedDataString({
          type,
          typedDataString,
          spec,
          InvalidParams,
        })

        if (addr.vault.type === 'pub') throw UserRejected()

        const req = {method: NAME, params}
        return wallet_addPendingUserAuthRequest({appId: app.eid, req})
      }

      if (_popup) {
        const {
          authReqId,
          data: [from, typedDataString],
        } = params

        const authReq = getAuthReqById(authReqId)
        if (!authReq) throw InvalidParams(`Invalid auth req id ${authReqId}`)

        const addr = accountAddrByNetwork({
          account: authReq.app.currentAccount.eid,
          network: authReq.app.currentNetwork.eid,
        })

        if (addr.vault.type === 'pub')
          return wallet_userRejectedAuthRequest({authReqId})

        if (
          type === 'cfx' &&
          decode(from).hexAddress !== addr.cfxHex.toLowerCase()
        )
          return wallet_userRejectedAuthRequest({authReqId})
        if (type === 'eth' && from.toLowerCase() !== addr.hex.toLowerCase())
          return wallet_userRejectedAuthRequest({authReqId})

        const typedData = validateAndFormatTypedDataString({
          type,
          typedDataString,
          spec,
          InvalidParams,
        })

        const pk =
          addr.pk || (await wallet_getAddressPrivateKey({addressId: addr.eid}))

        const sig = await signTypedData_v4(type, pk, typedData)

        return await wallet_userApprovedAuthRequest({authReqId, res: sig})
      }
    },
}

export const NAME = 'cfx_signTypedData_v4'

export const schemas = gen.schemas('cfx')

export const permissions = {
  external: ['inpage', 'popup'],
  db: ['getAuthReqById', 'accountAddrByNetwork'],
  methods: [
    'wallet_getAddressPrivateKey',
    'wallet_addPendingUserAuthRequest',
    'wallet_userApprovedAuthRequest',
    'wallet_userRejectedAuthRequest',
  ],
  scope: {wallet_accounts: {}},
}

export const main = gen.main('cfx')
