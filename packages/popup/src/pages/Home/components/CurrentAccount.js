import PropTypes from 'prop-types'
import {
  RightOutlined,
  // QrcodeOutlined,
} from '@fluent-wallet/component-icons'
import {shortenAddress} from '@fluent-wallet/shorten-address'
import {useCurrentAddress} from '../../../hooks/useApi'
import Text from '../../../components/Text'
import {CopyButton, QRCodeButton, WrapIcon} from '../../../components'
import classNames from 'classnames'

const iconWrapper = ({children, ...props}) => {
  return (
    <WrapIcon {...props} className="bg-transparent hover:bg-[#3C3A5D] group">
      {children}
    </WrapIcon>
  )
}

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
        className="flex items-center cursor-pointer mb-1"
        onClick={onOpenAccount}
        id="openAccountBtn"
        aria-hidden="true"
      >
        <Text
          className="text-xs text-white mr-2 inline-block max-w-[188px] text-ellipsis"
          text={nickname}
        />
        <RightOutlined
          className={classNames(
            'w-3 h-3 text-white transition-all duration-100 ease-in-out',
            {['opacity-0']: !displayAddress},
          )}
        />
      </div>
      <div className="flex items-center">
        <Text
          className="text-white font-medium mr-2 w-[7.5rem]"
          text={displayAddress}
        />
        <CopyButton
          text={address}
          className={classNames(
            'text-white transform transition-all duration-100 ease-in-out group-hover:text-primary',
            {['opacity-0']: !displayAddress},
          )}
          CopyWrapper={iconWrapper}
        />
        <QRCodeButton
          title={nickname}
          qrcodeValue={address}
          className={classNames(
            'transition-all duration-100 ease-in-out group-hover:text-primary',
            {
              ['opacity-0']: !displayAddress,
            },
          )}
          Wrapper={iconWrapper}
        />
      </div>
    </div>
  )
}
CurrentAccount.propTypes = {
  onOpenAccount: PropTypes.func.isRequired,
}
export default CurrentAccount
