import {shortenAddress} from '@fluent-wallet/shorten-address'
import PropTypes from 'prop-types'
import classNames from 'classnames'

import {formatIntoChecksumAddress} from '../utils'
import {
  useAddressNameInfo,
  useFetchAddressNameInfos,
} from '../hooks/useNameInfoStore'
import {useCheckImage} from '../hooks'
import VerificationBadge from './VerificationBadge'
import {FileOutlined} from '@fluent-wallet/component-icons'
import {useCurrentAddress} from '../hooks/useApi'

function TokenDisplay({
  iconUrl,
  showIcon,
  symbol,
  name,
  label,
  hideText,
  labelClassName,
  iconClassName,
  wrapperClassName,
  isNotable,
  isVerified,
  showStatusIcon,
}) {
  const isImgUrl = useCheckImage(showIcon ? iconUrl ?? '' : '')
  const displayText = label ?? symbol ?? name
  return (
    <div className={classNames('flex items-center gap-1', wrapperClassName)}>
      {showIcon && (
        <VerificationBadge
          kind="token"
          isNotable={isNotable}
          isVerified={isVerified}
          visible={showStatusIcon}
        >
          <img
            className={classNames('rounded-full', iconClassName)}
            src={isImgUrl ? iconUrl : '/images/default-token-icon.svg'}
            alt="logo"
          />
        </VerificationBadge>
      )}
      {!hideText && (
        <span
          className={classNames('text-gray-80 font-semibold', labelClassName)}
        >
          {displayText}
        </span>
      )}
    </div>
  )
}
TokenDisplay.propTypes = {
  // custom label
  label: PropTypes.string,
  // token name
  name: PropTypes.string,
  // token symbol
  symbol: PropTypes.string,
  iconUrl: PropTypes.string,
  showIcon: PropTypes.bool,
  hideText: PropTypes.bool,
  isNotable: PropTypes.bool,
  isVerified: PropTypes.bool,
  labelClassName: PropTypes.string,
  iconClassName: PropTypes.string,
  wrapperClassName: PropTypes.string,
  showStatusIcon: PropTypes.bool,
}

function ContractDisplay({
  displayAddress,
  showIcon,
  label,
  nickname,
  hideText,
  labelClassName,
  nicknameClassName,
  iconClassName,
  wrapperClassName,
  isNotable,
  isVerified,
  showStatusIcon,
}) {
  const displayText = label ?? displayAddress
  return (
    <div className={classNames('flex gap-1', wrapperClassName)}>
      {showIcon && (
        <VerificationBadge
          kind="contract"
          isNotable={isNotable}
          isVerified={isVerified}
          visible={showStatusIcon}
        >
          <FileOutlined className={classNames('text-primary', iconClassName)} />
        </VerificationBadge>
      )}
      {!hideText && (
        <div className="flex flex-col">
          <span className={classNames('text-gray-80', labelClassName)}>
            {displayText}
          </span>
          {nickname && (
            <span
              className={classNames('text-xs text-gray-60', nicknameClassName)}
            >
              {nickname}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
ContractDisplay.propTypes = {
  displayAddress: PropTypes.string,
  // custom label
  label: PropTypes.string,
  nickname: PropTypes.string,
  showIcon: PropTypes.bool,
  hideText: PropTypes.bool,
  isNotable: PropTypes.bool,
  isVerified: PropTypes.bool,
  labelClassName: PropTypes.string,
  nicknameClassName: PropTypes.string,
  iconClassName: PropTypes.string,
  wrapperClassName: PropTypes.string,
  showStatusIcon: PropTypes.bool,
}

function AddressDisplay({
  kind,
  network,
  address,
  addressFormat = 'short',
  name,
  symbol,
  label,
  nickname,
  iconUrl,
  showIcon = true,
  hideText = false,
  showStatusIcon = true,
  autoFetch = true,
  labelClassName,
  nicknameClassName,
  iconClassName,
  wrapperClassName,
}) {
  const {
    data: {network: currentNetwork},
  } = useCurrentAddress()
  const effectiveNetwork = network ?? currentNetwork
  const nameInfo = useAddressNameInfo(effectiveNetwork, address)
  useFetchAddressNameInfos({
    network: effectiveNetwork,
    addresses: address ? [address] : [],
    autoFetch:
      autoFetch && (kind === 'token' || (kind === 'contract' && showIcon)),
  })

  if (kind === 'token') {
    const token = nameInfo?.token ?? {}
    return (
      <TokenDisplay
        iconUrl={iconUrl ?? token?.iconUrl}
        showIcon={showIcon}
        name={name ?? token?.name}
        symbol={symbol ?? token?.symbol}
        label={label}
        hideText={hideText}
        labelClassName={labelClassName}
        iconClassName={iconClassName}
        wrapperClassName={wrapperClassName}
        isNotable={nameInfo?.isNotable}
        isVerified={nameInfo?.isVerified}
        showStatusIcon={showStatusIcon}
      />
    )
  }

  let displayAddress = address || ''
  if (address) {
    try {
      const formattedAddress = formatIntoChecksumAddress(address)
      displayAddress =
        addressFormat === 'short'
          ? shortenAddress(formattedAddress)
          : formattedAddress
    } catch {
      // Keep malformed addresses visible so the request can still be inspected.
    }
  }
  return (
    <ContractDisplay
      displayAddress={displayAddress}
      showIcon={showIcon}
      label={label}
      nickname={nickname}
      nicknameClassName={nicknameClassName}
      hideText={hideText}
      labelClassName={labelClassName}
      iconClassName={iconClassName}
      wrapperClassName={wrapperClassName}
      isNotable={nameInfo?.isNotable}
      isVerified={nameInfo?.isVerified}
      showStatusIcon={showStatusIcon}
    />
  )
}
AddressDisplay.propTypes = {
  // contract | token
  kind: PropTypes.string.isRequired,
  network: PropTypes.shape({
    type: PropTypes.oneOf(['cfx', 'eth']).isRequired,
    netId: PropTypes.number.isRequired,
  }),
  address: PropTypes.string,
  label: PropTypes.string,
  nickname: PropTypes.string,
  labelClassName: PropTypes.string,
  nicknameClassName: PropTypes.string,
  // short | full
  addressFormat: PropTypes.string,
  // Token image override; contracts use the built-in icon.
  iconUrl: PropTypes.string,
  name: PropTypes.string,
  symbol: PropTypes.string,
  showIcon: PropTypes.bool,
  iconClassName: PropTypes.string,
  hideText: PropTypes.bool,
  wrapperClassName: PropTypes.string,
  showStatusIcon: PropTypes.bool,
  // auto fetch address name infos
  autoFetch: PropTypes.bool,
}
export default AddressDisplay
