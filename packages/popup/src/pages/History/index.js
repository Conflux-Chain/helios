import {useTranslation} from 'react-i18next'
import {useState, useRef, useEffect} from 'react'
import {TitleNav, NoResult} from '../../components'
import {HistoryItem, ResendTransaction} from './components'
import {useTxList, useBlockchainExplorerUrl} from '../../hooks/useApi'
import useLoading from '../../hooks/useLoading'
import {composeRef, formatStatus} from '../../utils'
import {PAGE_LIMIT} from '../../constants'

function History() {
  const {t} = useTranslation()
  const historyRef = useRef(null)
  const [txList, setTxList] = useState(undefined)
  const [limit, setLimit] = useState(PAGE_LIMIT)
  const [total, setTotal] = useState(0)
  const {data: historyListData, mutate: refreshHistoryData} = useTxList({
    limit,
  })
  // open speed up / cancel tx modal. value must be empty,cancel or speedup
  const [reSendType, setReSendType] = useState('')

  const [reSendTxStatus, setReSendTxStatus] = useState('')
  const [transactionRecord, setTransactionRecord] = useState({
    hash: '',
    payload: {},
    token: {},
    extra: {},
  })

  const {transaction: transactionUrls} = useBlockchainExplorerUrl(
    historyListData?.data
      ? {transaction: historyListData?.data.map(d => d.hash)}
      : null,
  )
  const {ref: loadingRef, setLoading} = useLoading({type: 'Spin', delay: 666})

  useEffect(() => {
    setLoading(txList === undefined)

    const {hash: resendHash} = transactionRecord
    if (resendHash) {
      const filterTx = txList.filter(({hash}) => resendHash === hash)[0]
      if (filterTx) {
        setReSendTxStatus(formatStatus(filterTx.status))
      }
    }
  }, [txList, transactionRecord, setLoading])

  const onScroll = () => {
    if (
      historyRef.current.scrollHeight - historyRef.current.clientHeight <=
        historyRef.current.scrollTop &&
      txList?.length < total &&
      limit < total
    ) {
      setLimit(limit + PAGE_LIMIT)
    }
  }

  const onResendTx = (type, record) => {
    setReSendTxStatus('pending')
    setReSendType(type)
    setTransactionRecord({...record})
  }

  const onCancelResendTx = () => {
    setReSendType('')
    setReSendTxStatus('')
    setTransactionRecord({payload: {}, token: {}, extra: {}, hash: ''})
  }

  useEffect(() => {
    if (historyListData?.total !== total) {
      setTotal(historyListData.total)
    }
    if (historyListData?.data) {
      setTxList([...historyListData.data])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyListData?.data])

  return (
    <div
      id="history-container"
      className="bg-bg h-full w-full  relative flex flex-col pb-3"
    >
      <TitleNav title={t('activity')} />
      <main
        id="history-content"
        className="flex-1 overflow-auto no-scroll"
        onScroll={onScroll}
        ref={composeRef(historyRef, loadingRef)}
      >
        {txList?.length > 0 &&
          txList.map(
            (
              {status, created, txExtra, txPayload, app, token, eid, hash},
              index,
            ) => (
              <HistoryItem
                key={eid}
                status={status}
                created={created}
                extra={txExtra}
                payload={txPayload}
                app={app}
                token={token}
                hash={hash}
                copyButtonContainerClassName={index === 0 ? '' : undefined}
                copyButtonToastClassName={
                  index === 0 ? 'top-10 right-3' : undefined
                }
                transactionUrl={transactionUrls?.[index]}
                onResend={onResendTx}
              />
            ),
          )}
        {txList?.length === 0 && <NoResult content={t('noResult')} />}
        <ResendTransaction
          onClose={onCancelResendTx}
          reSendType={reSendType}
          reSendTxStatus={reSendTxStatus}
          transactionRecord={transactionRecord}
          refreshHistoryData={refreshHistoryData}
        />
      </main>
    </div>
  )
}

export default History
