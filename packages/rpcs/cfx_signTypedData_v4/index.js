import * as spec from '@fluent-wallet/spec'
import {encode} from '@fluent-wallet/base32-address'
import getTypedDataSpec from '@fluent-wallet/typed-data-spec'
import {
  signTypedData_v4,
  hashTypedData,
  getLedgerTypedDataPayload,
} from '@fluent-wallet/signature'
import {
  Ethereum as LedgerEthereum,
  Conflux as LedgerConflux,
} from '@fluent-wallet/ledger'
import {decrypt} from 'browser-passworder'
import {joinSignature} from '@ethersproject/bytes'
import {addHexPrefix} from '@fluent-wallet/utils'
const {map, dbid, or} = spec

function getLedgerHDPathFromAddressAndGroupData(groupData, hex) {
  return groupData[hex]
}

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
    throw InvalidParams(
      "Invalid typed data, must be a JSON string, can't parse with JSON.parse",
    )
  }

  const typedDataSpec = getTypedDataSpec(type, spec)
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

async function signTypedDataWithLedger(type, hdPath, typedData) {
  const payload = await getLedgerTypedDataPayload(type, typedData)
  const ledger = type === 'cfx' ? new LedgerConflux() : new LedgerEthereum()
  try {
    if (type === 'cfx') {
      const res = await ledger.signEIP712Message(hdPath, payload.typedDataJSON)
      return res
    }

    const res = await ledger.signEIP712Message(hdPath, payload.typedDataJSON)
    return res
  } catch (error) {
    // signEIP712Message is not compatible with ledger nanos
    const unsupported =
      error?.statusCode === 0x6d00 ||
      error?.statusText === 'INS_NOT_SUPPORTED' ||
      /INS_NOT_SUPPORTED/.test(error?.message ?? '')

    if (!unsupported) throw error
    return ledger.signEIP712HashedMessage(
      hdPath,
      payload.domainHashHex,
      payload.messageHashHex,
    )
  }
}

const {cat, ethHexAddress, base32UserAddress, stringp} = spec

export const gen = {
  schemas: type => {
    const publicSchema = [
      cat,
      type === 'cfx' ? base32UserAddress : ethHexAddress,
      [stringp, {doc: 'typedDataString'}],
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
      db: {getAuthReqById, findAddress, validateAddrInApp, getPassword},
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
        // calling eth_signTypedData_v4 in conflux network
        if (app.currentNetwork.type === 'cfx' && type === 'eth') {
          params[0] = encode(params[0], app.currentNetwork.netId)
        }
        const [from, typedDataString] = params

        if (
          !validateAddrInApp({
            appId: app.eid,
            networkId: app.currentNetwork.eid,
            addr: from,
          })
        ) {
          throw Unauthorized()
        }

        const addr = findAddress({
          appId: app.eid,
          value: from,
          g: {hex: 1, _account: {eid: 1, _accountGroup: {vault: {type: 1}}}},
        })

        validateAndFormatTypedDataString({
          type,
          typedDataString,
          spec,
          InvalidParams,
        })

        if (addr.account.accountGroup.vault.type === 'pub') throw UserRejected()

        if (app.currentNetwork.type === 'cfx' && type === 'eth') {
          params[0] = addr.hex
        }
        const req = {method: `${type}_signTypedData_v4`, params}
        return wallet_addPendingUserAuthRequest({appId: app.eid, req})
      }

      if (_popup) {
        const {authReqId} = params

        const authReq = getAuthReqById(authReqId)
        if (!authReq) throw InvalidParams(`Invalid auth req id ${authReqId}`)

        if (authReq.app.currentNetwork.type === 'cfx' && type === 'eth') {
          params.data[0] = encode(
            params.data[0].replace(/^0x./, '0x1'),
            authReq.app.currentNetwork.netId,
          )
        }

        const {
          data: [from, typedDataString],
        } = params

        if (
          !validateAddrInApp({
            appId: authReq.app.eid,
            networkId: authReq.app.currentNetwork.eid,
            addr: from,
          })
        ) {
          return wallet_userRejectedAuthRequest({authReqId})
        }

        const addr = findAddress({
          appId: authReq.app.eid,
          value: from,
          g: {pk: 1, hex: 1, _account: {eid: 1, _accountGroup: {vault: 1}}},
        })

        if (addr.account.accountGroup.vault.type === 'pub')
          return wallet_userRejectedAuthRequest({authReqId})

        const typedData = validateAndFormatTypedDataString({
          type,
          typedDataString,
          spec,
          InvalidParams,
        })

        if (addr.account.accountGroup.vault.type === 'hw') {
          const decrypted = JSON.parse(
            addr.account.accountGroup.vault.ddata ||
              (await decrypt(
                getPassword(),
                addr.account.accountGroup.vault.data,
              )),
          )

          const hdPath = getLedgerHDPathFromAddressAndGroupData(
            decrypted,
            addr.hex,
          )
          if (!hdPath) throw InvalidParams(`Invalid address id ${from}`)

          const res = await signTypedDataWithLedger(type, hdPath, typedData)
          const signature = joinSignature({
            r: addHexPrefix(res.r),
            s: addHexPrefix(res.s),
            v: res.v,
          })

          return await wallet_userApprovedAuthRequest({
            authReqId,
            res: signature,
          })
        }

        const pk =
          addr.pk ||
          (await wallet_getAddressPrivateKey({
            address: from,
            accountId: addr.account.eid,
          }))

        const sig = await signTypedData_v4(type, pk, typedData)

        return await wallet_userApprovedAuthRequest({authReqId, res: sig})
      }
    },
}

export const NAME = 'cfx_signTypedData_v4'

export const schemas = gen.schemas('cfx')

export const permissions = {
  external: ['inpage', 'popup'],
  db: ['getAuthReqById', 'findAddress', 'validateAddrInApp', 'getPassword'],
  methods: [
    'wallet_getAddressPrivateKey',
    'wallet_addPendingUserAuthRequest',
    'wallet_userApprovedAuthRequest',
    'wallet_userRejectedAuthRequest',
  ],
  scope: {wallet_accounts: {}},
}

export const main = gen.main('cfx')
