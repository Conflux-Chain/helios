import PropTypes from 'prop-types'
import Tooltip from '@fluent-wallet/component-tooltip'
import {useTranslation} from 'react-i18next'
import {formatNsName} from '../utils'
function NsNameLabel({nsName = '', className = ''}) {
  const {t} = useTranslation()

  return (
    <Tooltip
      content={
        <div>
          <div>{t('web3Name')}</div>
          <div>{nsName}</div>
        </div>
      }
    >
      <div className={`flex items-center ${className}`}>
        <img src="/images/ns-logo.svg" alt="group-icon" className="w-6 h-6" />
        <div className="ml-0.5 text-primary text-ellipsis max-w-[140px]">
          {formatNsName(nsName)}
        </div>
      </div>
    </Tooltip>
  )
}

NsNameLabel.propTypes = {
  nsName: PropTypes.string,
  className: PropTypes.string,
}

export default NsNameLabel
