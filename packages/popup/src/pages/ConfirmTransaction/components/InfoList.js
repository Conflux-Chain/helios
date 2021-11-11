import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {EditOutlined} from '@fluent-wallet/component-icons'
import {useCurrentDapp, useCurrentNetwork} from '../../../hooks/useApi'
import {DisplayBalance} from '../../../components'

const CurrentNetworkDisplay = ({currentNetwork}) => {
  const {name, icon} = currentNetwork

  return (
    <div className="flex items-center">
      <img
        className="w-4 h-4 mr-1"
        src={icon || '/images/default-network-icon.svg'}
        alt="logo"
      />
      <span className="text-gray-80 mr-1">{name}</span>
    </div>
  )
}

CurrentNetworkDisplay.propTypes = {
  currentNetwork: PropTypes.object,
}

function InfoList({
  isDapp,
  isApproveToken,
  isSign,
  token,
  allowance,
  method,
  pendingAuthReq,
}) {
  const {t} = useTranslation()
  const data = useCurrentDapp()
  const network = useCurrentNetwork()
  const [{app}] = pendingAuthReq?.length ? pendingAuthReq : [{}]
  //TODO app data confirm
  const currentDapp = isDapp ? app?.app : data?.app
  const currentNetwork = isDapp ? app?.currentNetwork : network
  return (
    <div className="flex flex-col">
      <div className="flex justify-between mb-4">
        <span className="text-gray-40">{t('network')}</span>
        <CurrentNetworkDisplay currentNetwork={currentNetwork} />
      </div>
      {isApproveToken && (
        <div className="flex justify-between mb-4">
          <span className="text-gray-40">{t('allowLimit')}</span>
          <span>
            <DisplayBalance
              balance={allowance}
              maxWidth={256}
              maxWidthStyle="max-w-[256px]"
              decimals={token?.decimals}
              symbol={token?.symbol}
            />
            <EditOutlined className="w-4 h-4 ml-1 cursor-pointer" />
          </span>
        </div>
      )}
      {isSign && (
        <div className="flex justify-between mb-4">
          <span className="text-gray-40">{t('action')}</span>
          <span className="text-gray-80">{method}</span>
        </div>
      )}
      {isDapp && (
        <div className="flex justify-between mb-4">
          <span className="text-gray-40">{t('protocol')}</span>
          <span className="text-gray-80">
            <img
              src={currentDapp?.site?.icon || '/default-dapp-icon.svg'}
              alt="icon"
              className="w-4 h-4 mr-1"
            />
            {currentDapp?.site?.origin}
          </span>
        </div>
      )}
    </div>
  )
}

InfoList.propTypes = {
  isApproveToken: PropTypes.bool,
  isSign: PropTypes.bool,
  token: PropTypes.object,
  isDapp: PropTypes.bool,
  allowance: PropTypes.string,
  method: PropTypes.string,
  pendingAuthReq: PropTypes.array,
}

export default InfoList
