import {map, dbid, mapp} from '@fluent-wallet/spec'
import {decrypt} from 'browser-passworder'
import {Conflux as LedgerConflux} from '@fluent-wallet/ledger'
import {
  cfxEncodeTx,
  cfxJoinTransactionAndSignature,
} from '@fluent-wallet/signature'

export const NAME = 'cfx_signTxWithLedgerNanoS'

export const schemas = {
  input: [map, {closed: true}, ['tx', mapp], ['addressId', dbid]],
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
  params: {tx, addressId},
}) => {
  const newTx = {...tx}
  const addr = findAddress({
    addressId,
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
  if (addr.account.accountGroup.vault.device !== 'LedgerNanoS')
    throw InvalidParams(`Invalid address id ${addressId}`)

  const decrypted = JSON.parse(
    addr.account.accountGroup.vault.ddata ||
      (await decrypt(getPassword(), addr.account.accountGroup.vault.data)),
  )
  const hdPath = getLedgerHDPathFromAddressAndGroupData(decrypted, addr.hex)

  if (!hdPath) throw InvalidParams(`Invalid address id ${addressId}`)

  try {
    const {r, s, v} = await new LedgerConflux().signTransaction(
      hdPath,
      cfxEncodeTx(newTx, true),
    )

    const rawTx = cfxJoinTransactionAndSignature({
      tx: newTx,
      signature: [r, s, v],
    })

    return rawTx
  } catch (err) {
    const newError = UserRejected(
      'error while signing transaction with Ledger Nano S',
    )
    newError.extra.errorFromHardwareWallet = err.message
    throw newError
  }
}
