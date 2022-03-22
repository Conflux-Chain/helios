import PropTypes from 'prop-types'
import {RightOutlined} from '@fluent-wallet/component-icons'
import {shortenAddress} from '@fluent-wallet/shorten-address'
import {
  useCurrentAddress,
  useBlockchainExplorerUrl,
} from '../../../hooks/useApi'
import Text from '../../../components/Text'
import {CopyButton, QRCodeButton, WrapIcon} from '../../../components'
import {SendOutlined} from '@fluent-wallet/component-icons'
import classNames from 'classnames'

const OpenScanButton = ({address}) => {
  const {address: scanAddrUrl} = useBlockchainExplorerUrl(
    address ? {address: [address]} : null,
  )
  return (
    <WrapIcon className="!bg-transparent hover:!bg-[#ffffff1a]">
      <SendOutlined
        className={classNames(
          'text-white transition-all duration-100 ease-in-out w-4 h-4 cursor-pointer',
          {['opacity-0']: !address},
        )}
        id="openScanAddrUrl"
        onClick={() => window.open(scanAddrUrl?.[0])}
      />
    </WrapIcon>
  )
}

OpenScanButton.propTypes = {
  address: PropTypes.string,
}

function CurrentAccount({onOpenAccount}) {
  const {
    data: {
      value: address,
      account: {nickname},
    },
  } = useCurrentAddress()

  console.log('useCurrentAddress', address)
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
          className="text-white font-medium mr-2 w-auto"
          text={displayAddress}
        />
        <CopyButton
          text={address}
          className={classNames(
            'text-white transition-all duration-100 ease-in-out',
            {['opacity-0']: !displayAddress},
          )}
          wrapperClassName="!bg-transparent hover:!bg-[#ffffff1a]"
        />
        <QRCodeButton
          title={nickname}
          qrcodeValue={address}
          className={classNames('transition-all duration-100 ease-in-out', {
            ['opacity-0']: !displayAddress,
          })}
          wrapperClassName="!bg-transparent hover:!bg-[#ffffff1a]"
        />
        <OpenScanButton address={address} />
      </div>
    </div>
  )
}
CurrentAccount.propTypes = {
  onOpenAccount: PropTypes.func.isRequired,
}
export default CurrentAccount
