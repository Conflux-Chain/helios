import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {EditOutlined} from '@fluent-wallet/component-icons'
import {useCurrentDapp, useCurrentNetwork} from '../../../hooks/useApi'
import {DisplayBalance, GasFee} from '../../../components'

const CurrentNetworkDisplay = () => {
  const currentNetwork = useCurrentNetwork()
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

function InfoList({isDapp, isApproveToken, isSign, token, allowance, method}) {
  const {t} = useTranslation()
  const data = useCurrentDapp()
  return (
    <div className="flex flex-col">
      <div className="flex justify-between mb-4">
        <span className="text-gray-40">{t('network')}</span>
        <CurrentNetworkDisplay />
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
              src={data?.app?.site?.icon || '/default-dapp-icon.svg'}
              alt="icon"
              className="w-4 h-4 mr-1"
            />
            {data?.app?.site?.origin}
          </span>
        </div>
      )}
      <GasFee />
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
}

export default InfoList
