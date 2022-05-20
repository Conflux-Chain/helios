import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import Tooltip from '@fluent-wallet/component-tooltip'
import {CustomTag} from '../../../components'
import {NETWORK_TYPE} from '../../../constants'

function LedgerGroupTag({networkType}) {
  const {t} = useTranslation()
  const network =
    networkType === NETWORK_TYPE.CFX
      ? 'Conflux Core'
      : networkType === NETWORK_TYPE.ETH
      ? 'EVM Chain'
      : ''

  return (
    <CustomTag
      width="w-auto"
      className="absolute right-0 top-0 px-2 text-2xs"
      backgroundColor={`${
        networkType === NETWORK_TYPE.CFX ? 'bg-[#1E3DE4]' : 'bg-[#17B38A]'
      }`}
    >
      <Tooltip content={t('ledgerTips', {network})} placement="topLeft">
        <span className="text-white">{network}</span>
      </Tooltip>
    </CustomTag>
  )
}

LedgerGroupTag.propTypes = {
  networkType: PropTypes.string,
}
export default LedgerGroupTag
