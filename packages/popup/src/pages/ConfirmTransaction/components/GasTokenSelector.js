import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import Modal from '@fluent-wallet/component-modal'
import {useCheckImage} from '../../../hooks'
import {
  NATIVE_TOKEN_BALANCE_KEY,
  canTokenPayGas,
  getTokenBalanceKey,
} from '../../../utils/tokenPayGas'
import {
  formatQuoteAmount,
  formatTokenAmount,
  getBalanceByAddress,
  getTokenIcon,
} from './tokenPayGasUtils'

function GasTokenOption({
  token,
  balance,
  warningText,
  amount,
  fiatAmount,
  selected,
  disabled,
  hideEstimate,
  onClick,
}) {
  const {t} = useTranslation()
  const icon = getTokenIcon(token)
  const isImgUrl = useCheckImage(icon)

  return (
    <button
      type="button"
      className={`mb-2 flex min-h-[58px] w-full items-center justify-between rounded-[4px] border p-3 text-left ${
        selected
          ? 'border-[#808BE7] bg-[#F3F6FF]'
          : 'border-transparent bg-gray-4'
      } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
      disabled={disabled}
      onClick={() => {
        if (disabled) return
        onClick?.()
      }}
    >
      <div className="flex min-w-0 items-center">
        <img
          src={isImgUrl ? icon : '/images/default-token-icon.svg'}
          alt=""
          className="mr-2 h-8 w-8 shrink-0 rounded-full"
        />
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-medium leading-[18px] text-gray-80">
            {token?.symbol}
          </span>
          <span className="mt-0.5 text-xs font-normal leading-4 text-gray-40">
            {t('tokenBalanceShort')}: {balance || '0'}
          </span>
          {warningText ? (
            <span className="mt-0.5 text-xs font-normal leading-4 text-[#E96170]">
              {warningText}
            </span>
          ) : null}
        </div>
      </div>
      <div className="ml-3 flex shrink-0 flex-col items-end">
        <p className="font-mono text-sm font-normal leading-[18px] text-gray-80">
          {hideEstimate ? '' : amount || (selected ? '' : '--')}
        </p>
        <p className="mt-0.5 font-mono text-xs font-normal leading-4 text-gray-40">
          {hideEstimate ? '' : fiatAmount || '≈$ --'}
        </p>
      </div>
    </button>
  )
}

function GasTokenSelector({
  open,
  onClose,
  tokenPayConfig,
  nativeToken,
  nativeBalance,
  nativeGasFee,
  options,
  tokenBalances,
  selectedGasToken,
  selectedGasTokenAmount,
  selectedGasTokenQuoteAmount,
  quoteToken,
  onSelectGasToken,
  sendTokenAddress,
  sendTokenAmount,
}) {
  const {t} = useTranslation()
  const isNativeGas = !selectedGasToken
  const tokens = tokenPayConfig?.tokens || []
  const nativeBalanceText = formatTokenAmount(
    nativeBalance,
    nativeToken?.decimals,
  )
  const nativeGasFeeText = formatTokenAmount(
    nativeGasFee,
    nativeToken?.decimals,
  )
  const displayQuoteToken = quoteToken || options?.quoteToken
  const sendTokenBalanceKey = getTokenBalanceKey(sendTokenAddress)
  const isNativeBalanceNotEnough = Boolean(
    nativeGasFee &&
      !canTokenPayGas({
        gasTokenBalanceKey: NATIVE_TOKEN_BALANCE_KEY,
        sendTokenBalanceKey,
        sendAmount: sendTokenAmount,
        gasTokenBalance: nativeBalance || '0x0',
        gasPaymentAmount: nativeGasFee,
      }),
  )

  const modalContent = (
    <div className="relative flex flex-col overflow-hidden px-6 pb-6 pt-6">
      <div className="relative flex flex-col">
        <div className="mb-3 text-center text-base font-medium leading-[22px] text-[#1B1B1C]">
          {t('selectToken')}
        </div>
        <p className="mb-2 text-xs font-normal leading-4 text-gray-40">
          {t('payWithNativeToken')}
        </p>
        <GasTokenOption
          token={nativeToken}
          balance={nativeBalanceText}
          warningText={isNativeBalanceNotEnough ? t('balanceIsNotEnough') : ''}
          amount={nativeGasFeeText}
          fiatAmount={formatQuoteAmount(
            options?.native?.estimatedQuoteAmount,
            displayQuoteToken,
          )}
          selected={isNativeGas}
          disabled={!nativeGasFee || isNativeBalanceNotEnough}
          onClick={() => {
            onSelectGasToken?.(null)
            onClose?.()
          }}
        />
        <p className="mb-2 mt-2 text-xs font-normal leading-4 text-gray-40">
          {t('payWithOtherTokens')}
        </p>
        {tokens.map(token => {
          const gasTokenBalanceKey = getTokenBalanceKey(token.address)
          const gasTokenBalance =
            getBalanceByAddress(tokenBalances, token.address) || '0x0'
          const selected =
            gasTokenBalanceKey === selectedGasToken?.address?.toLowerCase()
          const option = options?.tokens?.[gasTokenBalanceKey]
          const gasPaymentAmount = option?.estimatedTokenAmount
          const canPayGas = canTokenPayGas({
            gasTokenBalanceKey,
            sendTokenBalanceKey,
            sendAmount: sendTokenAmount,
            gasTokenBalance,
            gasPaymentAmount,
          })
          const hasGasPaymentEstimate = Boolean(gasPaymentAmount)
          const isBalanceNotEnough = hasGasPaymentEstimate && !canPayGas
          const disabled = !hasGasPaymentEstimate || isBalanceNotEnough
          const tokenAmount = selected
            ? selectedGasTokenAmount || gasPaymentAmount
            : gasPaymentAmount
          const tokenQuoteAmount = selected
            ? selectedGasTokenQuoteAmount || option?.estimatedQuoteAmount
            : option?.estimatedQuoteAmount

          return (
            <GasTokenOption
              key={token.address}
              token={token}
              balance={formatTokenAmount(gasTokenBalance, token.decimals)}
              warningText={isBalanceNotEnough ? t('balanceIsNotEnough') : ''}
              amount={formatTokenAmount(tokenAmount, token.decimals)}
              fiatAmount={formatQuoteAmount(
                tokenQuoteAmount,
                displayQuoteToken,
              )}
              selected={selected}
              disabled={disabled}
              hideEstimate={!hasGasPaymentEstimate}
              onClick={() => {
                onSelectGasToken?.(token)
                onClose?.()
              }}
            />
          )
        })}
      </div>
    </div>
  )

  return (
    <Modal
      id="gasPayModal"
      className="!p-0 overflow-hidden"
      contentClassName="relative"
      open={open}
      content={modalContent}
      onClose={onClose}
      wrapperClassName="z-[60]"
    />
  )
}

GasTokenOption.propTypes = {
  token: PropTypes.object,
  balance: PropTypes.string,
  warningText: PropTypes.string,
  amount: PropTypes.string,
  fiatAmount: PropTypes.string,
  selected: PropTypes.bool,
  disabled: PropTypes.bool,
  hideEstimate: PropTypes.bool,
  onClick: PropTypes.func,
}

GasTokenSelector.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  tokenPayConfig: PropTypes.object,
  nativeToken: PropTypes.object,
  nativeBalance: PropTypes.string,
  nativeGasFee: PropTypes.string,
  options: PropTypes.object,
  tokenBalances: PropTypes.object,
  selectedGasToken: PropTypes.object,
  selectedGasTokenAmount: PropTypes.string,
  selectedGasTokenQuoteAmount: PropTypes.string,
  quoteToken: PropTypes.object,
  onSelectGasToken: PropTypes.func,
  sendTokenAddress: PropTypes.string,
  sendTokenAmount: PropTypes.string,
}

export default GasTokenSelector
