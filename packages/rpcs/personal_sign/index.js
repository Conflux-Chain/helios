import {
  cat,
  map,
  stringp,
  or,
  ethHexAddress,
  base32UserAddress,
  dbid,
  validate,
  zeroOrOne,
} from '@fluent-wallet/spec'
import {personalSign} from '@fluent-wallet/signature'
import {
  Ethereum as LedgerEthereum,
  Conflux as LedgerConflux,
} from '@fluent-wallet/ledger'
import {decrypt} from 'browser-passworder'
import {addHexPrefix, toHexString} from '@fluent-wallet/utils'
import {joinSignature} from '@ethersproject/bytes'

export const NAME = 'personal_sign'

const publicSchema = [
  cat,
  [stringp, {doc: 'message string to sign'}],
  [or, ethHexAddress, base32UserAddress],
  [zeroOrOne, {doc: 'Ignored optional password for compatibility'}, stringp],
]

const innerSchema = [
  map,
  {closed: true},
  ['authReqId', dbid],
  ['data', publicSchema],
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
  db: ['getAuthReqById', 'findAddress', 'validateAddrInApp', 'getPassword'],
  scope: {wallet_accounts: {}},
}

function getLedgerHDPathFromAddressAndGroupData(groupData, hex) {
  return groupData[hex]
}

export const main = async ({
  Err: {InvalidParams, Unauthorized, UserRejected},
  db: {getAuthReqById, findAddress, validateAddrInApp, getPassword},
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
      networkId: app.currentNetwork.eid,
      appId: app.eid,
      value: from,
      accountG: {_accountGroup: {vault: {type: 1}}},
    })

    if (addr.account.accountGroup.vault.type === 'pub') throw UserRejected()

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
      networkId: authReq.app.currentNetwork.eid,
      appId: authReq.app.eid,
      value: from,
      g: {pk: 1, hex: 1, _account: {eid: 1, _accountGroup: {vault: 1}}},
    })

    if (addr.account.accountGroup.vault.type === 'hw') {
      const decrypted = JSON.parse(
        addr.account.accountGroup.vault.ddata ||
          (await decrypt(getPassword(), addr.account.accountGroup.vault.data)),
      )

      const hdPath = getLedgerHDPathFromAddressAndGroupData(decrypted, addr.hex)

      if (!hdPath) throw InvalidParams(`Invalid address id ${from}`)
      const hexMessage = toHexString(message)
      const res = await signPersonalMessageWithLedger(type, hdPath, hexMessage)
      const signature = joinSignature({
        r: addHexPrefix(res.r),
        s: addHexPrefix(res.s),
        v: res.v,
      })

      return await wallet_userApprovedAuthRequest({authReqId, res: signature})
    }

    if (addr.account.accountGroup.vault.type === 'pub')
      return wallet_userRejectedAuthRequest({authReqId})

    const pk =
      addr.pk ||
      (await wallet_getAddressPrivateKey(
        {network: authReq.app.currentNetwork},
        {address: from, accountId: addr.account.eid},
      ))
    const sig = await personalSign(type, pk, message)

    return await wallet_userApprovedAuthRequest({authReqId, res: sig})
  }
}

const signPersonalMessageWithLedger = async (type, hdPath, message) => {
  const ledger = type === 'cfx' ? new LedgerConflux() : new LedgerEthereum()
  const res = await ledger.signPersonalMessage(hdPath, message)
  return res
}
