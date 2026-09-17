import PropTypes from 'prop-types'
import Tooltip from '@fluent-wallet/component-tooltip'
import ImageWithFallback from './ImageWithFallback'
import {useValid20Token} from '../hooks/useApi'

const PermitTokenInfo = ({tokenAddress, children}) => {
  const token = useValid20Token(tokenAddress || '')
  return (
    <div className="flex items-center gap-1 text-[14px] leading-[16px] font-semibold">
      {children?.(token)}
      <ImageWithFallback
        src={token?.logoURI}
        fallback="/images/default-token-icon.svg"
        alt=""
        className="h-4 w-4 rounded-full"
      />
      <Tooltip content={tokenAddress} placement="bottomLeft">
        <span>{token?.symbol || 'Token'}</span>
      </Tooltip>
    </div>
  )
}

PermitTokenInfo.propTypes = {
  tokenAddress: PropTypes.string.isRequired,
  children: PropTypes.func,
}

export default PermitTokenInfo
