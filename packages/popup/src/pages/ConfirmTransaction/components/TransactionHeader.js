import PropTypes from 'prop-types'
import ApproveTransactionHeader from './ApproveTransactionHeader'
import TransferTransactionHeader from './TransferTransactionHeader'
import EIP7702TransactionHeader from './EIP7702TransactionHeader'
import {useTranslation} from 'react-i18next'

function EstimateChanges() {
  return null
}

function TransactionHeader({
  isApproveToken,
  spenderAddress,
  allowance,
  canEditAllowance,
  onEditAllowance,

  isSendToken,
  sendAmount,
  toAddress,

  isInternalEip7702Tx,
  delegateAddress,
  title,
  delegateAddressLabel,

  token,
  nickname,
  fromAddress,
}) {
  const {t} = useTranslation()
  if (isSendToken) {
    return (
      <TransferTransactionHeader
        token={token}
        sendAmount={sendAmount}
        fromAddress={fromAddress}
        toAddress={toAddress}
        nickname={nickname}
      />
    )
  }
  if (isInternalEip7702Tx) {
    return (
      <EIP7702TransactionHeader
        authority={fromAddress}
        delegateAddress={delegateAddress}
        title={title}
        authorityNickname={nickname}
        delegateAddressLabel={delegateAddressLabel}
      />
    )
  }
  if (isApproveToken) {
    return (
      <ApproveTransactionHeader
        token={token}
        onEditAllowance={onEditAllowance}
        canEditAllowance={canEditAllowance}
        allowance={allowance}
        spenderAddress={spenderAddress}
      />
    )
  }

  return (
    <div
      className="p-4 pb-6 bg-no-repeat bg-bottom bg-cover rounded-t-[8px] mb-4"
      style={{
        backgroundImage: 'url(/images/signature-request-bg.svg)',
      }}
    >
      <div className="relative flex items-center justify-center gap-1 text-[16px] leading-[18px] font-medium text-primary mb-4">
        <img alt="icon" className="w-3 h-3 mr-1" src="/images/sign-icon.svg" />
        <span>{t('signTransaction')}</span>
      </div>
      <EstimateChanges />
    </div>
  )
}

TransactionHeader.propTypes = {
  // shared
  token: PropTypes.object,
  fromAddress: PropTypes.string,
  nickname: PropTypes.string,
  // token approve
  isApproveToken: PropTypes.bool,
  spenderAddress: PropTypes.string,
  allowance: PropTypes.string,
  canEditAllowance: PropTypes.bool,
  onEditAllowance: PropTypes.func.isRequired,

  // token transfer
  isSendToken: PropTypes.bool,
  sendAmount: PropTypes.string,
  toAddress: PropTypes.string,

  // internal 7702
  isInternalEip7702Tx: PropTypes.bool,
  delegateAddress: PropTypes.string,
  title: PropTypes.string,
  delegateAddressLabel: PropTypes.string,
}

export default TransactionHeader
