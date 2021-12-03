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
  const listData = useTxList({limit})

  // TODO:loading
  const onScroll = () => {
    if (
      historyRef.current.scrollHeight - historyRef.current.clientHeight <=
      historyRef.current.scrollTop
    ) {
      if (txList.length < total && limit < total) {
        setLimit(limit + historyPageLimit)
      }
    }
  }
  useEffect(() => {
    if (listData?.total !== total) {
      setTotal(listData.total)
    }
    if (listData?.data) {
      setTxList([...listData.data])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Object.keys(listData).length])

  return (
    <div
      id="historyContainer"
      className="bg-bg h-full overflow-auto"
      onScroll={onScroll}
      ref={historyRef}
    >
      <TitleNav title={t('activity')} />
      <main>
        {txList.map(data => (
          <HistoryItem key={data.eid} txData={data} />
        ))}
      </main>
    </div>
  )
}

export default History
