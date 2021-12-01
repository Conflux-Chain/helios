import {useTranslation} from 'react-i18next'
import {TitleNav} from '../../components'
import HistoryItem from './components/HistoryItem'
import {useState, useEffect, useRef} from 'react'

function History() {
  const {t} = useTranslation()
  const historyRef = useRef(null)
  // mock
  const [txList, setTxList] = useState([])
  useEffect(() => {
    setTxList(new Array(6).fill(''))
  }, [])

  const onScroll = () => {
    if (
      historyRef.current.scrollHeight - historyRef.current.clientHeight <=
      historyRef.current.scrollTop
    ) {
      setTxList([...txList.concat(new Array(6).fill(''))])
    }
  }
  return (
    <div
      id="historyContainer"
      className="bg-bg h-full overflow-auto"
      onScroll={onScroll}
      ref={historyRef}
    >
      <TitleNav title={t('activity')} />
      <main>
        {txList.map((item, index) => (
          <HistoryItem
            key={index}
            itemData={{
              status: 'pending',
              isDapp: true,
              protocol: 'uniswap v2',
              dappUrl: 'xxxx',
              dappIcon: '',
              scanUrl: 'https://testnet.confluxscan.io/',
              methodName: 'transferFrom',
              toAddress: 'cfxtest:aapg6k55852jv1z2rkmk8wtd2amn2tnw3amfnmyx9b',
              amount: '-1000',
              symbol: 'cfx',
            }}
          />
        ))}
        {/* <HistoryItem
          itemData={{
            status: 'pending',
            isDapp: true,
            protocol: 'uniswap v2',
            dappUrl: 'xxxx',
            dappIcon: '',
            scanUrl: 'https://testnet.confluxscan.io/',
            methodName: 'transferFrom',
            toAddress: 'cfxtest:aapg6k55852jv1z2rkmk8wtd2amn2tnw3amfnmyx9b',
            amount: '-1000',
            symbol: 'cfx',
          }}
        />
        <HistoryItem
          itemData={{
            status: 'completed',
            isDapp: false,
            scanUrl: 'https://testnet.confluxscan.io/',
            toAddress: 'cfxtest:aapg6k55852jv1z2rkmk8wtd2amn2tnw3amfnmyx9b',
            methodName: 'send',
            nonce: '123231',
            time: '2021/11/21',
            symbol: 'CFX',
          }}
        /> */}
      </main>
    </div>
  )
}

export default History
