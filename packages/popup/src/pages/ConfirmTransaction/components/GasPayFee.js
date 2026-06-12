import {useState} from 'react'
import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {useHistory} from 'react-router-dom'
import Tooltip from '@fluent-wallet/component-tooltip'
import {
  DownOutlined,
  QuestionCircleOutlined,
  RightOutlined,
} from '@fluent-wallet/component-icons'
import Link from '@fluent-wallet/component-link'
import {DisplayBalance, GasFee} from '../../../components'
import {useCheckImage, useCurrentTxStore} from '../../../hooks'
import {ROUTES} from '../../../constants'
import {formatQuoteAmount, getTokenIcon} from './tokenPayGasUtils'
import GasTokenSelector from './GasTokenSelector'

const {EDIT_GAS_FEE} = ROUTES

function GasPayHeader({children}) {
  const {t} = useTranslation()
  return (
    <header className="mb-2 flex items-center text-gray-40">
      <span>{t('gasFee')}</span>
      <Tooltip content={t('gasPayFeeTooltip')} placement="top">
        <QuestionCircleOutlined className="ml-1 h-3.5 w-3.5 cursor-pointer text-gray-40" />
      </Tooltip>
      {children}
    </header>
  )
}

function TokenGasPayHeader({uses1559Fees, disabled}) {
  const {t} = useTranslation()
  const history = useHistory()
  const {gasLevel} = useCurrentTxStore()

  return (
    <header className="gas-fee-header mb-2 flex w-full items-center justify-between text-gray-40">
      <div className="flex items-center">
        <span>{t('gasFee')}</span>
        <Tooltip content={t('gasPayFeeTooltip')} placement="top">
          <QuestionCircleOutlined className="ml-1 h-3.5 w-3.5 cursor-pointer text-gray-40" />
        </Tooltip>
      </div>
      <span className="flex items-center">
        <Link onClick={() => history.push(EDIT_GAS_FEE)} disabled={disabled}>
          {uses1559Fees ? t(gasLevel) : t('edit')}
          <RightOutlined className="ml-1 h-3 w-3 text-primary" />
        </Link>
      </span>
    </header>
  )
}

function NativeGasPayFee({
  estimateRst,
  uses1559Fees,
  nativeToken,
  nativeBalance,
  nativeGasFee,
  gasTokenBalances,
  tokenPayConfig,
  onSelectGasToken,
  options,
}) {
  const [open, setOpen] = useState(false)
  const nativeTokenIcon = getTokenIcon(nativeToken)
  const isImgUrl = useCheckImage(nativeTokenIcon)

  return (
    <>
      <GasFee
        estimateRst={estimateRst}
        uses1559Fees={uses1559Fees}
        titleDes={<GasPayHeader />}
        prefix={
          <button
            type="button"
            className="flex mr-2 items-center justify-center rounded-full bg-gray-0"
            onClick={() => setOpen(true)}
          >
            <img
              src={
                isImgUrl ? nativeTokenIcon : '/images/default-token-icon.svg'
              }
              alt=""
              className="h-8 w-8 rounded-full"
            />
          </button>
        }
        suffix={
          <button
            type="button"
            className="flex ml-2 h-8 w-8 items-center justify-center"
            onClick={() => setOpen(true)}
          >
            <DownOutlined className="h-4 w-4 text-gray-60" />
          </button>
        }
      />

      <GasTokenSelector
        open={open}
        onClose={() => setOpen(false)}
        tokenPayConfig={tokenPayConfig}
        options={options}
        nativeToken={nativeToken}
        nativeBalance={nativeBalance}
        nativeGasFee={nativeGasFee}
        tokenBalances={gasTokenBalances}
        selectedGasToken={null}
        selectedGasTokenAmount={null}
        selectedGasTokenQuoteAmount={null}
        quoteToken={tokenPayConfig?.quoteToken}
        onSelectGasToken={onSelectGasToken}
      />
    </>
  )
}

