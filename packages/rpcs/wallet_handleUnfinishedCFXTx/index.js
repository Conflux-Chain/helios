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
  pluck,
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
    'cfx_epochNumber',
    'cfx_sendRawTransaction',
    'cfx_getTransactionByHash',
    'cfx_getTransactionReceipt',
    'wallet_handleUnfinishedCFXTx',
    'wallet_getBlockchainExplorerUrl',
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
    wallet_getBlockchainExplorerUrl,
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
  // this only happens in integration test
  if (!tx) return
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
  // 当切到别的网络的时候 上一个网络还有pending 交易的处理
  // 为什么会有这种case。因为这里的逻辑 是用keepTrack不断的循环调用当前的方法
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
            // 这里在前面生成交易hash的时候 用的是 eth_blockNumber/cfx_blockNumber.这里更新一下正确的hash
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
    // setTxSending 把 tx status 设为1
    s.transform(
      sideEffect(() => setTxSending({hash})),
      sideEffect(() => updateBadge(getUnfinishedTxCount())),
    )
      .map(() => {
        return cfx_sendRawTransaction({errorFallThrough: true}, [raw])
      })
      // 发送错误处理
      .subscribe(
        resolve({
          fail: err => {
            // failed to send
            setTxUnsent({hash})

            const {errorType, shouldDiscard} = processError(err)
            const isDuplicateTx = errorType === 'duplicateTx'
            const resendNonceTooStale =
              tx.resendAt && errorType === 'tooStaleNonce'

            const sameAsSuccess = isDuplicateTx || resendNonceTooStale
            const failed = !sameAsSuccess && shouldDiscard

            if (errorType === 'unknownError')
              sentryCaptureError(err, {
                tags: {
                  custom_type: 'unknown sendTx error',
                  rpc_network: network.name,
                },
              })

            defs({
              failed: failed && {errorType, err},
              sameAsSuccess,
              resend: !shouldDiscard && !sameAsSuccess,
            })
              .transform(
                branchObj({
                  // 根据上面的参数 failed，sameAsSuccess，resend的值 哪个为true就执行对应的方法（数组）
                  failed: [
                    sideEffect(
                      ({err}) =>
                        typeof failedCb === 'function' && failedCb(err),
                    ),
                    sideEffect(({errorType}) => {
                      // setTxFailed 删除 tx/raw 的value 同时把tx/status 设为-1
                      if (setTxFailed({hash, error: errorType})) {
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
        // setTxPending 把status设置为2 继续下一轮循环
        sideEffect(() => setTxPending({hash})),
        sideEffect(() => typeof okCb === 'function' && okCb(hash)),
        sideEffect(keepTrack),
      )
  } else if (status === 1) {
    // ## sending
  } else if (status === 2) {
    // ## pending
    s.map(() => cfx_getTransactionByHash({errorFallThrough: true}, [hash]))
      .subscribe(resolve({fail: keepTrack}))
      .transform(
        // not packaged or no blockhash in getTransactionByHash result
        map(rst => {
          if (rst && rst.blockHash) return rst
          // getTransactionByHash return null
          // 如果拿不到block hash 就去拿最近成功的epoch number
          // 如果当前交易的height 和 epoch height 相差5 就冲洗发送交易
          // 为什么这么处理。这里可能涉及到公链的底层逻辑。回头可以和pana确认一下
          cfx_epochNumber({errorFallThrough: true}, ['latest_state'])
            .then(n => {
              if (
                BigNumber.from(n)
                  .sub(BigNumber.from(tx.resendAt || tx.txPayload.epochHeight))
                  .gte(5)
              ) {
                setTxUnsent({hash, resendAt: n})
              }
            })
            .catch(identity)
          return keepTrack()
        }),
        keepTruthy(),

        // packaged
        // status: https://developer.confluxnetwork.org/conflux-doc/docs/json_rpc#cfx_gettransactionbyhash
        // 0 for success
        // 1 if an error occurred
        // 2 for skiped
        // null when the transaction is skipped or not packed.

        map(rst => {
          setTxPackaged({hash, blockHash: rst.blockHash})
          const {status} = rst
          return {
            failed: status === '0x1',
            skipped: status === '0x2',
            executed: status === '0x0',
            statusNull: status === null,
          }
        }),
      )
      .transform(
        branchObj({
          failed: map(() => {
            sdone()
            // get the error message in receipt
            cfx_getTransactionReceipt({errorFallThrough: true}, [hash])
              .then(receipt => {
                let err = ''
                if (receipt?.txExecErrorMsg) {
                  err = receipt.txExecErrorMsg
                }
                setTxFailed({
                  hash,
                  error: err || 'tx failed',
                })
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
              .catch(() => {
                setTxPending({hash})
                keepTrack()
              })
          }),
          skipped: map(() => {
            setTxSkipped({hash, skippedChecked: true})
            updateBadge(getUnfinishedTxCount())
            wallet_getBlockchainExplorerUrl({transaction: [hash]}).then(
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
            sdone()
          }),
          executed: map(keepTrack),
          statusNull: map(() => {
            setTxPending({hash})
            return cfx_getNextNonce({errorFallThrough: true}, [address.value])
          }),
        }),
        pluck('statusNull'),
        keepTruthy(),
      )
      .subscribe(resolve({fail: keepTrack}))
      .transform(
        // 这里的nonce 来自上面的 statusNull
        // pluck 只把statusNull的结果给择出来给 transform了
        sideEffect(nonce => {
          // next nonce 比交易的nonce大 证明不是交易nonce 的问题
          if (BigNumber.from(nonce).gt(BigNumber.from(tx.txPayload.nonce))) {
            if (tx.skippedChecked) {
              // 如果是skipped 就算求了 status 设置为-2 结束
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
              // 这里只是 设置了skippedChecked 为true 继续根据 status === 2 去执行
              // 因为 走到这里 是因为 skippedChecked false
              // skippedChecked false  没有执行 skipped 方法 交易还在交易池里 获取继续轮训 等待更新状态
              setTxSkipped({hash})
              return keepTrack(0)
            }
          }
          keepTrack(0)
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
            storageCoveredBySponsor,
            gasCoveredBySponsor,
            storageReleased, // array
          } = rst
          const receipt = {
            blockHash,
            index,
            epochNumber,
            gasUsed,
            gasFee,
            storageCollateralized,
            gasCoveredBySponsor,
            storageCoveredBySponsor,
          }
          if (storageReleased?.length) receipt.storageReleased = storageReleased
          if (contractCreated) receipt.contractCreated = contractCreated

          if (outcomeStatus === '0x0') {
            setTxExecuted({hash, receipt})
            keepTrack()
          } else {
            if (setTxFailed({hash, error: txExecErrorMsg})) {
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
            updateBadge(getUnfinishedTxCount())
          }
        }),
        sideEffect(sdone),
      )
  } else if (status === 4) {
    // ## executed
    s.map(() => cfx_epochNumber({errorFallThrough: true}, ['latest_confirmed']))
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
