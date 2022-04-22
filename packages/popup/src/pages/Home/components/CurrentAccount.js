import PropTypes from 'prop-types'
import {memo, useState} from 'react'
import {RightOutlined} from '@fluent-wallet/component-icons'
import {shortenAddress} from '@fluent-wallet/shorten-address'
import {useCurrentAddress} from '../../../hooks/useApi'
import Text from '../../../components/Text'
import {CopyButton, QRCodeButton, WrapIcon} from '../../../components'
import {SendOutlined} from '@fluent-wallet/component-icons'
import {useTranslation} from 'react-i18next'
import Message from '@fluent-wallet/component-message'
import classNames from 'classnames'
import {request, formatIntoChecksumAddress} from '../../../utils'
import {RPC_METHODS} from '../../../constants'

const {WALLET_GET_BLOCKCHAIN_EXPLORER_URL} = RPC_METHODS

const OpenScanButton = ({address}) => {
  const {t} = useTranslation()
  const [jumpUrlStatus, setJumpUrlStatus] = useState(false)
  const onClick = () => {
    if (jumpUrlStatus) {
      return
    }
    if (address) {
      setJumpUrlStatus(true)
      request(WALLET_GET_BLOCKCHAIN_EXPLORER_URL, {address: [address]})
        .then(res => {
          setJumpUrlStatus(false)
          if (res?.address?.[0]) {
            window.open(res.address[0])
          }
        })
        .catch(e => {
          setJumpUrlStatus(false)
          Message.error({
            content: e?.message ?? t('unCaughtErrMsg'),
            top: '110px',
            duration: 1,
          })
        })
    }
  }

  return (
    <WrapIcon className="!bg-transparent hover:!bg-[#ffffff1a]">
      <SendOutlined
        className={classNames(
          'text-white transition-all duration-100 ease-in-out w-4 h-4 cursor-pointer',
          {['opacity-0']: !address},
        )}
        id="openScanAddrUrl"
        onClick={onClick}
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
      value,
      account: {nickname},
    },
  } = useCurrentAddress()
  const address = formatIntoChecksumAddress(value)
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
        {/* TODO: add animate-address-change-blink*/}
        <div className="px-0.5 mr-2">
          <Text
            className="text-white font-medium w-auto"
            text={displayAddress}
          />
        </div>
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
export default memo(CurrentAccount)
