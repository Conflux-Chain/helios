import {useState, useEffect} from 'react'
import {useHistory} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import Button from '@fluent-wallet/component-button'
import {TitleNav, DisplayBalance, NumberInput} from '../../components'
import {
  useNetworkTypeIsCfx,
  useCfxMaxGasLimit,
  useCurrentTicker,
} from '../../hooks/useApi'
import {useCurrentTxParams, useEstimateTx, useDappParams} from '../../hooks'
import {getPageType} from '../../utils'
import {WrapperWithLabel} from './components'
import {
  Big,
  formatDecimalToHex,
  formatHexToDecimal,
} from '@fluent-wallet/data-format'

function EditGasFee() {
  const {t} = useTranslation()
  const history = useHistory()
  const [gasPriceErr, setGasPriceErr] = useState('')
  const [gasLimitErr, setGasLimitErr] = useState('')
  const [nonceErr, setNonceErr] = useState('')
  const [inputGasPrice, setInputGasPrice] = useState('0')
  const [inputGasLimit, setInputGasLimit] = useState('0')
  const [inputNonce, setInputNonce] = useState('')
  const {
    gasPrice,
    gasLimit,
    nonce,
    setGasPrice,
    setGasLimit,
    setNonce,
    tx: txParams,
  } = useCurrentTxParams()

  const networkTypeIsCfx = useNetworkTypeIsCfx()
  const cfxMaxGasLimit = useCfxMaxGasLimit(networkTypeIsCfx)
  const {symbol, decimals} = useCurrentTicker()

  const isDapp = getPageType() === 'notification'
  const tx = useDappParams()
  const originParams = !isDapp ? {...txParams} : {...tx}

  const params = {
    ...originParams,
    gasPrice: formatDecimalToHex(inputGasPrice),
    gas: formatDecimalToHex(inputGasLimit),
  }
  if (nonce) params.nonce = formatDecimalToHex(nonce)
  const estimateRst = useEstimateTx(params) || {}
  const {
    gasUsed,
    storageCollateralized,
    storageFeeDrip,
    gasFeeDrip,
    txFeeDrip,
  } = estimateRst

  useEffect(() => {
    setInputGasLimit(gasLimit)
    setInputGasPrice(gasPrice)
  }, [gasLimit, gasPrice])

  const onChangeGasPrice = gasPrice => {
    setInputGasPrice(gasPrice)
    if (new Big(gasPrice || '0').gt(0)) {
      setGasPriceErr('')
    } else {
      setGasPriceErr(
        t('gasPriceErrMSg', {
          unit: networkTypeIsCfx ? t('drip') : t('gWei'),
        }),
      )
    }
  }

  const onChangeGasLimit = gasLimit => {
    setInputGasLimit(gasLimit)
    if (new Big(gasLimit || '0').lt(formatHexToDecimal(gasUsed || '21000'))) {
      setGasLimitErr(
        t('gasLimitMinErr', {
          gasUsed: formatHexToDecimal(gasUsed || '21000'),
        }),
      )
    } else if (
      cfxMaxGasLimit &&
      new Big(gasLimit || '0').gt(formatHexToDecimal(cfxMaxGasLimit))
    ) {
      setGasLimitErr(
        t('gasLimitMaxErr', {
          gasMax: formatHexToDecimal(cfxMaxGasLimit),
        }),
      )
    } else {
      setGasLimitErr('')
    }
  }

  const onChangeNonce = nonce => {
    setInputNonce(nonce)
    if (!nonce || new Big(nonce).gt(0)) {
      setNonceErr('')
    } else {
      setNonceErr(t('nonceErr'))
    }
  }

  const saveGasData = () => {
    setGasPrice(inputGasPrice)
    setGasLimit(inputGasLimit)
    inputNonce && setNonce(inputNonce)
    history.goBack()
  }

  return (
    <div
      id="editGasFeeContainer"
      className="h-full w-full flex flex-col bg-blue-circles bg-no-repeat bg-0"
    >
      <div className="flex-1">
        <TitleNav title={t('editGasFeeControl')} />
        <main className="mt-3">
          <WrapperWithLabel
            leftContent={t('gasFee')}
            containerClass="mb-3"
            rightClass="text-gray-80"
            rightContent={
              <DisplayBalance
                id="gasFee"
                maxWidth={218}
                maxWidthStyle="max-w-[218px]"
                symbol={symbol}
                balance={gasFeeDrip || '0x0'}
                decimals={decimals}
              />
            }
          />
          <WrapperWithLabel
            containerClass={`${gasPriceErr ? 'mb-9' : 'mb-3'} relative`}
            leftContent={`${t('gasPrice')} (${
              networkTypeIsCfx ? 'Drip' : 'GWei'
            })`}
            rightContent={
              <NumberInput
                size="small"
                width="w-32"
                value={inputGasPrice}
                id="gasPrice"
                errorMessage={gasPriceErr}
                errorClassName="absolute right-0 -bottom-6"
                containerClassName="relative z-50"
                onChange={e => onChangeGasPrice(e.target.value)}
              />
            }
          />
          <WrapperWithLabel
            leftContent={t('gasLimit')}
            containerClass={`${gasLimitErr ? 'mb-9' : 'mb-3'} relative`}
            rightContent={
              <NumberInput
                size="small"
                width="w-32"
                id="gasLimit"
                errorClassName="absolute right-0 -bottom-6"
                containerClassName="relative z-50"
                value={inputGasLimit}
                errorMessage={gasLimitErr}
                onChange={e => onChangeGasLimit(e.target.value)}
              />
            }
          />
          {networkTypeIsCfx ? (
            <div>
              <WrapperWithLabel
                leftContent={t('storageFee')}
                containerClass="mb-3"
                rightClass="text-gray-80"
                rightContent={
                  <DisplayBalance
                    id="storageFee"
                    maxWidth={218}
                    maxWidthStyle="max-w-[218px]"
                    symbol={symbol}
                    balance={storageFeeDrip || '0x0'}
                    decimals={decimals}
                  />
                }
              />
              <WrapperWithLabel
                leftContent={t('storageCollateralized')}
                rightClass="text-gray-80"
                rightContent={
                  <span id="storageLimit">
                    {formatHexToDecimal(storageCollateralized)}
                  </span>
                }
              />
            </div>
          ) : null}
          <div className="bg-gray-20 h-px mx-3 my-4" />
          {networkTypeIsCfx ? (
            <WrapperWithLabel
              leftContent={t('totalFee')}
              containerClass="mb-10"
              leftClass="text-gray-80"
              rightClass="text-gray-80 text-base"
              rightContent={
                <DisplayBalance
                  id="txFee"
                  maxWidth={218}
                  maxWidthStyle="max-w-[218px]"
                  symbol={symbol}
                  initialFontSize={16}
                  balance={txFeeDrip || '0x0'}
                  decimals={decimals}
                />
              }
            />
          ) : null}

          <WrapperWithLabel
            leftContent={t('customNonce')}
            containerClass="relative"
            rightContent={
              <NumberInput
                id="nonce"
                placeholder={nonce}
                size="small"
                width="w-32"
                value={inputNonce}
                errorMessage={nonceErr}
                errorClassName="absolute right-0 -bottom-6"
                containerClassName="relative z-50"
                onChange={e => onChangeNonce(e.target.value)}
              />
            }
          />
        </main>
      </div>
      <footer>
        <Button
          className="w-70  mx-auto mb-9"
          id="saveGasFeeBtn"
          onClick={saveGasData}
          disabled={!!gasPriceErr || !!nonceErr || !!gasLimitErr}
        >
          {t('save')}
        </Button>
      </footer>
    </div>
  )
}

export default EditGasFee
