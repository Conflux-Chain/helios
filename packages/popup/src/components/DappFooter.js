import PropTypes from 'prop-types'
import Button from '@fluent-wallet/component-button'
import {request} from '../utils'
import {RPC_METHODS, ROUTES} from '../constants'
import {usePendingAuthReq} from '../hooks'
import {useHistory} from 'react-router-dom'

const {
  REJECT_PENDING_AUTH_REQ,
  REQUEST_PERMISSIONS,
  WALLET_SWITCH_CONFLUX_CHAIN,
  WALLET_SWITCH_ETHEREUM_CHAIN,
  CFX_SIGN_TYPED_DATA_V4,
  ETH_SIGN_TYPED_DATA_V4,
  WALLET_ADD_ETHEREUM_CHAIN,
  WALLET_ADD_CONFLUX_CHAIN,
} = RPC_METHODS
const {HOME} = ROUTES
function DappFooter({
  cancelText,
  confirmText,
  confirmDisabled = false,
  confirmParams = {},
}) {
  const history = useHistory()
  const {pendingAuthReq} = usePendingAuthReq()
  console.log('pendingAuthReq', pendingAuthReq)
  const [{req, eid}] = pendingAuthReq?.length ? pendingAuthReq : [{}]

  const onCancel = () => {
    request(REJECT_PENDING_AUTH_REQ, {authReqId: eid}).then(({result}) => {
      result && history.push(HOME)
      // TODO: error message
    })
  }

  const onConfirm = () => {
    if (!req?.method) {
      return
    }
    const params = {...confirmParams}
    switch (req.method) {
      case REQUEST_PERMISSIONS:
        params.permissions = req.params
        break
      case WALLET_SWITCH_CONFLUX_CHAIN:
        params.chainConfig = req.params
        break
      case WALLET_SWITCH_ETHEREUM_CHAIN:
        params.chainConfig = req.params
        break
      case CFX_SIGN_TYPED_DATA_V4:
        params.data = req.params
        break
      case ETH_SIGN_TYPED_DATA_V4:
        params.data = req.params
        break
      case WALLET_ADD_ETHEREUM_CHAIN:
        params.newChainConfig = req.params
        break
      case WALLET_ADD_CONFLUX_CHAIN:
        params.newChainConfig = req.params
        break
    }

    request(req.method, {authReqId: eid, ...params}).then(({result}) => {
      result && history.push(HOME)
      // TODO: error message
    })
  }

  return (
    <footer className="flex px-4">
      <Button
        id="cancelBtn"
        className="flex-1"
        variant="outlined"
        onClick={onCancel}
      >
        {cancelText}
      </Button>
      <div className="w-3" />
      <Button
        id="confirmBtn"
        className="flex-1"
        onClick={onConfirm}
        disabled={confirmDisabled}
      >
        {confirmText}
      </Button>
    </footer>
  )
}

DappFooter.propTypes = {
  cancelText: PropTypes.string.isRequired,
  confirmText: PropTypes.string.isRequired,
  confirmParams: PropTypes.object,
  confirmDisabled: PropTypes.bool,
}

export default DappFooter
