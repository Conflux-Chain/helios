import {useTranslation} from 'react-i18next'
import {useState, useRef, useEffect} from 'react'
import {TitleNav} from '../../components'
import HistoryItem from './components/HistoryItem'
import {useTxList} from '../../hooks/useApi'
import {historyPageLimit} from '../../constants'
function History() {
  const {t} = useTranslation()
  const historyRef = useRef(null)
  const [txList, setTxList] = useState([])
  const [limit, setLimit] = useState(historyPageLimit)
  const [total, setTotal] = useState(0)
  const historyListData = useTxList({limit})

  // TODO:loading
  const onScroll = () => {
    if (
      historyRef.current.scrollHeight - historyRef.current.clientHeight <=
        historyRef.current.scrollTop &&
      txList.length < total &&
      limit < total
    ) {
      setLimit(limit + historyPageLimit)
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
      id="historyContainer"
      className="bg-bg h-full overflow-auto relative"
      onScroll={onScroll}
      ref={historyRef}
    >
      <TitleNav title={t('activity')} />
      <main>
        {txList.length ? (
          txList.map(
            ({status, created, txExtra, txPayload, app, token, hash, eid}) => (
              <HistoryItem
                key={eid}
                status={status}
                created={created}
                extra={txExtra}
                payload={txPayload}
                app={app}
                token={token}
                hash={hash}
              />
            ),
          )
        ) : (
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
