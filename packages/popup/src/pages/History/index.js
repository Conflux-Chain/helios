import {useTranslation} from 'react-i18next'
import {useState, useRef, useEffect, useCallback} from 'react'
import {TitleNav, NoResult} from '../../components'
import {HistoryItem, UserOperationHistoryItem} from './components'
import {useTxList, useBlockchainExplorerUrl} from '../../hooks/useApi'
import {setScrollPageLimit} from '../../utils'
import {PAGE_LIMIT} from '../../constants'

const getExplorerTransactionHash = item =>
  item.type === 'userOperation' ? item.transactionHash : item.hash

function History() {
  const {t} = useTranslation()
  const historyRef = useRef(null)
  const [txList, setTxList] = useState(undefined)
  const [limit, setLimit] = useState(PAGE_LIMIT)
  const [offset, setOffset] = useState(0)
  const [total, setTotal] = useState(0)
  const {data: historyListData} = useTxList({
    params: {
      limit,
      offset,
    },
    includeExternalTx: true,
  })
  const transactionHashes =
    historyListData?.data?.map(getExplorerTransactionHash).filter(Boolean) || []

  const {transaction: transactionUrls} = useBlockchainExplorerUrl(
    transactionHashes.length ? {transaction: transactionHashes} : null,
  )

  const transactionUrlByHash = transactionHashes.reduce((urls, hash, index) => {
    urls[hash] = transactionUrls?.[index]
    return urls
  }, {})

  const onScroll = useCallback(() => {
    setScrollPageLimit(
      historyRef?.current,
      setLimit,
      txList,
      total,
      limit,
      setOffset,
    )
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
          txList.map((item, index) => {
            const transactionHash = getExplorerTransactionHash(item)
            const transactionUrl = transactionHash
              ? transactionUrlByHash[transactionHash]
              : undefined
            const copyButtonContainerClassName = index === 0 ? '' : undefined
            const copyButtonToastClassName =
              index === 0 ? 'top-10 right-3' : undefined

            if (item.type === 'userOperation') {
              return (
                <UserOperationHistoryItem
                  key={`userOperation:${item.eid}`}
                  operation={item}
                  transactionUrl={transactionUrl}
                  copyButtonContainerClassName={copyButtonContainerClassName}
                  copyButtonToastClassName={copyButtonToastClassName}
                />
              )
            }

            return (
              <HistoryItem
                key={`transaction:${item.eid}`}
                status={item.status}
                created={item.created}
                extra={item.txExtra}
                payload={item.txPayload}
                app={item.app}
                token={item.token}
                hash={item.hash}
                receipt={item.receipt}
                err={item.err}
                pendingAt={item.pendingAt}
                copyButtonContainerClassName={copyButtonContainerClassName}
                copyButtonToastClassName={copyButtonToastClassName}
                transactionUrl={transactionUrl}
              />
            )
          })}
        {txList?.length === 0 && <NoResult content={t('noResult')} />}
      </main>
    </div>
  )
}

export default History
