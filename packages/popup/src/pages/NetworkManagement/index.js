import {useTranslation} from 'react-i18next'
import {useHistory} from 'react-router-dom'
import {TitleNav, NetworkContent} from '../../components'
import {ROUTES} from '../../constants'
import useGlobalStore from '../../stores'
const {NETWORK_DETAIL} = ROUTES

function NetworkManagement() {
  const {t} = useTranslation()
  const history = useHistory()
  const {setNetworkInfo} = useGlobalStore()

  const onClickNetworkItem = data => {
    setNetworkInfo(data)
    history.push(NETWORK_DETAIL)
  }
  return (
    <div
      id="network-management"
      className="bg-bg pb-8 h-full w-full flex flex-col"
    >
      <TitleNav
        title={t('networkManagement')}
        rightButton={
          <span
            id="add-chain"
            aria-hidden
            className="text-primary text-sm mr-1 hover:text-[#5D5FEF]"
            onClick={() => history.push(NETWORK_DETAIL)}
          >
            {t('add')}
          </span>
        }
      />
      <div className="flex-1 overflow-y-auto no-scroll px-3 mt-1">
        <NetworkContent
          showAllNetwork={true}
          showCurrentIcon={false}
          needSwitchNet={false}
          onClickNetworkItem={onClickNetworkItem}
        />
      </div>
    </div>
  )
}

export default NetworkManagement
