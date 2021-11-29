import {mapp} from '@fluent-wallet/spec'
import {stream, resolve, CloseMode} from '@thi.ng/rstream'
import {
  sideEffect,
  map,
  keep,
  multiplexObj,
  comp,
  keepTruthy,
} from '@fluent-wallet/transducers'
import {processError} from '@fluent-wallet/conflux-tx-error'
import {BigNumber} from '@ethersproject/bignumber'
import {identity} from '@fluent-wallet/compose'

export const NAME = 'wallet_handleUnfinishedCFXTx'

function defs(...args) {
  const s = stream({
    id: args.length === 2 ? args[0] : undefined,
    closeIn: CloseMode.FIRST,
    closeOut: false,
    cache: true,
  })
  s.next(args.length === 2 ? args[1] : args[0])
  return s
}

let Ext

function getExt() {
  return Ext
    ? Promise.resolve(Ext)
    : import('@fluent-wallet/webextension').then(ext => {
        Ext = ext
        return ext
      })
}

function updateBadge(count) {
  return getExt().then(ext =>
    count > 0 ? ext.badge.set({text: count}) : ext.badge.clear(),
  )
}

export const schemas = {
  input: [mapp],
}

export const permissions = {
  locked: true,
  methods: [
    'cfx_epochNumber',
    'cfx_sendRawTransaction',
    'cfx_getTransactionByHash',
    'cfx_getTransactionReceipt',
    'wallet_handleUnfinishedCFXTx',
    'wallet_getExplorerUrl',
    'cfx_getNextNonce',
  ],
  db: [
    'getUnfinishedTxCount',
    'getAddressById',
    'getTxById',
    'setTxSkipped',
    'setTxFailed',
    'setTxSending',
    'setTxPending',
    'setTxPackaged',
    'setTxExecuted',
    'setTxConfirmed',
    'setTxUnsent',
  ],
}

