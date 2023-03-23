import {map, dbid, mapp} from '@fluent-wallet/spec'
import {decrypt} from 'browser-passworder'
import {Ethereum as LedgerEthereum} from '@fluent-wallet/ledger'
import {TransactionFactory} from '@ethereumjs/tx'
import {RLP} from '@ethereumjs/rlp'
import {bufArrToArr} from '@ethereumjs/util'
import {Common} from '@ethereumjs/common'
import {addHexPrefix} from '@fluent-wallet/utils'

export const NAME = 'eth_signTxWithLedgerNanoS'

export const schemas = {
  input: [
    map,
    {closed: true},
    ['tx', mapp],
    ['addressId', dbid],
    ['accountId', dbid],
  ],
}

export const permissions = {
  external: [],
  methods: [],
  db: ['findAddress', 'getPassword'],
}

function getLedgerHDPathFromAddressAndGroupData(groupData, hex) {
  return groupData[hex]
}

export const main = async ({
  Err: {InvalidParams, UserRejected},
  db: {findAddress, getPassword},
  params: {tx, addressId, accountId},
}) => {
  let newTx = {...tx}
  const addr = findAddress({
    addressId,
    accountId,
    g: {
      value: 1,
      hex: 1,
      _account: {
        _accountGroup: {eid: 1, vault: 1},
      },
    },
  })

  if (!addr) throw InvalidParams(`Invalid address id ${addressId}`)
  if (addr.account.accountGroup.vault.type !== 'hw')
    throw InvalidParams(`Invalid address id ${addressId}`)

  const decrypted = JSON.parse(
    addr.account.accountGroup.vault.ddata ||
      (await decrypt(getPassword(), addr.account.accountGroup.vault.data)),
  )
  const hdPath = getLedgerHDPathFromAddressAndGroupData(decrypted, addr.hex)

  if (!hdPath) throw InvalidParams(`Invalid address id ${addressId}`)

  try {
    const common = Common.custom({chainId: tx.chainId})
    const txData = TransactionFactory.fromTxData(newTx, {common})

    let messageToSign = txData.getMessageToSign(false)
    const rawTxHex = Buffer.isBuffer(messageToSign)
      ? messageToSign.toString('hex')
      : Buffer.from(RLP.encode(bufArrToArr(messageToSign)))

    const {r, s, v} = await new LedgerEthereum().signTransaction(
      hdPath,
      rawTxHex,
    )

    const allTxData = {
      ...newTx,
      v: addHexPrefix(v),
      r: addHexPrefix(r),
      s: addHexPrefix(s),
    }
    const signedTx = TransactionFactory.fromTxData(allTxData, {common})
    const recoveredAddr = signedTx.getSenderAddress().toString()
    if (recoveredAddr.toLowerCase() !== addr.value)
      throw InvalidParams(
        `The address in LedgerNanoS (${recoveredAddr}) doesn't match the address in fluent (${addr.value})`,
      )

    const rawTx = signedTx.serialize().toString('hex')
    return addHexPrefix(rawTx)
  } catch (err) {
    const newError = UserRejected(
      'error while signing transaction with Ledger Nano S',
    )
    newError.extra.errorFromHardwareWallet = err.message
    throw newError
  }
}