function TokenGasPayFee({
  quote,
  gasToken,
  tokenPayConfig,
  options,
  nativeToken,
  nativeBalance,
  nativeGasFee,
  gasTokenBalances,
  onSelectGasToken,
  uses1559Fees,
}) {
  const [open, setOpen] = useState(false)
  const displayToken = quote?.gasToken || gasToken || {}
  const displayTokenIcon = getTokenIcon(displayToken)
  const isImgUrl = useCheckImage(displayTokenIcon)
  const option = options?.tokens?.[gasToken?.address?.toLowerCase()]
  const displayTokenCost = quote?.tokenCost || option?.estimatedTokenAmount
  const displayQuoteAmount = quote?.quoteAmount || option?.estimatedQuoteAmount
  const displayQuoteToken = quote?.quoteToken || options?.quoteToken
  const subText = formatQuoteAmount(displayQuoteAmount, displayQuoteToken)

  return (
    <div className="gas-pay-fee-container flex flex-col">
      <TokenGasPayHeader
        uses1559Fees={uses1559Fees}
        disabled={!displayTokenCost}
      />
      <button
        type="button"
        className="relative flex w-full items-center rounded border border-gray-10 px-3 py-3 text-left"
        onClick={() => setOpen(true)}
      >
        <img
          src={isImgUrl ? displayTokenIcon : '/images/default-token-icon.svg'}
          alt=""
          className="mr-3 h-8 w-8 rounded-full shrink-0"
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <DisplayBalance
            id="tokenPayGasFee"
            balance={displayTokenCost}
            decimals={displayToken?.decimals}
            symbol={displayToken?.symbol}
            maxWidth={190}
            maxWidthStyle="max-w-[190px]"
            className="text-base font-medium"
            initialFontSize={16}
          />
          <span className="mt-1 text-xs text-gray-60 truncate">{subText}</span>
        </div>
        <DownOutlined className="ml-2 h-4 w-4 shrink-0 text-gray-60" />
      </button>
      <GasTokenSelector
        open={open}
        onClose={() => setOpen(false)}
        tokenPayConfig={tokenPayConfig}
        options={options}
        nativeToken={nativeToken}
        nativeBalance={nativeBalance}
        nativeGasFee={nativeGasFee}
        tokenBalances={gasTokenBalances}
        selectedGasToken={gasToken}
        selectedGasTokenAmount={displayTokenCost}
        selectedGasTokenQuoteAmount={displayQuoteAmount}
        quoteToken={displayQuoteToken || tokenPayConfig?.quoteToken}
        onSelectGasToken={onSelectGasToken}
      />
    </div>
  )
}

function GasPayFee({gasToken, ...props}) {
  return gasToken ? (
    <TokenGasPayFee gasToken={gasToken} {...props} />
  ) : (
    <NativeGasPayFee {...props} />
  )
}

GasPayHeader.propTypes = {
  children: PropTypes.node,
}

TokenGasPayHeader.propTypes = {
  uses1559Fees: PropTypes.bool,
  disabled: PropTypes.bool,
}

NativeGasPayFee.propTypes = {
  estimateRst: PropTypes.object,
  uses1559Fees: PropTypes.bool,
  nativeToken: PropTypes.object,
  nativeBalance: PropTypes.string,
  nativeGasFee: PropTypes.string,
  gasTokenBalances: PropTypes.object,
  tokenPayConfig: PropTypes.object,
  options: PropTypes.object,
  onSelectGasToken: PropTypes.func,
}

TokenGasPayFee.propTypes = {
  quote: PropTypes.object,
  gasToken: PropTypes.object,
  tokenPayConfig: PropTypes.object,
  options: PropTypes.object,
  nativeToken: PropTypes.object,
  nativeBalance: PropTypes.string,
  nativeGasFee: PropTypes.string,
  gasTokenBalances: PropTypes.object,
  onSelectGasToken: PropTypes.func,
  uses1559Fees: PropTypes.bool,
}

GasPayFee.propTypes = {
  gasToken: PropTypes.object,
  options: PropTypes.object,
}

export default GasPayFee
