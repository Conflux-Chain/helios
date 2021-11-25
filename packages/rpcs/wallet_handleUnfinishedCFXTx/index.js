import {mapp} from '@fluent-wallet/spec'
import {stream, resolve, CloseMode} from '@thi.ng/rstream'
import {sideEffect, map} from '@fluent-wallet/transducers'
import {processError} from '@fluent-wallet/conflux-tx-error'
import {BigNumber} from '@ethersproject/bignumber'

export const NAME = 'wallet_handleUnfinishedCFXTx'

function defstream(id, src) {
  const s = stream({
    id,
    closeIn: CloseMode.FIRST,
    closeOut: false,
    cache: true,
  })
  s.next(src)
  return s
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
    'cfx_getNextNonce',
  ],
  db: [
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
    wallet_handleUnfinishedCFXTx,
  },
  db: {
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
  const s = defstream(hash, {tx, address})
  const sdone = () => s.done()
  const keepTrack = () => {
    sdone()
    return wallet_handleUnfinishedCFXTx({tx: tx.eid, address: address.eid})
  }

  // unsent
  if (status === 0) {
    s.transform(
      sideEffect(() => {
        setTxSending({hash})
      }),
    )
      .map(() => {
        return cfx_sendRawTransaction({errorFallThrough: true}, [raw])
      })
      .subscribe(
        resolve({
          fail: err => {
            setTxUnsent({hash})
            const processedErr = processError(err)
            if (processedErr.shouldDiscard) {
              delete processedErr.shouldDiscard
              const [errorType] = Object.keys(processedErr)
              setTxFailed({hash, error: errorType})
              if (typeof failedCb === 'function') failedCb(err)
            }

            if (processedErr.duplicateTx) {
              setTxPending({hash})
              keepTrack()
              return hash
            }

            keepTrack()
            // retry in next run
          },
        }),
      )
      .transform(
        sideEffect(() => setTxPending({hash})),
        sideEffect(() => {
          typeof okCb === 'function' && okCb(hash)
        }),
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
          if (status === '0x1') return setTxFailed({hash})
          if (status === '0x2') return setTxSkipped({hash})
          keepTrack()
        }),
        map(rst => {
          if (rst) return Promise.resolve(false)
          return cfx_getNextNonce([address.base32])
        }),
      )
      .subscribe(resolve({fail: keepTrack}))
      .transform(
        sideEffect(nonce => {
          if (!nonce) return
          if (nonce > tx.payload.nonce) {
            setTxSkipped({hash})
            sdone()
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
        sideEffect(rst => {
          if (!rst) return
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
        sideEffect(n => {
          if (
            n &&
            BigNumber.from(n).gte(BigNumber.from(tx.receipt.epochNumber))
          ) {
            setTxConfirmed({hash})
            return sdone()
          }
          keepTrack()
        }),
      )
    return
  }
}
