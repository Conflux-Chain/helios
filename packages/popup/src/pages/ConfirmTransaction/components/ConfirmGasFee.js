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
  isHwAccount,
  tokenPayGas,
  nativeToken,
  nativeBalance,
  accountAddress,
  networkDbId,
  estimateRst,
  uses1559Fees,
  sendTokenAddress,
  sendTokenAmount,
}) {
  if (!isHwAccount && tokenPayGas.tokenPayConfigLoading) {
    return <GasFeePlaceholder />
  }

  if (tokenPayGas.canUseTokenPay || tokenPayGas.selectedGasToken) {
    return (
      <GasPayFee
        quote={tokenPayGas.selectedGasToken ? tokenPayGas.tokenPayQuote : null}
        options={tokenPayGas.tokenPayGasOptions}
        nativeGasFee={tokenPayGas.nativeGasFee}
        gasTokenBalances={tokenPayGas.gasTokenBalances}
        gasToken={tokenPayGas.selectedGasToken}
        tokenPayConfig={tokenPayGas.tokenPayConfig}
        nativeToken={nativeToken}
        nativeBalance={nativeBalance}
        accountAddress={accountAddress}
        networkDbId={networkDbId}
        estimateRst={estimateRst}
        uses1559Fees={uses1559Fees}
        onSelectGasToken={tokenPayGas.setSelectedGasToken}
        sendTokenAddress={sendTokenAddress}
        sendTokenAmount={sendTokenAmount}
      />
    )
  }

  return <GasFee estimateRst={estimateRst} uses1559Fees={uses1559Fees} />
}

ConfirmGasFee.propTypes = {
  isHwAccount: PropTypes.bool,
  tokenPayGas: PropTypes.object,
  nativeToken: PropTypes.object,
  nativeBalance: PropTypes.string,
  accountAddress: PropTypes.string,
  networkDbId: PropTypes.number,
  estimateRst: PropTypes.object,
  uses1559Fees: PropTypes.bool,
  sendTokenAddress: PropTypes.string,
  sendTokenAmount: PropTypes.string,
}

export default ConfirmGasFee
