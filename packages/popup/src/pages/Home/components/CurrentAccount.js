import PropTypes from 'prop-types'
// import {useState} from 'react'
// import QRCode from 'qrcode.react'
// import Modal from '@fluent-wallet/component-modal'
import {
  RightOutlined,
  // QrcodeOutlined,
} from '@fluent-wallet/component-icons'
import {shortenAddress} from '@fluent-wallet/shorten-address'
import {useCurrentAccount} from '../../../hooks'
import {CopyButton, QRCodeButton} from '../../../components'

function CurrentAccount({onOpenAccount}) {
  // const [qrcodeShow, setQrcodeShow] = useState(false)

  const {nickname, address} = useCurrentAccount()
  const displayAddress = address ? shortenAddress(address) : ''

  return (
    <div className="flex flex-col">
      <div
        className="flex items-center cursor-pointer"
        onClick={onOpenAccount}
        id="openAccountBtn"
        aria-hidden="true"
      >
        <span className="text-xs text-gray-40 mr-2">{nickname}</span>
        <RightOutlined className="w-3 h-3 text-white" />
      </div>
      <div className="flex items-center">
        <span className="text-white font-medium mr-2">{displayAddress}</span>
        <CopyButton text={address} />
        <QRCodeButton title={nickname} qrcodeValue={address} />
      </div>
      {/* <Modal
        open={qrcodeShow}
        onClose={() => setQrcodeShow(false)}
        content={
          <div className="flex flex-col items-center">
            <span className="text-gray-40 text-xs mb-1">{nickname}</span>
            <QRCode value={address} size={272} />
            <span className="inline-block w-full mt-2 bg-bg rounded p-2 text-gray-80 break-all">
              {address}
            </span>
          </div>
        }
      /> */}
    </div>
  )
}
CurrentAccount.propTypes = {
  onOpenAccount: PropTypes.func.isRequired,
}
export default CurrentAccount
