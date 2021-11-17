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
  const balanceMap = useBalance(fromAddress, networkId)
  const balance = balanceMap?.[fromAddress]?.['0x0']

  return (
    <div className="flex items-start w-full">
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
        <span className="text-xs text-gray-40">{currentAccountName}</span>
        <div className="pt-1 pb-2 flex justify-between border-b border-gray-20 mb-2">
          <span className="text-gray-80">
            {fromAddress && shortenAddress(fromAddress)}
          </span>
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
        <span className="text-gray-80 flex items-center">
          {toAddress && shortenAddress(toAddress)}
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
  const {address: userAddress, nickname: currentAccountName} =
    useCurrentAccount()
  console.log(value)

  return (
    <div className="w-full flex flex-col pt-3 pb-6 px-4 items-center bg-blue-card-linear bg-no-repeat mt-1 mb-4">
      <span className="text-primary flex items-center">
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
            decimals={isDapp ? token?.decimals : 0}
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
        fromAddress={fromAddress || userAddress}
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
  fromAddress: PropTypes.string,
  isSendToken: PropTypes.bool,
  isApproveToken: PropTypes.bool,
  isDapp: PropTypes.bool,
}

export default AddressCard
