import PropTypes from 'prop-types'
import {
  DisplayBalance,
  AddressDisplay,
  ProgressIcon,
  NsNameLabel,
  CopyButton,
} from '../../../components'
import {useTranslation} from 'react-i18next'
import {DownOutlined} from '@fluent-wallet/component-icons'
import Text from '../../../components/Text'
import {formatIntoChecksumAddress} from '../../../utils'
import {shortenAddress} from '@fluent-wallet/shorten-address'
import {useServiceNames} from '../../../hooks'
import {useAddressTypeInfo, useCurrentAddress} from '../../../hooks/useApi'

const TransferDirection = ({
  fromAddress,
  toAddress,
  nsNames = {},
  nsNamesLoading,
  currentAccountName,
  toAddressLabel,
}) => {
  const {type, eip7702Delegated} = useAddressTypeInfo(toAddress)
  const isContract =
    !eip7702Delegated && (type === 'contract' || type === 'builtin')

  return (
    <div
      className="transaction-direction-container flex items-start w-full"
      id="addressDetailContainer"
    >
      <div className="pt-1">
        <ProgressIcon
          dashLengthStyle="h-[14px]"
          direction="vertical"
          middleIcon={
            <div className="w-2.5 h-2.5 bg-gray-0 rounded-full flex items-center justify-center shadow-1 my-1">
              <DownOutlined className="w-2 h-2 text-primary" />
            </div>
          }
        />
      </div>
      <div className="ml-3 flex flex-col flex-1">
        <div className="pt-1 pb-2 flex justify-between border-b border-gray-20 mb-2 items-end">
          <div className="flex flex-col">
            <Text
              className="text-xs text-gray-40"
              id="currentAccountName"
              text={
                nsNamesLoading === false ? (
                  nsNames?.[fromAddress] ? (
                    <NsNameLabel nsName={nsNames?.[fromAddress]} />
                  ) : (
                    <span className="mb-1"> {currentAccountName}</span>
                  )
                ) : (
                  ''
                )
              }
            />
            <Text
              className="text-gray-80"
              id="fromAddress"
              text={
                fromAddress
                  ? shortenAddress(formatIntoChecksumAddress(fromAddress))
                  : ''
              }
            />
          </div>
        </div>

        <Text
          className="text-xs text-gray-40 mb-1"
          id="currentAccountName"
          text={
            nsNamesLoading === false ? (
              nsNames?.[toAddress] ? (
                <NsNameLabel nsName={nsNames?.[toAddress]} />
              ) : (
                <span className="text-xs text-gray-40 mb-1">
                  {toAddressLabel}
                </span>
              )
            ) : (
              ''
            )
          }
        />
        <span className="text-gray-80 flex items-center h-4" id="toAddress">
          <AddressDisplay
            address={toAddress}
            kind="contract"
            iconClassName="w-4 h-4"
            showIcon={isContract}
            autoFetch={isContract}
          />
          {toAddress && (
            <CopyButton
              text={toAddress}
              className="text-gray-60 group-hover:text-primary"
              wrapperClassName="mx-1 shadow-none !bg-transparent hover:!bg-primary-10 group"
            />
          )}
        </span>
      </div>
    </div>
  )
}

TransferDirection.propTypes = {
  nsNames: PropTypes.object,
  nsNamesLoading: PropTypes.bool,
  fromAddress: PropTypes.string,
  toAddress: PropTypes.string,
  currentAccountName: PropTypes.string,
  toAddressLabel: PropTypes.string,
}
function TransferTransactionHeader({
  token,
  sendAmount,
  fromAddress,
  toAddress,
  nickname,
}) {
  const {t} = useTranslation()
  const {
    data: {
      network: {eid: networkId, type, netId},
    },
  } = useCurrentAddress()
  const {data: nsNames, nsNamesError} = useServiceNames({
    type,
    netId,
    networkId,
    provider: window?.___CFXJS_USE_RPC__PRIVIDER,
    addressArr: [fromAddress, toAddress].filter(Boolean),
  })
  const nsNamesLoading = !nsNamesError && !nsNames
  return (
    <div
      id="addressCardContainer"
      className="address-card-container w-full flex flex-col pt-3 pb-6 px-4 items-center bg-blue-card-linear bg-no-repeat bg-cover mt-1 mb-4"
    >
      <header
        className="address-card-header text-primary flex items-center"
        id="addressCardTitle"
      >
        <img
          alt="icon"
          className="w-3 h-3 mr-1"
          src="/images/send-token-icon.svg"
        />
        {t('sendToken')}
      </header>
      <div className="h-10 mt-1 mb-3 flex items-center" id="sendToken">
        <DisplayBalance
          id="sendAmount"
          balance={sendAmount}
          maxWidth={256}
          maxWidthStyle="max-w-[256px]"
          className="text-2xl"
          initialFontSize={32}
          decimals={0}
        />
        {token && (
          <AddressDisplay
            address={token.address}
            iconUrl={token.logoURI}
            name={token.name}
            symbol={token.symbol}
            kind="token"
            iconClassName="w-4 h-4"
          />
        )}
      </div>
      <TransferDirection
        nsNames={nsNames}
        nsNamesLoading={nsNamesLoading}
        fromAddress={fromAddress}
        toAddress={toAddress}
        currentAccountName={nickname}
        toAddressLabel={t('toAddress')}
      />
    </div>
  )
}

TransferTransactionHeader.propTypes = {
  token: PropTypes.object,
  sendAmount: PropTypes.string,
  fromAddress: PropTypes.string,
  toAddress: PropTypes.string,
  nickname: PropTypes.string,
}

export default TransferTransactionHeader
