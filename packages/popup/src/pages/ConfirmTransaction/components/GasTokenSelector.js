import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import Modal from '@fluent-wallet/component-modal'
import {useCheckImage} from '../../../hooks'
import {bn16} from '../../../utils'
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
  const isNativeBalanceNotEnough = Boolean(
    nativeGasFee &&
      bn16(nativeBalance || '0x0').lt(bn16(nativeGasFee || '0x0')),
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
          onClick={() => {
            onSelectGasToken?.(null)
            onClose?.()
          }}
        />
        <p className="mb-2 mt-2 text-xs font-normal leading-4 text-gray-40">
          {t('payWithOtherTokens')}
        </p>
        {tokens.map(token => {
          const tokenAddress = token.address?.toLowerCase()
          const rawBalance = getBalanceByAddress(tokenBalances, token.address)
          const disabled = !rawBalance || bn16(rawBalance).isZero()
          const selected =
            tokenAddress === selectedGasToken?.address?.toLowerCase()
          const option = options?.tokens?.[tokenAddress]
          const hasTokenAmount = Boolean(option?.estimatedTokenAmount)
          let tokenAmount = ''
          let tokenQuoteAmount = ''
          if (!disabled) {
            tokenAmount = selected
              ? selectedGasTokenAmount || option?.estimatedTokenAmount
              : option?.estimatedTokenAmount
            tokenQuoteAmount = selected
              ? selectedGasTokenQuoteAmount || option?.estimatedQuoteAmount
              : option?.estimatedQuoteAmount
          }

          return (
            <GasTokenOption
              key={token.address}
              token={token}
              balance={formatTokenAmount(rawBalance, token.decimals)}
              amount={formatTokenAmount(tokenAmount, token.decimals)}
              fiatAmount={formatQuoteAmount(
                tokenQuoteAmount,
                displayQuoteToken,
              )}
              selected={selected}
              disabled={disabled || !hasTokenAmount}
              hideEstimate={disabled}
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
}

export default GasTokenSelector