export const main = ({
  rpcs: {
    cfx_epochNumber,
    cfx_sendRawTransaction,
    cfx_getTransactionByHash,
    cfx_getTransactionReceipt,
    cfx_getNextNonce,
    wallet_getExplorerUrl,
    wallet_handleUnfinishedCFXTx,
  },
  db: {
    getUnfinishedTxCount,
    getAddressById,
    getTxById,
    setTxSkipped,
    setTxFailed,
    setTxSending,
    setTxPending,
    setTxPackaged,
    setTxExecuted,
    setTxConfirmed,
    setTxUnsent,
  },
  params: {tx, address, okCb, failedCb},
}) => {
  tx = getTxById(tx)
  address = getAddressById(address)
  const {status, hash, raw} = tx
  const s = defs(hash, {tx, address})
  const sdone = () => s.done()
  const keepTrack = () => {
    sdone()
    return wallet_handleUnfinishedCFXTx({tx: tx.eid, address: address.eid})
  }

  // unsent
  if (status === 0) {
    s.transform(
      sideEffect(() => setTxSending({hash})),
      sideEffect(() => updateBadge(getUnfinishedTxCount())),
    )
      .map(() => {
        return cfx_sendRawTransaction({errorFallThrough: true}, [raw])
      })
      .subscribe(
        resolve({
          fail: err => {
            // failed to send
            setTxUnsent({hash})

            const {errorType, shouldDiscard} = processError(err)
            const isDuplicateTx = !errorType !== 'duplicateTx'
            const failed = shouldDiscard && isDuplicateTx

            defs({
              failed: failed && {errorType, err},
              isDuplicateTx,
              keepTrack: !failed,
            }).transform(
              multiplexObj({
                failed: comp(
                  keepTruthy(),
                  sideEffect(
                    ({err}) => typeof failedCb === 'function' && failedCb(err),
                  ),
                  sideEffect(({errorType}) => {
                    setTxFailed({hash, error: errorType})
                    getExt().then(ext =>
                      ext.notifications.create(hash, {
                        title: 'Failed transaction',
                        message: `Transaction ${parseInt(
                          tx.payload.nonce,
                          16,
                        )} failed! ${err?.message || ''}`,
                      }),
                    )
                  }),
                  sideEffect(() => updateBadge(getUnfinishedTxCount())),
                ),

                isDuplicateTx: comp(
                  keepTruthy(),
                  sideEffect(() => {
                    setTxPending({hash})
                    typeof okCb === 'function' && okCb(hash)
                    keepTrack()
                  }),
                ),

                keepTrack: map(x => x && keepTrack), // retry in next run
              }),
            )
          },
        }),
      )
      .transform(
        // successfully sent
        sideEffect(() => setTxPending({hash})),
        sideEffect(() => typeof okCb === 'function' && okCb(hash)),
        sideEffect(keepTrack),
      )
    return
  }

  // sending
  if (status === 1) {
    return
  }

  // pending
  if (status === 2) {
    s.map(() => cfx_getTransactionByHash({errorFallThrough: true}, [hash]))
      .subscribe(resolve({fail: keepTrack}))
      .transform(
        sideEffect(rst => {
          if (!rst) return
          setTxPackaged({hash})
          const {status} = rst
          if (status === '0x1') {
            let err = 'Transaction reverted'
            setTxFailed({hash, err})

            // get the error message in receipt
            cfx_getTransactionReceipt({errorFallThrough: true}, [hash])
              .then(receipt => {
                if (receipt?.txExecErrorMsg) {
                  err = receipt.txExecErrorMsg
                  setTxFailed({hash, err})
                }
                updateBadge(getUnfinishedTxCount())
                getExt().then(ext =>
                  ext.notifications.create(hash, {
                    title: 'Failed transaction',
                    message: `Transaction ${parseInt(
                      tx.payload.nonce,
                      16,
                    )} failed! ${err}`,
                  }),
                )
              })
              .catch(identity)

            getExt().then(ext =>
              ext.notifications.create(hash, {
                title: 'Failed transaction',
                message: `Transaction ${parseInt(
                  tx.payload.nonce,
                  16,
                )} failed! ${err?.message || ''}`,
              }),
            )
            return
          }
          if (status === '0x2') {
            setTxSkipped({hash})
            updateBadge(getUnfinishedTxCount())
            wallet_getExplorerUrl({transaction: [hash]}).then(
              ({transaction: [txUrl]}) => {
                getExt().then(ext =>
                  ext.notifications.create(txUrl, {
                    title: 'Skipped transaction',
                    message: `Transaction ${parseInt(
                      tx.payload.nonce,
                      16,
                    )}  skipped! ${txUrl?.length ? 'View on explorer.' : ''}`,
                  }),
                )
              },
            )
            return
          }
        }),
        map(rst => {
          if (rst) {
            keepTrack()
            return Promise.resolve(null)
          }
          return cfx_getNextNonce([address.base32])
        }),
      )
      .subscribe(resolve({fail: keepTrack}))
      .transform(
        keep(),
        sideEffect(nonce => {
          if (nonce > tx.payload.nonce) {
            setTxSkipped({hash})
            updateBadge(getUnfinishedTxCount())
            getExt().then(ext =>
              ext.notifications.create(hash, {
                title: 'Skipped transaction',
                message: `Transaction ${parseInt(
                  tx.payload.nonce,
                  16,
                )}  skipped!`,
              }),
            )
            return sdone()
          }
          keepTrack()
        }),
      )

    return
  }

  // packaged
  if (status === 3) {
    s.map(() => cfx_getTransactionReceipt({errorFallThrough: true}, [hash]))
      .subscribe(resolve({fail: keepTrack}))
      .transform(
        sideEffect(rst => {
          !rst && keepTrack()
        }),
        keep(),
        sideEffect(rst => {
          const {
            outcomeStatus,
            blockHash,
            epochNumber,
            txExecErrorMsg,
            contractCreated,
            gasUsed,
            gasFee,
            storageCollateralized,
            gasCoveredBySponsor,
            storageReleased,
          } = rst
          const receipt = {
            blockHash,
            epochNumber,
            gasUsed,
            gasFee,
            storageCollateralized,
            gasCoveredBySponsor,
          }
          if (storageReleased?.length) receipt.storageReleased = storageReleased
          if (contractCreated) receipt.contractCreated = contractCreated

          if (outcomeStatus === '0x0') {
            setTxExecuted({hash, receipt})
            keepTrack()
          } else {
            setTxFailed({hash, err: txExecErrorMsg})
            updateBadge(getUnfinishedTxCount())
            getExt().then(ext =>
              ext.notifications.create(hash, {
                title: 'Failed transaction',
                message: `Transaction ${parseInt(
                  tx.payload.nonce,
                  16,
                )} failed! ${txExecErrorMsg}`,
              }),
            )
          }
        }),
        sideEffect(sdone),
      )

    return
  }

  // executed
  if (status === 4) {
    s.map(() => cfx_epochNumber(['latest_confirmed']))
      .subscribe(resolve({fail: keepTrack}))
      .transform(
        map(n => {
          if (
            n &&
            BigNumber.from(n).gte(BigNumber.from(tx.receipt.epochNumber))
          ) {
            setTxConfirmed({hash})
            updateBadge(getUnfinishedTxCount())
            return true
          }
          keepTrack()
          return false
        }),
        keepTruthy(), // filter non-null tx
        map(() => wallet_getExplorerUrl({transaction: [hash]})),
      )
      .subscribe(resolve({fail: identity}))
      .transform(
        sideEffect(({transaction: [txUrl]}) => {
          getExt().then(ext => {
            ext.notifications.create(txUrl, {
              title: 'Confirmed transaction',
              message: `Transaction ${parseInt(
                tx.payload.nonce,
                16,
              )} confirmed! ${txUrl?.length ? 'View on Explorer.' : ''}`,
            })
          })
        }),
        sideEffect(sdone),
      )
    return
  }
}
