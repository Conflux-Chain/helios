import {useState, useEffect} from 'react'
import {useHistory} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import Button from '@fluent-wallet/component-button'
import {TitleNav, DisplayBalance, NumberInput} from '../../components'
import {useNetworkTypeIsCfx, usePendingAuthReq} from '../../hooks/useApi'
import {useTxParams, useEstimateTx, useDappParams} from '../../hooks'
import {WrapperWithLabel} from './components'
import {
  Big,
  formatDecimalToHex,
  formatHexToDecimal,
  CFX_DECIMALS,
  ETH_DECIMALS,
} from '@fluent-wallet/data-format'
import useGlobalStore from '../../stores'

function EditGasFee() {
  const {t} = useTranslation()
  const history = useHistory()
  const [gasPriceErr, setGasPriceErr] = useState('')
  const [gasLimitErr, setGasLimitErr] = useState('')
  const [nonceErr, setNonceErr] = useState('')
  const [inputGasPrice, setInputGasPrice] = useState('0')
  const [inputGasLimit, setInputGasLimit] = useState('0')
  const [inputNonce, setInputNonce] = useState('')
  const {gasPrice, gasLimit, nonce, setGasPrice, setGasLimit, setNonce} =
    useGlobalStore()

  const networkTypeIsCfx = useNetworkTypeIsCfx()
  const symbol = networkTypeIsCfx ? 'CFX' : 'ETH'
  const decimals = networkTypeIsCfx ? CFX_DECIMALS : ETH_DECIMALS

  const pendingAuthReq = usePendingAuthReq()
  const isDapp = pendingAuthReq?.length > 0
  const tx = useDappParams()
  const txParams = useTxParams()
  const originParams = !isDapp ? {...txParams} : {...tx}

  const params = {
    ...originParams,
    gasPrice: formatDecimalToHex(inputGasPrice),
    gas: formatDecimalToHex(inputGasLimit),
  }
  if (nonce) params.nonce = formatDecimalToHex(nonce)
  const estimateRst = useEstimateTx(params) || {}
  const {gasUsed, storageCollateralized} = estimateRst
  const {storageFeeDrip, gasFeeDrip, txFeeDrip} = estimateRst?.customData || {}

  useEffect(() => {
    setInputGasLimit(gasLimit)
    setInputGasPrice(gasPrice)
    setInputNonce(nonce)
  }, [gasLimit, gasPrice, nonce])

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
    if (new Big(gasLimit || '0').gte(formatHexToDecimal(gasUsed || '21000'))) {
      setGasLimitErr('')
    } else {
      setGasLimitErr(
        t('gasLimitErrMsg', {
          gasUsed: formatHexToDecimal(gasUsed || '21000'),
        }),
      )
    }
  }

  const onChangeNonce = nonce => {
    setInputNonce(nonce)
    if (!inputNonce || new Big(inputNonce).gt(0)) {
      setNonceErr('')
    } else {
      setNonceErr(t('nonceErr'))
    }
  }

  const saveGasData = () => {
    setGasPrice(inputGasPrice)
    setGasLimit(inputGasLimit)
    setNonce(inputNonce)
    history.goBack()
  }

  return (
    <div
      id="editGasFeeContainer"
      className="h-full flex flex-col bg-blue-circles bg-no-repeat bg-bg"
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
                size="small"
                width="w-32"
                value={inputNonce}
                errorMessage={nonceErr}
                errorClassName="absolute right-0 -bottom-6"
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
