import PropTypes from 'prop-types'
import Button from '@fluent-wallet/component-button'
import Loading from '@fluent-wallet/component-loading'
import {request} from '../utils'
import {RPC_METHODS} from '../constants'
import {usePendingAuthReq} from '../hooks/useApi'
import {useState} from 'react'

const {
  WALLET_REJECT_PENDING_AUTH_REQUSET,
  WALLET_REQUEST_PERMISSIONS,
  WALLET_SWITCH_CONFLUX_CHAIN,
  WALLET_SWITCH_ETHEREUM_CHAIN,
  CFX_SIGN_TYPED_DATA_V4,
  ETH_SIGN_TYPED_DATA_V4,
  CFX_SEND_TRANSACTION,
  ETH_SEND_TRANSACTION,
  WALLET_ADD_ETHEREUM_CHAIN,
  WALLET_ADD_CONFLUX_CHAIN,
  WALLET_WATCH_ASSET,
  PERSONAL_SIGN,
} = RPC_METHODS
function DappFooter({
  cancelText,
  confirmText,
  confirmDisabled = false,
  confirmParams = {},
  onClickCancel,
  onClickConfirm,
}) {
  const pendingAuthReq = usePendingAuthReq()
  const [{req, eid}] = pendingAuthReq?.length ? pendingAuthReq : [{}]
  const [sendingRequestStatus, setSendingRequestStatus] = useState(false)
  const [cancelingRequestStatus, setCancelingRequestStatus] = useState(false)

  const onCancel = () => {
    if (cancelingRequestStatus) {
      return
    }
    setCancelingRequestStatus(true)
    request(WALLET_REJECT_PENDING_AUTH_REQUSET, {authReqId: eid})
      .then(() => {
        setCancelingRequestStatus(false)
        onClickCancel && onClickCancel()
        window.close()
      })
      .catch(e => {
        console.log('error', e)
        // TODO: error message
        setCancelingRequestStatus(false)
      })
  }

  const onConfirm = () => {
    if (!req?.method || sendingRequestStatus) {
      return
    }
    setSendingRequestStatus(true)
    let params = {}
    switch (req.method) {
      case WALLET_REQUEST_PERMISSIONS:
        params.permissions = req.params
        break
      case WALLET_SWITCH_ETHEREUM_CHAIN:
      case WALLET_SWITCH_CONFLUX_CHAIN:
        params.chainConfig = req.params
        break
      case CFX_SEND_TRANSACTION:
      case ETH_SEND_TRANSACTION:
        params.tx = req.params
        break
      case ETH_SIGN_TYPED_DATA_V4:
      case CFX_SIGN_TYPED_DATA_V4:
      case PERSONAL_SIGN:
        params.data = req.params
        break
      case WALLET_ADD_ETHEREUM_CHAIN:
      case WALLET_ADD_CONFLUX_CHAIN:
        params.newChainConfig = req.params
        break
      case WALLET_WATCH_ASSET:
        params.asset = req.params
        break
    }
    params = {...params, ...confirmParams}

    request(req.method, {authReqId: eid, ...params})
      .then(() => {
        setSendingRequestStatus(false)
        onClickConfirm && onClickConfirm()
        // mutate([WALLET_GET_PENDING_AUTH_REQUEST], pendingAuthReq.slice(1))
        window.close()
      })
      .catch(e => {
        console.log('error', e)
        setSendingRequestStatus(false)
        // TODO: error message
      })
  }

  return (
    <footer className="flex w-full px-4">
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
      {sendingRequestStatus && (
        <div className="fixed top-0 left-0 flex w-screen h-screen bg-[rgba(0,0,0,0.4)] items-center justify-center">
          <Loading />
        </div>
      )}
    </footer>
  )
}

DappFooter.propTypes = {
  cancelText: PropTypes.string.isRequired,
  confirmText: PropTypes.string.isRequired,
  confirmParams: PropTypes.object,
  confirmDisabled: PropTypes.bool,
  onClickConfirm: PropTypes.func,
  onClickCancel: PropTypes.func,
}

export default DappFooter
