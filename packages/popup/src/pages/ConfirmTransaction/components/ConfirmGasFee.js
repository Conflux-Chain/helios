import PropTypes from 'prop-types'
import {GasFee} from '../../../components'
import GasPayFee from './GasPayFee'

function GasFeePlaceholder() {
  return (
    <div className="gas-fee-container flex flex-col">
      <div className="mb-2 h-4 w-16 rounded bg-gray-4" />
      <div className="h-[88px] rounded border border-gray-10 bg-gray-4" />
    </div>
  )
}

function ConfirmGasFee({
  gasPayment,
  nativeToken,
  nativeBalance,
  accountAddress,
  networkDbId,
  estimateRst,
  uses1559Fees,
  isDeferredMax,
  sendTokenAddress,
  sendTokenAmount,
}) {
  const {tokenPay, sponsorship} = gasPayment

  if (gasPayment.loading) {
    return <GasFeePlaceholder />
  }

  const hasAlternativePayment =
    sponsorship.available ||
    tokenPay.available ||
    Boolean(tokenPay.selectedToken)

  if (!hasAlternativePayment) {
    return <GasFee estimateRst={estimateRst} uses1559Fees={uses1559Fees} />
  }

  return (
    <GasPayFee
      payment={gasPayment.payment}
      sponsorship={sponsorship}
      quote={tokenPay.selectedToken ? tokenPay.quote : null}
      options={tokenPay.options}
      nativeGasFee={gasPayment.nativeGasFee}
      gasTokenBalances={tokenPay.balances}
      gasToken={tokenPay.selectedToken}
      tokenPayConfig={tokenPay.config}
      nativeToken={nativeToken}
      nativeBalance={nativeBalance}
      accountAddress={accountAddress}
      networkDbId={networkDbId}
      estimateRst={estimateRst}
      uses1559Fees={uses1559Fees}
      onSelectPayment={gasPayment.selectPayment}
      onSelectGasToken={tokenPay.selectToken}
      isDeferredMax={isDeferredMax}
      sendTokenAddress={sendTokenAddress}
      sendTokenAmount={sendTokenAmount}
    />
  )
}

ConfirmGasFee.propTypes = {
  gasPayment: PropTypes.object,
  nativeToken: PropTypes.object,
  nativeBalance: PropTypes.string,
  accountAddress: PropTypes.string,
  networkDbId: PropTypes.number,
  estimateRst: PropTypes.object,
  uses1559Fees: PropTypes.bool,
  isDeferredMax: PropTypes.bool,
  sendTokenAddress: PropTypes.string,
  sendTokenAmount: PropTypes.string,
}

export default ConfirmGasFee
