import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {shortenAddress} from '@fluent-wallet/shorten-address'
import {DownOutlined} from '@fluent-wallet/component-icons'
import {
  useCurrentNativeToken,
  useCurrentAccount,
  useCurrentNetwork,
  useBalance,
} from '../../../hooks/useApi'
import {DisplayBalance, ProgressIcon, CopyButton} from '../../../components'

const AddressDetail = ({
  fromAddress,
  toAddress,
  currentAccountName,
  toAddressLabel,
}) => {
  const {eid: networkId} = useCurrentNetwork()
  const nativeToken = useCurrentNativeToken()
  const balance = useBalance(fromAddress, networkId)
  return (
    <div className="flex items-start">
      <ProgressIcon
        direction="vertical"
        middleIcon={
          <div className="w-2.5 h-2.5 bg-gray-0 rounded-full flex items-center justify-center">
            <DownOutlined className="w-2 h-2 text-primary" />
          </div>
        }
      />
      <div className="ml-3 flex flex-col">
        <span className="text-xs text-gray-40">{currentAccountName}</span>
        <div className="pt-1 pb-2 flex justify-between border-b border-gray-20 mb-2">
          <span className="text-gray-80">{shortenAddress(fromAddress)}</span>
          <DisplayBalance
            balance={balance}
            maxWidth={120}
            maxWidthStyle="max-w-[120px]"
            className="text-xs !text-gray-60"
            initialFontSize={12}
            decimals={nativeToken?.decimals}
          />
        </div>
        <span className="text-xs text-gray-40">{toAddressLabel}</span>
        <span className="text-gray-80">
          {shortenAddress(toAddress)}
          <CopyButton text={toAddress} className="ml-2  text-gray-60" />
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
}

function AddressCard({token, toAddress, value, isSendToken, isApproveToken}) {
  const {t} = useTranslation()
  const {address: userAddress, name: currentAccountName} = useCurrentAccount()

  return (
    <div className="w-full flex flex-col pt-3 pb-6 px-4 items-center bg-blue-card-linear bg-no-repeat mt-1 mb-4">
      <span className="text-primary">
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
        <div className="h-10 mt-1 mb-3 flex items-center">
          <DisplayBalance
            balance={value}
            maxWidth={256}
            maxWidthStyle="max-w-[256px]"
            className="text-2xl"
            initialFontSize={32}
            decimals={token?.decimals}
          />
          <span className="text-xs text-gray-60 mx-1">{token?.symbol}</span>
          <img
            src={token?.iconUrl || '/images/default-token-icon.svg'}
            alt="icon"
            className="w-4 h-4"
          />
        </div>
      )}
      <AddressDetail
        fromAddress={userAddress}
        toAddress={toAddress}
        currentAccountName={currentAccountName}
        toAddressLabel={t(
          isSendToken ? 'toAddress' : isApproveToken ? 'approveTo' : 'contract',
        )}
      />
    </div>
  )
}

AddressCard.propTypes = {
  token: PropTypes.object,
  value: PropTypes.string,
  toAddress: PropTypes.string,
  isSendToken: PropTypes.bool,
  isApproveToken: PropTypes.bool,
}

export default AddressCard
