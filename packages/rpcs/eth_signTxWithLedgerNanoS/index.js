import {map, dbid, mapp} from '@fluent-wallet/spec'
import {decrypt} from 'browser-passworder'
import {Ethereum as LedgerEthereum} from '@fluent-wallet/ledger'
import {
  ethEncodeTx,
  ethRecoverTransactionToAddress,
  ethJoinTransactionAndSignature,
} from '@fluent-wallet/signature'

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
  const newTx = {...tx}
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
    const {r, s, v} = await new LedgerEthereum().signTransaction(
      hdPath,
      ethEncodeTx(newTx, true),
    )
    const recoveredAddr = ethRecoverTransactionToAddress(tx, {r, s, v})

    if (recoveredAddr.toLowerCase() !== addr.value)
      throw InvalidParams(
        `The address in LedgerNanoS (${recoveredAddr}) doesn't match the address in fluent (${addr.value})`,
      )

    const rawTx = ethJoinTransactionAndSignature({
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
