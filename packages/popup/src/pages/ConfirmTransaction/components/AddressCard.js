import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {useRPC} from '@fluent-wallet/use-rpc'
import {shortenAddress} from '@fluent-wallet/shorten-address'
import {DownOutlined, FileOutlined} from '@fluent-wallet/component-icons'
import {useCurrentAddress, useAddressType} from '../../../hooks/useApi'
import {DisplayBalance, ProgressIcon, CopyButton} from '../../../components'
import {RPC_METHODS} from '../../../constants'
const {QUERY_ADDRESS} = RPC_METHODS

const AddressDetail = ({
  fromAddress,
  toAddress,
  currentAccountName,
  toAddressLabel,
  isCreateContract,
  nativeBalance,
  decimals,
  symbol,
}) => {
  const {t} = useTranslation()
  const type = useAddressType(toAddress)
  const isContract = type === 'contract' || type === 'builtin'

  return (
    <div className="flex items-start w-full" id="addressDetailContainer">
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
        <div className="pt-1 pb-2 flex justify-between border-b border-gray-20 mb-2">
          <div className="flex flex-col">
            <span className="text-xs text-gray-40" id="currentAccountName">
              {currentAccountName}
            </span>
            <span className="text-gray-80" id="fromAddress">
              {fromAddress && shortenAddress(fromAddress)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-80">{t('balance')}</span>
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
        <span className="text-xs text-gray-40">{toAddressLabel}</span>
        <span className="text-gray-80 flex items-center" id="toAddress">
          {isContract && <FileOutlined className="w-4 h-4 mr-1 text-primary" />}
          {toAddress && shortenAddress(toAddress)}
          {isCreateContract && t('createContract')}
          {toAddress && (
            <CopyButton text={toAddress} className="ml-2  text-gray-60" />
          )}
        </span>
      </div>
    </div>
  )
}

AddressDetail.propTypes = {
  fromAddress: PropTypes.string,
  toAddress: PropTypes.string,
  currentAccountName: PropTypes.string,
  toAddressLabel: PropTypes.string,
  isCreateContract: PropTypes.bool,
  nativeBalance: PropTypes.string,
  decimals: PropTypes.number,
  symbol: PropTypes.string,
}

const useQueryAddressInAddressCard = address => {
  const {
    data: {
      network: {eid: networkId},
    },
  } = useCurrentAddress()
  const {data} = useRPC(
    address && networkId
      ? [QUERY_ADDRESS, 'useQueryAddressInAddressCard', address, networkId]
      : null,
    {
      value: address,
      networkId,
      g: {
        eid: 1,
        _account: {nickname: 1, eid: 1},
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

function AddressCard({
  token,
  fromAddress,
  toAddress,
  value,
  isSendToken,
  isApproveToken,
  isDapp,
}) {
  const {t} = useTranslation()
  const {
    account: {nickname},
    nativeBalance,
    network: {
      ticker: {decimals, symbol},
    },
  } = useQueryAddressInAddressCard(fromAddress)

  return (
    <div
      id="addressCardContainer"
      className="w-full flex flex-col pt-3 pb-6 px-4 items-center bg-blue-card-linear bg-no-repeat mt-1 mb-4"
    >
      <span className="text-primary flex items-center" id="addressCardTitle">
        <img
          alt="icon"
          className="w-3 h-3 mr-1"
          src={
            isSendToken
              ? '/images/send-token-icon.svg'
              : isApproveToken
              ? '/images/approve-token-icon.svg'
              : '/images/sign-icon.svg'
          }
        />
        {t(
          isSendToken
            ? 'sendToken'
            : isApproveToken
            ? 'approveToken'
            : 'signTransaction',
        )}
      </span>
      {isSendToken && (
        <div className="h-10 mt-1 mb-3 flex items-center" id="sendToken">
          <DisplayBalance
            id="sendAmount"
            balance={value}
            maxWidth={256}
            maxWidthStyle="max-w-[256px]"
            className="text-2xl"
            initialFontSize={32}
            decimals={isDapp ? token?.decimals : 0}
          />
          <span className="text-xs text-gray-60 mx-1" id="sendTokenSymbol">
            {token?.symbol}
          </span>
          <img
            src={token?.iconUrl || '/images/default-token-icon.svg'}
            alt="icon"
            className="w-4 h-4"
            id="sendTokenIcon"
          />
        </div>
      )}
      <AddressDetail
        fromAddress={fromAddress}
        toAddress={toAddress}
        currentAccountName={nickname}
        nativeBalance={nativeBalance}
        decimals={decimals}
        symbol={symbol}
        toAddressLabel={t(
          isSendToken ? 'toAddress' : isApproveToken ? 'approveTo' : 'contract',
        )}
        isCreateContract={!isSendToken && !isApproveToken && !toAddress}
      />
    </div>
  )
}

AddressCard.propTypes = {
  token: PropTypes.object,
  value: PropTypes.string,
  fromAddress: PropTypes.string,
  toAddress: PropTypes.string,
  isSendToken: PropTypes.bool,
  isApproveToken: PropTypes.bool,
  isDapp: PropTypes.bool,
}

export default AddressCard
