import PropTypes from 'prop-types'
import {
  CloseCircleFilled,
  ReloadOutlined,
  SendOutlined,
  ReceiveOutlined,
} from '@fluent-wallet/component-icons'

import {WrapIcon} from '../../../components'

function HistoryStatusIcon({
  isExternalTx = false,
  txStatus = '',
  dappIconUrl = '',
  isDapp = false,
}) {
  return txStatus ? (
    isExternalTx ? (
      <WrapIcon>
        {txStatus === 'confirmed' && (
          <ReceiveOutlined className="w-4 h-4 text-success" />
        )}
      </WrapIcon>
    ) : (
      <WrapIcon>
        {txStatus === 'confirmed' && isDapp && (
          <img src={dappIconUrl} alt="favicon" className="w-5 h-5" />
        )}

        {txStatus === 'confirmed' && !isDapp && (
          <SendOutlined className="w-4 h-4 text-success" />
        )}

        {txStatus === 'executed' && (
          <ReloadOutlined className="w-4 h-4 text-success" />
        )}

        {txStatus === 'pending' && (
          <ReloadOutlined className="w-4 h-4 text-success" />
        )}

        {txStatus === 'failed' && (
          <CloseCircleFilled className="w-4 h-4 text-success" />
        )}
      </WrapIcon>
    )
  ) : null
}

HistoryStatusIcon.propTypes = {
  txStatus: PropTypes.string,
  dappIconUrl: PropTypes.string,
  isDapp: PropTypes.bool,
  showDes: PropTypes.bool,
  isExternalTx: PropTypes.bool,
}

export default HistoryStatusIcon
