import {mapp} from '@fluent-wallet/spec'
import {stream, resolve, CloseMode} from '@thi.ng/rstream'
import {
  sideEffect,
  map,
  keep,
  // comp,
  // trace,
  keepTruthy,
  branchObj,
  // pluck,
} from '@fluent-wallet/transducers'
import {processError} from '@fluent-wallet/ethereum-tx-error'
import {ETH_TX_TYPES} from '@fluent-wallet/consts'
import {BigNumber} from '@ethersproject/bignumber'
import {identity} from '@fluent-wallet/compose'

export const NAME = 'wallet_handleUnfinishedETHTx'

function getGasPrice(tx) {
  const payload = tx.txPayload
  return payload.type === ETH_TX_TYPES.EIP1559
    ? payload.maxFeePerGas
    : payload.gasPrice
}

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

function updateBadge() {
  // count
  return
  // return getExt().then(ext =>
  //   count > 0 ? ext.badge.set({text: count}) : ext.badge.clear(),
  // )
}

export const schemas = {
  input: [mapp],
}

export const permissions = {
  locked: true,
  methods: [
    'eth_blockNumber',
    'eth_sendRawTransaction',
    'eth_getTransactionByHash',
    'eth_getTransactionReceipt',
    'wallet_handleUnfinishedETHTx',
    'wallet_getBlockchainExplorerUrl',
    'eth_getTransactionCount',
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
    'queryTxWithSameNonce',
    'forceSetTxStatus',
  ],
}

