import PropTypes from 'prop-types'
import {
  CloseCircleFilled,
  ReloadOutlined,
  SendOutlined,
} from '@fluent-wallet/component-icons'

import {WrapIcon} from '../../../components'

function HistoryStatusIcon({txStatus = '', dappIconUrl = '', isDapp = false}) {
  // TODO: add receive status

  return txStatus ? (
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
  ) : null
}

HistoryStatusIcon.propTypes = {
  txStatus: PropTypes.string,
  dappIconUrl: PropTypes.string,
  isDapp: PropTypes.bool,
  showDes: PropTypes.bool,
}

export default HistoryStatusIcon
