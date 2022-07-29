import {useTranslation} from 'react-i18next'
import {useState, useRef, useEffect, useCallback} from 'react'
import {TitleNav, NoResult} from '../../components'
import {HistoryItem} from './components'
import {useTxList, useBlockchainExplorerUrl} from '../../hooks/useApi'
import {setScrollPageLimit} from '../../utils'
import {PAGE_LIMIT} from '../../constants'

function History() {
  const {t} = useTranslation()
  const historyRef = useRef(null)
  const [txList, setTxList] = useState(undefined)
  const [limit, setLimit] = useState(PAGE_LIMIT)
  const [total, setTotal] = useState(0)
  const {data: historyListData} = useTxList({
    params: {
      limit,
    },
    includeExternalTx: true,
  })
  const {transaction: transactionUrls} = useBlockchainExplorerUrl(
    historyListData?.data
      ? {transaction: historyListData?.data.map(d => d.hash)}
      : null,
  )

  const onScroll = useCallback(() => {
    setScrollPageLimit(historyRef?.current, setLimit, txList, total, limit)
  }, [txList, limit, total])

  useEffect(() => {
    if (historyListData?.total !== total) {
      setTotal(historyListData.total)
    }
    if (historyListData?.data) {
      setTxList([...historyListData.data])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyListData?.data])

  console.log('txList', txList)
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
        ref={historyRef}
      >
        {txList?.length > 0 &&
          txList.map(
            (
              {
                status,
                created,
                txExtra,
                txPayload,
                app,
                token,
                eid,
                hash,
                err,
                fromScan,
                receipt,
              },
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
                receipt={receipt}
                err={err}
                fromScan={fromScan}
                copyButtonContainerClassName={index === 0 ? '' : undefined}
                copyButtonToastClassName={
                  index === 0 ? 'top-10 right-3' : undefined
                }
                transactionUrl={transactionUrls?.[index]}
              />
            ),
          )}
        {txList?.length === 0 && <NoResult content={t('noResult')} />}
      </main>
    </div>
  )
}

export default History
