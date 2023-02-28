import PropTypes from 'prop-types'
import Tooltip from '@fluent-wallet/component-tooltip'
import {useTranslation} from 'react-i18next'
import {formatNsName} from '../utils'
import {NETWORK_TYPE} from '../constants'
import {useCurrentAddress} from '../hooks/useApi'

function NsNameLabel({nsName = '', className = '', toolTipPlacement = 'top'}) {
  const {t} = useTranslation()
  const {
    data: {
      network: {type},
    },
  } = useCurrentAddress()
  return (
    <Tooltip
      placement={toolTipPlacement}
      content={
        <div>
          <div>{t('web3Name')}</div>
          <div>{nsName}</div>
        </div>
      }
    >
      <div className={`flex items-center ${className}`}>
        {type === NETWORK_TYPE.CFX && (
          <img
            src="/images/cns-logo.svg"
            alt="group-icon"
            className="w-6 h-6"
          />
        )}
        {type === NETWORK_TYPE.ETH && (
          <img
            src="/images/ens-logo.svg"
            alt="group-icon"
            className="w-6 h-6"
          />
        )}
        <div className="ml-0.5 text-primary text-ellipsis max-w-[140px]">
          {formatNsName(nsName)}
        </div>
      </div>
    </Tooltip>
  )
}

NsNameLabel.propTypes = {
  nsName: PropTypes.string,
  toolTipPlacement: PropTypes.string,
  className: PropTypes.string,
}

export default NsNameLabel
