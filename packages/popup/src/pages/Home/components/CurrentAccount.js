import PropTypes from 'prop-types'
import {
  RightOutlined,
  // QrcodeOutlined,
} from '@fluent-wallet/component-icons'
import {shortenAddress} from '@fluent-wallet/shorten-address'
import {useCurrentAccount} from '../../../hooks'
import {CopyButton, QRCodeButton} from '../../../components'

function CurrentAccount({onOpenAccount}) {
  const {nickname, address} = useCurrentAccount()
  const displayAddress = address ? shortenAddress(address) : ''

  return (
    <div className="flex flex-col">
      <div
        className="flex items-center cursor-pointer"
        onClick={onOpenAccount}
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
    </div>
  )
}
CurrentAccount.propTypes = {
  onOpenAccount: PropTypes.func.isRequired,
}
export default CurrentAccount
