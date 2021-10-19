import PropTypes from 'prop-types'
import {useRPC} from '@fluent-wallet/use-rpc'
import {RPC_METHODS} from '../constants'
import {TitleNav} from '../components'
const {GET_PENDING_AUTH_REQ} = RPC_METHODS

function DappConnectWalletHeader({title}) {
  const {data: pendingAuthReq} = useRPC([GET_PENDING_AUTH_REQ], undefined, {
    fallbackData: [{app: null, site: null}],
  })
  const [{app, site}] = pendingAuthReq.length ? pendingAuthReq : [{}]
  return (
    <header>
      <div>
        <TitleNav title={title} hasGoBack={false} />
        <div className="flex justify-center items-center mt-1">
          <div className="w-12 h-12 rounded-full border-solid border-gray-20 border flex items-center justify-center">
            <img
              src={app?.site?.icon || '/images/default-fav.svg'}
              alt="favicon"
              className="w-8 h-8"
            />
          </div>
          <div className="w-2 h-2 border-solid border-primary border-2 rounded-full ml-2" />
          <div className="border border-gray-40 border-dashed w-[42px] mx-1" />
          <img
            src="images/paperclip.svg"
            alt="connecting"
            className="w-4 h-4"
          />
          <div className="border border-gray-40 border-dashed w-[42px] mx-1" />
          <div className="w-2 h-2 border-solid border-primary border-2 rounded-full mr-2" />
          <div className="w-12 h-12 rounded-full border-solid border-gray-20 border flex items-center justify-center">
            <img className="w-8 h-8" src="images/logo.svg" alt="logo" />
          </div>
        </div>
        <p className="text-base text-gray-80 text-center mt-2 font-medium px-3 whitespace-nowrap overflow-hidden overflow-ellipsis">
          {app?.site?.origin || site?.origin || ''}
        </p>
      </div>
    </header>
  )
}

DappConnectWalletHeader.propTypes = {
  title: PropTypes.string.isRequired,
}
export default DappConnectWalletHeader
