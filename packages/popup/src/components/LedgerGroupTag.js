import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import Tooltip from '@fluent-wallet/component-tooltip'
import {CustomTag} from '.'
import {NETWORK_TYPE} from '../constants'
import {getBaseChainName} from '../utils'

function LedgerGroupTag({networkType}) {
  const {t} = useTranslation()
  const networkName = getBaseChainName(networkType)

  return (
    <CustomTag
      width="w-auto"
      className="absolute right-0 top-0 px-2 text-2xs"
      backgroundColor={`${
        networkType === NETWORK_TYPE.CFX ? 'bg-[#1E3DE4]' : 'bg-[#17B38A]'
      }`}
    >
      <Tooltip
        content={t('ledgerTips', {network: networkName})}
        placement="topLeft"
      >
        <span className="text-white">{networkName}</span>
      </Tooltip>
    </CustomTag>
  )
}

LedgerGroupTag.propTypes = {
  networkType: PropTypes.string,
}
export default LedgerGroupTag
