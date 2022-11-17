import PropTypes from 'prop-types'
import Tooltip from '@fluent-wallet/component-tooltip'
import {useTranslation} from 'react-i18next'

function EnsNameLabel({ensName = '', className = ''}) {
  const {t} = useTranslation()

  return (
    <Tooltip
      content={
        <div>
          <div>{t('web3Name')}</div>
          <div>{ensName}</div>
        </div>
      }
    >
      <div className={`flex items-center ${className}`}>
        <img
          src="/images/seed-group-icon.svg"
          alt="group-icon"
          className="w-6 h-6"
        />
        {/* TODO: 计算字符长度 */}
        <div className="ml-0.5 text-primary text-ellipsis max-w-[140px]">
          {ensName}
        </div>
      </div>
    </Tooltip>
  )
}

EnsNameLabel.propTypes = {
  ensName: PropTypes.string,
  className: PropTypes.string,
}

export default EnsNameLabel
