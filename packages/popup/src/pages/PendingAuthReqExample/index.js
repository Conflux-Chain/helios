import {useRPC} from '@fluent-wallet/use-rpc'
import {RPC_METHODS} from '../../constants'
import {request} from '../../utils'

const {GET_ACCOUNT_GROUP, GET_PENDING_AUTH_REQ, REJECT_PENDING_AUTH_REQ} =
  RPC_METHODS

export default function PendingAuthReqExample() {
  const {data: pendingAuthReq} = useRPC([GET_PENDING_AUTH_REQ])
  const {data: groups} = useRPC([GET_ACCOUNT_GROUP])
  console.log('groups = ', groups)
  if (!(pendingAuthReq?.length > 0)) return <div></div>
  console.log('pendingAuthReq = ', JSON.stringify(pendingAuthReq))
  const [
    {
      req, // app, site,
      eid,
    },
  ] = pendingAuthReq
  console.log('req = ', req)
  const cancel = () =>
    request(REJECT_PENDING_AUTH_REQ, {authReqId: eid}).then(
      window.location.reload,
    )

  const confirm = () => {
    const confirmReq = {authReqId: eid}
    if (req.method === 'wallet_requestPermissions') {
      confirmReq.permissions = req.params
      confirmReq.accounts = [groups[0].account[0].eid]
    } else if (req.method === 'personal_sign') {
      confirmReq.data = req.params
    } else if (req.method === 'cfx_signTypedData_v4') {
      confirmReq.data = req.params
    } else if (req.method === 'wallet_switchConfluxChain') {
      confirmReq.chainConfig = req.params
    } else if (req.method === 'wallet_addEthereumChain') {
      confirmReq.newChainConfig = req.params
    }

    request(req.method, confirmReq)
      .then(res => {
        console.log('confirm res', res)
        window.location.reload()
      })
      .catch(console.error)
  }

  return (
    <div>
      auth req id: {eid}
      <br />
      method: {req.method}
      <br />
      params: {JSON.stringify(req.params, null, 4)}
      <br />
      <br />
      <button onClick={cancel}>BUTTON:Cancel/Reject/...</button>
      <br />
      <button onClick={confirm}>BUTTON:Confirm/Approve...</button>
    </div>
  )
}
