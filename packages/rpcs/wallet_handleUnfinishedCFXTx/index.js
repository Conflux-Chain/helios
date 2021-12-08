import {mapp} from '@fluent-wallet/spec'
import {stream, resolve, CloseMode} from '@thi.ng/rstream'
import {
  sideEffect,
  map,
  keep,
  // comp,
  keepTruthy,
  // trace,
  branchObj,
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
    'wallet_getBlockChainExplorerUrl',
    'cfx_getNextNonce',
  ],
  db: [
    'retractAttr',
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
    'setTxChainSwitched',
  ],
}

export const main = ({
  rpcs: {
    cfx_epochNumber,
    cfx_sendRawTransaction,
    cfx_getTransactionByHash,
    cfx_getTransactionReceipt,
    cfx_getNextNonce,
    wallet_getBlockChainExplorerUrl,
    wallet_handleUnfinishedCFXTx,
  },
  db: {
    retractAttr,
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
    setTxChainSwitched,
  },
  params: {tx, address, okCb, failedCb},
  network,
}) => {
  tx = getTxById(tx)
  address = getAddressById(address)
  const cacheTime = network.cacheTime || 1000
  const {status, hash, raw} = tx
  const s = defs(hash, {tx, address})
  const ss = defs(hash, {tx, address})
  const sdone = () => s.done()
  const ssdone = () => ss.done()
  const keepTrack = (delay = cacheTime) => {
    if (!Number.isInteger(delay)) delay = cacheTime
    sdone()
    setTimeout(
      () => wallet_handleUnfinishedCFXTx({tx: tx.eid, address: address.eid}),
      delay,
    )
  }
  const skeepTrack = (delay = cacheTime) => {
    if (!Number.isInteger(delay)) delay = cacheTime
    ssdone()
    setTimeout(
      () => wallet_handleUnfinishedCFXTx({tx: tx.eid, address: address.eid}),
      delay,
    )
  }

  // # detect pivot chain switch
  if (status === 0) {
    // ## unsent
  } else if (status === 1) {
    // ## sending
  } else if (status === 2) {
    // ## pending
  } else if (status === 3) {
    // ## packaged
    ss.map(() => cfx_getTransactionByHash({errorFallThrough: true}, [hash]))
      .subscribe(resolve({fail: identity}))
      .transform(
        sideEffect(rst => {
          if (!rst) {
            if (tx.blockHash) retractAttr({eid: tx.eid, attr: 'tx/blockHash'})
            setTxPending({hash})
            setTxChainSwitched({hash})
            skeepTrack()
          }
        }),
        keepTruthy(),
        sideEffect(rst => {
          if (rst.blockHash !== tx.blockHash) {
            setTxPackaged({hash, blockHash: rst.blockHash})
            setTxChainSwitched({hash})
          }
          skeepTrack()
        }),
      )
  } else if (status === 4) {
    // ## executed
    ss.map(() => cfx_getTransactionReceipt({errorFallThrough: true}, [hash]))
      .subscribe(resolve({fail: identity}))
      .transform(
        sideEffect(rst => {
          if (!rst) {
            if (tx.receipt) retractAttr({eid: tx.eid, attr: 'tx/receipt'})
            setTxPackaged({hash, blockHash: tx.blockHash})
            setTxChainSwitched({hash})
            ssdone()
          }
        }),
        keepTruthy(),
        sideEffect(rst => {
          if (
            rst.blockHash !== tx.receipt.blockHash ||
            rst.index !== tx.receipt.index ||
            rst.epochNumber !== tx.receipt.epochNumber
          ) {
            if (tx.receipt) retractAttr({eid: tx.eid, attr: 'tx/receipt'})
            setTxPackaged({hash, blockHash: rst.blockHash})
            setTxChainSwitched({hash})
            skeepTrack()
          }
        }),
      )
  }

  // # process tx
  if (status === 0) {
    // ## unsent
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
            const isDuplicateTx = errorType === 'duplicateTx'
            const failed = shouldDiscard && !isDuplicateTx

            defs({
              failed: failed && {errorType, err},
              isDuplicateTx,
              keepTrack: !failed,
            }).transform(
              branchObj({
                failed: [
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
                          tx.txPayload.nonce,
                          16,
                        )} failed! ${err?.message || ''}`,
                      }),
                    )
                  }),
                  sideEffect(() => updateBadge(getUnfinishedTxCount())),
                ],
                isDuplicateTx: [
                  keepTruthy(),
                  sideEffect(() => {
                    setTxPending({hash})
                    typeof okCb === 'function' && okCb(hash)
                    keepTrack()
                  }),
                ],

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
        sideEffect(() => keepTrack),
      )
  } else if (status === 1) {
    // ## sending
  } else if (status === 2) {
    // ## pending
    s.map(() => cfx_getTransactionByHash({errorFallThrough: true}, [hash]))
      .subscribe(resolve({fail: keepTrack}))
      .transform(
        sideEffect(rst => {
          if (rst) return
          cfx_epochNumber({errorFallThrough: true}, ['latest_state'])
            .then(n => {
              if (
                BigNumber.form(n)
                  .sub(BigNumber.from(tx.txPayload.epochHeight))
                  .gte(40)
              ) {
                setTxUnsent({hash})
              }
            })
            .catch(identity)
          return keepTrack()
        }),
        keepTruthy(),
      )
      .transform(
        map(rst => {
          if (!rst.blockHash) {
            keepTrack()
            return false
          }
          return rst
        }),
        keepTruthy(),
        sideEffect(rst => {
          setTxPackaged({hash, blockHash: rst.blockHash})
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
                      tx.txPayload.nonce,
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
                  tx.txPayload.nonce,
                  16,
                )} failed! ${err?.message || ''}`,
              }),
            )
            return
          }
          if (status === '0x2') {
            setTxSkipped({hash})
            updateBadge(getUnfinishedTxCount())
            wallet_getBlockChainExplorerUrl({transaction: [hash]}).then(
              ({transaction: [txUrl]}) => {
                getExt().then(ext =>
                  ext.notifications.create(txUrl, {
                    title: 'Skipped transaction',
                    message: `Transaction ${parseInt(
                      tx.txPayload.nonce,
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
            keepTrack(5 * cacheTime)
            return Promise.resolve(null)
          }
          return cfx_getNextNonce([address.value])
        }),
      )
      .subscribe(resolve({fail: keepTrack}))
      .transform(
        keep(),
        sideEffect(nonce => {
          if (nonce > tx.txPayload.nonce) {
            setTxSkipped({hash})
            updateBadge(getUnfinishedTxCount())
            getExt().then(ext =>
              ext.notifications.create(hash, {
                title: 'Skipped transaction',
                message: `Transaction ${parseInt(
                  tx.txPayload.nonce,
                  16,
                )}  skipped!`,
              }),
            )
            return sdone()
          }
          keepTrack()
        }),
      )
  } else if (status === 3) {
    // ## packaged
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
            index,
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
            index,
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
            keepTrack(50 * cacheTime)
          } else {
            setTxFailed({hash, err: txExecErrorMsg})
            updateBadge(getUnfinishedTxCount())
            getExt().then(ext =>
              ext.notifications.create(hash, {
                title: 'Failed transaction',
                message: `Transaction ${parseInt(
                  tx.txPayload.nonce,
                  16,
                )} failed! ${txExecErrorMsg}`,
              }),
            )
          }
        }),
        sideEffect(sdone),
      )
  } else if (status === 4) {
    // ## executed
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
          keepTrack(50 * cacheTime)
          return false
        }),
        keepTruthy(), // filter non-null tx
        map(() => wallet_getBlockChainExplorerUrl({transaction: [hash]})),
      )
      .subscribe(resolve({fail: identity}))
      .transform(
        sideEffect(({transaction: [txUrl]}) => {
          getExt().then(ext => {
            ext.notifications.create(txUrl, {
              title: 'Confirmed transaction',
              message: `Transaction ${parseInt(
                tx.txPayload.nonce,
                16,
              )} confirmed! ${txUrl?.length ? 'View on Explorer.' : ''}`,
            })
          })
        }),
        sideEffect(sdone),
      )
  }
}
