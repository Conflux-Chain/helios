import {useTranslation} from 'react-i18next'
import PropTypes from 'prop-types'
import {useValid20Token} from '../../../hooks/useApi'
import {formatPermitAmount} from '../../../utils/permit'
import Tooltip from '@fluent-wallet/component-tooltip'

const PermitAmount = ({type, amount, tokenAddress}) => {
  const {t} = useTranslation()
  const amountBits = Number(type.replace('uint', ''))
  const token = useValid20Token(tokenAddress || '')
  const displayAmount = formatPermitAmount(
    amount,
    token?.decimals,
    amountBits,
    t('unlimited'),
  )
  return (
    <Tooltip content={displayAmount} placement="bottomLeft">
      <span className="truncate">{displayAmount}</span>
    </Tooltip>
  )
}

PermitAmount.propTypes = {
  type: PropTypes.string.isRequired,
  amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  tokenAddress: PropTypes.string,
}

export default PermitAmount
