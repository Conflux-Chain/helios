import PropTypes from 'prop-types'
import {useValid20Token} from '../../../hooks/useApi'
import Tooltip from '@fluent-wallet/component-tooltip'
import {convertDataToValue, formatBalance} from '@fluent-wallet/data-format'

const PermitAmount = ({amount, tokenAddress}) => {
  const token = useValid20Token(tokenAddress || '')
  const amountStr = String(amount)
  return (
    <Tooltip
      content={convertDataToValue(amountStr, token?.decimals)}
      placement="bottomLeft"
    >
      <span className="truncate">
        {formatBalance(amountStr, token?.decimals)}
      </span>
    </Tooltip>
  )
}

PermitAmount.propTypes = {
  amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  tokenAddress: PropTypes.string,
}

export default PermitAmount
