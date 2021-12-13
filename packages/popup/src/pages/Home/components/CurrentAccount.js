import PropTypes from 'prop-types'
import {
  RightOutlined,
  // QrcodeOutlined,
} from '@fluent-wallet/component-icons'
import {shortenAddress} from '@fluent-wallet/shorten-address'
import {useCurrentAddress} from '../../../hooks/useApi'
import {CopyButton, QRCodeButton} from '../../../components'

function CurrentAccount({onOpenAccount}) {
  const {data: curAddr} = useCurrentAddress()
  const nickname = curAddr.account?.nickname
  const address = curAddr.value
  const displayAddress = address ? shortenAddress(address) : ''

  return (
    <div className="flex flex-col" id="currentAccount">
      <div
        className="flex items-center cursor-pointer"
        onClick={onOpenAccount}
        id="openAccountBtn"
        aria-hidden="true"
      >
        <span className="text-xs text-gray-40 mr-2 inline-block max-w-[188px] text-ellipsis">
          {nickname}
        </span>
        <RightOutlined className="w-3 h-3 text-white" />
      </div>
      <div className="flex items-center">
        <span className="text-white font-medium mr-2">{displayAddress}</span>
        <CopyButton text={address} className="mx-2 text-white" />
        <QRCodeButton title={nickname} qrcodeValue={address} />
      </div>
    </div>
  )
}
CurrentAccount.propTypes = {
  onOpenAccount: PropTypes.func.isRequired,
}
export default CurrentAccount
