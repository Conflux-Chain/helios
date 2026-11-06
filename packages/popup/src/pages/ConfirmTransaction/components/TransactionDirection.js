import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {useRPC} from '@fluent-wallet/use-rpc'
import {shortenAddress} from '@fluent-wallet/shorten-address'
import {DownOutlined} from '@fluent-wallet/component-icons'
import Text from '../../../components/Text'
import {
  useAddressTypeInfo,
  useCurrentAddress,
  useDbRefetchBalance,
} from '../../../hooks/useApi'
import {formatIntoChecksumAddress} from '../../../utils'
import {
  DisplayBalance,
  ProgressIcon,
  CopyButton,
  NsNameLabel,
  AddressDisplay,
} from '../../../components'
import {RPC_METHODS} from '../../../constants'
import {useServiceNames} from '../../../hooks'
const {QUERY_ADDRESS} = RPC_METHODS

const useQueryAddressInAddressCard = ({address, networkId}) => {
  useDbRefetchBalance()
  const {data} = useRPC(
    address && networkId
      ? [QUERY_ADDRESS, 'useQueryAddressInAddressCard', address, networkId]
      : null,
    {
      value: address,
      networkId,
      g: {
        network: {eid: 1, ticker: 1},
        nativeBalance: 1,
      },
    },
    {
      fallbackData: {
        account: {},
        network: {ticker: {}},
      },
    },
  )
  return data
}

const TransactionDirection = ({
  fromAddress,
  toAddress,
  fromAddressLabel,
  toAddressLabel,
}) => {
  const {t} = useTranslation()
  const {type: addressType, eip7702Delegated} = useAddressTypeInfo(toAddress)
  const isContract =
    !eip7702Delegated &&
    (addressType === 'contract' || addressType === 'builtin')

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
  const {
    nativeBalance,
    network: {
      ticker: {decimals, symbol},
    },
  } = useQueryAddressInAddressCard({address: fromAddress, networkId})

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
              id="fromAddressLabel"
              text={
                nsNamesLoading === false ? (
                  nsNames?.[fromAddress] ? (
                    <NsNameLabel nsName={nsNames?.[fromAddress]} />
                  ) : (
                    <span className="mb-1"> {fromAddressLabel}</span>
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
          <div className="flex flex-col items-end">
            <span className="text-gray-40 mb-0.5 text-xs">{t('balance')}</span>
            <DisplayBalance
              balance={nativeBalance}
              maxWidth={120}
              maxWidthStyle="max-w-[120px]"
              className="text-xs !text-gray-60 !font-normal"
              initialFontSize={12}
              decimals={decimals}
              symbol={symbol}
              id="fromAddressCfxBalance"
            />
          </div>
        </div>

        <Text
          className="text-xs text-gray-40 mb-1"
          id="toAddressLabel"
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

TransactionDirection.propTypes = {
  fromAddress: PropTypes.string,
  toAddress: PropTypes.string,
  fromAddressLabel: PropTypes.string,
  toAddressLabel: PropTypes.string,
}

export default TransactionDirection
