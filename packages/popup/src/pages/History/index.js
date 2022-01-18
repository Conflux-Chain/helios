import {useTranslation} from 'react-i18next'
import {useState, useRef, useEffect} from 'react'
import {TitleNav} from '../../components'
import HistoryItem from './components/HistoryItem'
import {useTxList, useBlockchainExplorerUrl} from '../../hooks/useApi'
import useLoading from '../../hooks/useLoading'
import {composeRef} from '../../utils'
import {HISTORY_PAGE_LIMIT} from '../../constants'
function History() {
  const {t} = useTranslation()
  const historyRef = useRef(null)
  const [txList, setTxList] = useState(undefined)
  const [limit, setLimit] = useState(HISTORY_PAGE_LIMIT)
  const [total, setTotal] = useState(0)
  const historyListData = useTxList({limit})
  const {transaction: transactionUrls} = useBlockchainExplorerUrl(
    historyListData?.data
      ? {transaction: historyListData?.data.map(d => d.hash)}
      : null,
  )
  const {ref: loadingRef, setLoading} = useLoading({type: 'Spin', delay: 666})

  useEffect(() => {
    setLoading(txList === undefined)
  }, [txList])

  const onScroll = () => {
    if (
      historyRef.current.scrollHeight - historyRef.current.clientHeight <=
        historyRef.current.scrollTop &&
      txList?.length < total &&
      limit < total
    ) {
      setLimit(limit + HISTORY_PAGE_LIMIT)
    }
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
      className="bg-bg h-full w-full  relative flex flex-col"
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
                transactionUrl={transactionUrls?.[index]}
              />
            ),
          )}
        {txList?.length === 0 && (
          <div className="flex  items-center flex-col">
            <img
              src="/images/no-available-token.svg"
              alt="no result"
              className="w-33 h-24 mt-13 mb-4"
              data-clear-btn="true"
            />
            <p className="text-sm text-gray-40">{t('noResult')}</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default History
