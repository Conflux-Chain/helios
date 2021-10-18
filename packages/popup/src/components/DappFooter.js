import PropTypes from 'prop-types'
import Button from '@fluent-wallet/component-button'
import {useRPC} from '@fluent-wallet/use-rpc'
import {request} from '../utils'
import {RPC_METHODS, ROUTES} from '../constants'
import {useHistory} from 'react-router-dom'

const {
  GET_PENDING_AUTH_REQ,
  REJECT_PENDING_AUTH_REQ,
  REQUEST_PERMISSIONS,
  WALLET_SWITCH_CONFLUX_CHAIN,
  WALLET_SWITCH_ETHEREUM_CHAIN,
} = RPC_METHODS
const {HOME} = ROUTES
function DappFooter({
  cancelText,
  confirmText,
  confirmDisabled = false,
  confirmParams = {},
}) {
  const history = useHistory()
  const {data: pendingAuthReq} = useRPC([GET_PENDING_AUTH_REQ], undefined, {
    fallbackData: [{eid: null}],
  })
  // console.log('pendingAuthReq', pendingAuthReq)
  const [{req, eid}] = pendingAuthReq.length ? pendingAuthReq : [{}]

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
