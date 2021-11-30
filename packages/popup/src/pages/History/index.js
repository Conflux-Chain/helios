import {useTranslation} from 'react-i18next'
import {TitleNav} from '../../components'
import HistoryItem from './components/HistoryItem'

function History() {
  const {t} = useTranslation()
  return (
    <div id="historyContainer" className="bg-bg h-full">
      <TitleNav title={t('activity')} />
      <main>
        <HistoryItem
          itemData={{
            status: 'failed',
            isDapp: true,
            protocol: 'uniswap v2',
            dappUrl: 'xxxx',
            scanUrl: 'https://testnet.confluxscan.io/',
            methodName: 'transferFrom',
            toAddress: 'cfxtest:aapg6k55852jv1z2rkmk8wtd2amn2tnw3amfnmyx9b',
            amount: '1000',
          }}
        />
        {/* <HistoryItem
          itemData={{
            status: 'completed',
            isDapp: false,
            scanUrl: 'https://testnet.confluxscan.io/',
            toAddress: 'cfxtest:aapg6k55852jv1z2rkmk8wtd2amn2tnw3amfnmyx9b',
            amount: '1000',
            methodName: 'send',
          }}
        /> */}
      </main>
    </div>
  )
}

export default History
