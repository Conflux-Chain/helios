import PropTypes from 'prop-types'
import {
  RightOutlined,
  // QrcodeOutlined,
} from '@fluent-wallet/component-icons'
import {shortenAddress} from '@fluent-wallet/shorten-address'
import {useCurrentAddress} from '../../../hooks/useApi'
import Text from '../../../components/Text'
import {CopyButton, QRCodeButton} from '../../../components'
import classNames from 'classnames'
function CurrentAccount({onOpenAccount}) {
  const {
    data: {
      value: address,
      account: {nickname},
    },
  } = useCurrentAddress()
  const displayAddress = address ? shortenAddress(address) : ''

  return (
    <div className="flex flex-col" id="currentAccount">
      <div
        className="flex items-center cursor-pointer"
        onClick={onOpenAccount}
        id="openAccountBtn"
        aria-hidden="true"
      >
        <Text
          className="text-xs text-gray-40 mr-2 inline-block max-w-[188px] text-ellipsis"
          text={nickname}
        />
        <RightOutlined
          className={classNames(
            'w-3 h-3 text-white transition-all duration-[520ms] ease-in-out',
            {['opacity-0 filter blur-sm']: !displayAddress},
          )}
        />
      </div>
      <div className="flex items-center">
        <Text
          className="text-white font-medium mr-2 w-30"
          text={displayAddress}
        />
        <CopyButton
          text={address}
          className={classNames(
            'mx-2 text-white transform transition-all duration-[520ms] ease-in-out',
            {['opacity-0 filter blur-sm']: !displayAddress},
          )}
        />
        <QRCodeButton
          title={nickname}
          qrcodeValue={address}
          className={classNames('transition-all duration-[520ms] ease-in-out', {
            ['opacity-0 filter blur-sm']: !displayAddress,
          })}
        />
      </div>
    </div>
  )
}
CurrentAccount.propTypes = {
  onOpenAccount: PropTypes.func.isRequired,
}
export default CurrentAccount
