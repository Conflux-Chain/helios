import PropTypes from 'prop-types'
import {
  CloseOutlined,
  ReloadOutlined,
  SendOutlined,
  ReceiveOutlined,
} from '@fluent-wallet/component-icons'

import {WrapIcon} from '../../../components'

function HistoryStatusIcon({
  isExternalTx = false,
  isDapp = false,
  txStatus = '',
  dappIconUrl = '',
  className = '',
}) {
  const wrapperClassName = `${
    txStatus === 'confirmed' && isDapp ? '' : className
  }`

  return txStatus ? (
    isExternalTx ? (
      <WrapIcon className={wrapperClassName} size="w-8 h-8">
        {txStatus === 'confirmed' && <ReceiveOutlined className="w-4 h-4" />}
      </WrapIcon>
    ) : (
      <WrapIcon className={wrapperClassName} size="w-8 h-8">
        {txStatus === 'confirmed' && isDapp && (
          <img src={dappIconUrl} alt="favicon" className="w-5 h-5" />
        )}

        {txStatus === 'confirmed' && !isDapp && (
          <SendOutlined className="w-4 h-4" />
        )}

        {txStatus === 'executed' && <ReloadOutlined className="w-4 h-4" />}

        {txStatus === 'pending' && <ReloadOutlined className="w-4 h-4" />}

        {txStatus === 'failed' && <CloseOutlined className="w-4 h-4" />}
      </WrapIcon>
    )
  ) : null
}

HistoryStatusIcon.propTypes = {
  txStatus: PropTypes.string,
  dappIconUrl: PropTypes.string,
  className: PropTypes.string,
  isDapp: PropTypes.bool,
  showDes: PropTypes.bool,
  isExternalTx: PropTypes.bool,
}

export default HistoryStatusIcon
