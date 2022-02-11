import {mapp} from '@fluent-wallet/spec'
import {stream, resolve, CloseMode} from '@thi.ng/rstream'
import {capture as sentryCaptureError} from '@fluent-wallet/sentry'
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
import {BigNumber} from '@ethersproject/bignumber'
import {identity} from '@fluent-wallet/compose'

export const NAME = 'wallet_handleUnfinishedETHTx'

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
      () => wallet_handleUnfinishedETHTx({tx: tx.eid, address: address.eid}),
      delay,
    )
  }
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

            const {errorType, shouldDiscard} = processError(err)
            const isDuplicateTx = errorType === 'duplicateTx'

            if (errorType === 'unknownError')
              sentryCaptureError(err, {
                tags: {
                  custome_type: 'unknown sendTx error',
                  rpc_network: network.name,
                },
              })

            defs({
              failed: shouldDiscard && {errorType, err},
              sameAsSuccess: isDuplicateTx,
              resend: !shouldDiscard && !isDuplicateTx,
            })
              .transform(
                branchObj({
                  failed: [
                    sideEffect(
                      ({err}) =>
                        typeof failedCb === 'function' && failedCb(err),
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
                    sideEffect(() => {
                      updateBadge(getUnfinishedTxCount())
                    }),
                  ],
                  resend: sideEffect(keepTrack),
                  // retry in next run
                  sameAsSuccess: [
                    sideEffect(() => setTxPending({hash})),
                    sideEffect(() => typeof okCb === 'function' && okCb(hash)),
                    sideEffect(keepTrack),
                  ],
                }),
              )
              .done()
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
          eth_blockNumber({errorFallThrough: true}, ['latest'])
            .then(n => {
              if (
                (!tx.resendAt && !tx.blockNumber) ||
                n !== (tx.resendAt || tx.blockNumber)
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
          return eth_getTransactionCount([address.value])
        }),
      )
      .subscribe(resolve({fail: keepTrack}))
      .transform(
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
            gasUsed,
          } = rst
          const receipt = {
            blockHash,
            transactionIndex,
            blockNumber,
            gasUsed,
          }
          if (contractAddress) receipt.contractCreated = contractAddress

          if (status === '0x1') {
            setTxExecuted({hash, receipt})
            keepTrack(50 * cacheTime)
          } else {
            setTxFailed({hash, err: 'tx failed'})
            updateBadge(getUnfinishedTxCount())
            getExt().then(ext =>
              ext.notifications.create(hash, {
                title: 'Failed transaction',
                message: `Transaction ${parseInt(
                  tx.txPayload.nonce,
                  16,
                )} failed!`,
              }),
            )
          }
        }),
        sideEffect(sdone),
      )
  } else if (status === 4) {
    // ## executed
    s.map(() => eth_blockNumber(['latest']))
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
          keepTrack(50 * cacheTime)
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