export const main = ({
  rpcs: {
    eth_blockNumber,
    eth_sendRawTransaction,
    eth_getTransactionByHash,
    eth_getTransactionReceipt,
    eth_getTransactionCount,
    wallet_getBlockchainExplorerUrl,
    wallet_handleUnfinishedETHTx,
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
    queryTxWithSameNonce,
    forceSetTxStatus,
  },
  params: {tx, address, okCb, failedCb},
  network,
}) => {
  tx = getTxById(tx)
  // this only happends in integration test
  if (!tx) return
  address = getAddressById(address)
  const cacheTime = Math.min(network.cacheTime || 1000, 4000)
  const {status, hash, raw} = tx

  const s = defs(hash, {tx, address})
  const sdone = () => s.done()
  const keepTrack = (delay = cacheTime) => {
    if (!Number.isInteger(delay)) delay = cacheTime
    sdone()
    setTimeout(
      () => wallet_handleUnfinishedETHTx({tx: tx.eid, address: address.eid}),
      delay,
    )
  }

  const ss = defs(hash, {tx, address})
  const ssdone = () => ss.done()
  const skeepTrack = (delay = cacheTime) => {
    if (!Number.isInteger(delay)) delay = cacheTime
    ssdone()
    setTimeout(
      () => wallet_handleUnfinishedETHTx({tx: tx.eid, address: address.eid}),
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
    ss.map(() => eth_getTransactionByHash({errorFallThrough: true}, [hash]))
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
    ss.map(() => eth_getTransactionReceipt({errorFallThrough: true}, [hash]))
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
            rst.transactionIndex !== tx.receipt.transactionIndex ||
            rst.blockNumber !== tx.receipt.blockNumber
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
        return eth_sendRawTransaction({errorFallThrough: true}, [raw])
      })
      .subscribe(
        resolve({
          fail: err => {
            // failed to send
            setTxUnsent({hash})

            let {errorType, shouldDiscard} = processError(err)
            const isResend = !!tx.resendAt
            const isDuplicateTx = errorType === 'duplicateTx'
            const resendNonceTooStale =
              isResend && errorType === 'tooStaleNonce'
            const resendPriceTooLow =
              isResend && errorType === 'replaceUnderpriced'
            if (resendPriceTooLow) errorType = 'replacedByAnotherTx'
            const sameNonceTxs = queryTxWithSameNonce({hash}) || []
            const latestTx = sameNonceTxs
              .filter(t => t.status >= 0)
              .sort((a, b) =>
                BigNumber.from(getGasPrice(b)).sub(getGasPrice(a)).toNumber(),
              )[0]
            const currentTxIsLatest = !latestTx || latestTx.hash === hash
            let disableNotification = isResend && !currentTxIsLatest
            let sameAsSuccess = isDuplicateTx || resendNonceTooStale

            let failed = !sameAsSuccess && (shouldDiscard || resendPriceTooLow)

            const handler = () => {
              defs({
                failed: failed && {
                  errorType,
                  err,
                  disableNotification,
                },
                sameAsSuccess,
                resend: !shouldDiscard && !sameAsSuccess,
              })
                .transform(
                  branchObj({
                    failed: [
                      sideEffect(
                        ({err}) =>
                          typeof failedCb === 'function' && failedCb(err),
                      ),
                      sideEffect(({errorType, disableNotification}) => {
                        if (setTxFailed({hash, error: errorType})) {
                          !disableNotification &&
                            getExt().then(ext =>
                              ext.notifications.create(hash, {
                                title: 'Failed transaction',
                                message: `Transaction ${parseInt(
                                  tx.txPayload.nonce,
                                  16,
                                )} failed! ${err?.data || err?.message || ''}`,
                              }),
                            )
                        }
                      }),
                      sideEffect(() => {
                        updateBadge(getUnfinishedTxCount())
                      }),
                    ],
                    resend: sideEffect(keepTrack),
                    // retry in next run
                    sameAsSuccess: [
                      sideEffect(() => setTxPending({hash})),
                      sideEffect(
                        () => typeof okCb === 'function' && okCb(hash),
                      ),
                      sideEffect(keepTrack),
                    ],
                  }),
                )
                .done()
            }

            if (isResend && currentTxIsLatest && resendNonceTooStale) {
              let localTxExecuted = false
              Promise.all(
                sameNonceTxs.map(_tx =>
                  eth_getTransactionByHash({errorFallThrough: true}, [
                    _tx.hash,
                  ]).then(res => {
                    if (res && _tx.hash === hash) {
                      // current tx is executed
                      localTxExecuted = true
                      sameAsSuccess = true
                      failed = false
                    } else if (res) {
                      // local tx is executed but not the current tx
                      localTxExecuted = true
                      sameAsSuccess = false
                      failed = true
                      errorType = 'replacedByAnotherTx'
                      disableNotification = true
                      // set executed tx to pending, start a new tracking
                      forceSetTxStatus({hash: _tx.hash, status: 2, error: null})
                      wallet_handleUnfinishedETHTx({
                        tx: _tx.eid,
                        address: address.eid,
                      })
                    }
                  }),
                ),
              )
                .then(() => {
                  if (!localTxExecuted) {
                    return eth_getTransactionCount({errorFallThrough: true}, [
                      address.value,
                      'finalized',
                    ]).then(finalizedNonce => {
                      if (
                        BigNumber.from(finalizedNonce).gt(
                          BigNumber.from(tx.txPayload.nonce),
                        )
                      ) {
                        sameAsSuccess = false
                        failed = true
                        errorType = 'replacedByAnotherTx'
                      }
                    })
                  }
                })
                .finally(handler)
            } else {
              handler()
            }
          },
        }),
      )
      .transform(
        // successfully sent
        sideEffect(() => setTxPending({hash})),
        sideEffect(() => typeof okCb === 'function' && okCb(hash)),
        sideEffect(keepTrack),
      )
  } else if (status === 1) {
    // ## sending
  } else if (status === 2) {
    // ## pending
    s.map(() => eth_getTransactionByHash({errorFallThrough: true}, [hash]))
      .subscribe(resolve({fail: keepTrack}))
      .transform(
        // not packaged or no blockhash in getTransactionByHash result
        map(rst => {
          if (rst && rst.blockHash) return rst
          // getTransactionByHash return null
          eth_blockNumber({errorFallThrough: true}, [])
            .then(n => {
              if (!tx.resendAt && !tx.blockNumber) {
                setTxSending({hash, resendAt: n})
              } else if (
                BigNumber.from(n)
                  .sub(BigNumber.from(tx.resendAt || tx.blockNumber))
                  .gte(1)
              ) {
                setTxUnsent({hash, resendAt: n})
              }
            })
            .catch(identity)
          return keepTrack()
        }),
        keepTruthy(),

        // packaged
        map(rst => {
          setTxPackaged({hash, blockHash: rst.blockHash})
          return eth_getTransactionCount({errorFallThrough: true}, [
            address.value,
            rst.blockNumber,
          ])
        }),
      )
      .subscribe(resolve({fail: keepTrack}))
      .transform(
        sideEffect(nonce => {
          if (
            BigNumber.from(nonce).gt(BigNumber.from(tx.txPayload.nonce).add(1))
          ) {
            if (tx.skippedChecked) {
              if (setTxSkipped({hash, skippedChecked: true})) {
                getExt().then(ext =>
                  ext.notifications.create(hash, {
                    title: 'Skipped transaction',
                    message: `Transaction ${parseInt(
                      tx.txPayload.nonce,
                      16,
                    )}  skipped!`,
                  }),
                )
              }
              updateBadge(getUnfinishedTxCount())
              return sdone()
            } else {
              setTxSkipped({hash})
              // check if skipped again immediately
              return keepTrack(0)
            }
          }
          keepTrack(0)
        }),
      )
  } else if (status === 3) {
    // ## packaged
    s.map(() => eth_getTransactionReceipt({errorFallThrough: true}, [hash]))
      .subscribe(resolve({fail: keepTrack}))
      .transform(
        sideEffect(rst => {
          !rst && keepTrack()
        }),
        keep(),
        sideEffect(rst => {
          const {
            status,
            blockHash,
            transactionIndex,
            blockNumber,
            contractAddress,
            cumulativeGasUsed,
            effectiveGasPrice,
            gasUsed,
            type,
            txExecErrorMsg,
          } = rst
          const receipt = {
            cumulativeGasUsed,
            effectiveGasPrice,
            type: type || '0x0',
            blockHash,
            transactionIndex,
            blockNumber,
            gasUsed,
          }
          if (contractAddress) receipt.contractCreated = contractAddress

          if (status === '0x1') {
            setTxExecuted({hash, receipt})
            keepTrack(0)
          } else {
            let err = ''
            if (txExecErrorMsg) {
              err = txExecErrorMsg
            }
            if (setTxFailed({hash, error: err || 'tx failed'})) {
              getExt().then(ext =>
                ext.notifications.create(hash, {
                  title: 'Failed transaction',
                  message:
                    txExecErrorMsg ||
                    `Transaction ${parseInt(
                      tx.txPayload.nonce,
                      16,
                    )} failed! ${err}`,
                }),
              )
            }
            updateBadge(getUnfinishedTxCount())
          }
        }),
        sideEffect(sdone),
      )
  } else if (status === 4) {
    // ## executed
    s.map(() => eth_blockNumber({errorFallThrough: true}, []))
      .subscribe(resolve({fail: keepTrack}))
      .transform(
        map(n => {
          if (
            n &&
            BigNumber.from(n).gte(BigNumber.from(tx.receipt.blockNumber))
          ) {
            setTxConfirmed({hash})
            updateBadge(getUnfinishedTxCount())
            return true
          }
          keepTrack()
          return false
        }),
        keepTruthy(), // filter non-null tx
        map(() => wallet_getBlockchainExplorerUrl({transaction: [hash]})),
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
