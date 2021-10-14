import PropTypes from 'prop-types'
import Button from '@fluent-wallet/component-button'
import {useRPC} from '@fluent-wallet/use-rpc'
import {request} from '../utils'
import {RPC_METHODS, ROUTES} from '../constants'
import {useHistory} from 'react-router-dom'

const {GET_PENDING_AUTH_REQ, REJECT_PENDING_AUTH_REQ, REQUEST_PERMISSIONS} =
  RPC_METHODS
const {HOME} = ROUTES
function DappTransactionFooter({
  cancelText,
  confirmText,
  confirmDisabled = false,
  confirmParams = {},
}) {
  const history = useHistory()
  const {data: pendingAuthReq} = useRPC([GET_PENDING_AUTH_REQ], undefined, {
    fallbackData: [{eid: null}],
  })
  const [{req, eid}] = pendingAuthReq.length ? pendingAuthReq : [{}]

  const onCancel = () => {
    request(REJECT_PENDING_AUTH_REQ, {authReqId: eid}).then(({result}) => {
      result && history.push(HOME)
      // TODO: error message
    })
  }

  const onConfirm = () => {
    const params = {...confirmParams}
    switch (req?.method) {
      case REQUEST_PERMISSIONS:
        params.permissions = req.params
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

DappTransactionFooter.propTypes = {
  cancelText: PropTypes.string.isRequired,
  confirmText: PropTypes.string.isRequired,
  confirmParams: PropTypes.object,
  confirmDisabled: PropTypes.bool,
}

export default DappTransactionFooter
