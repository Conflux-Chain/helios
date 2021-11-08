import {useState, useEffect} from 'react'
import {useHistory} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import Button from '@fluent-wallet/component-button'
import {TitleNav, DisplayBalance, NumberInput} from '../../components'
import {useEstimateTx} from '../../hooks'
import {useNetworkTypeIsCfx, useNetworkTypeIsEth} from '../../hooks/useApi'

import {WrapperWithLabel} from './components'
import {
  GWEI_DECIMALS,
  Big,
  formatHexToDecimal,
} from '@fluent-wallet/data-format'
import useGlobalStore from '../../stores'
import {ROUTES} from '../../constants'

const getDecimalData = data => (data ? formatHexToDecimal(data) : '0')

function EditGasFee() {
  const {HOME} = ROUTES
  const {t} = useTranslation()
  const history = useHistory()
  const [gasPriceErr, setGasPriceErr] = useState('')
  const [gasLimitErr, setGasLimitErr] = useState('')
  const [nonceErr, setNonceErr] = useState('')
  const [gasFee, setGasFee] = useState('0')
  const [totalFee, setTotalFee] = useState('0')
  const [inputGasPrice, setInputGasPrice] = useState('0')
  const [inputGasLimit, setInputGasLimit] = useState('0')
  const [inputNonce, setInputNonce] = useState('0')
  const {toAddress, setGasPrice, setGasLimit, setNonce} = useGlobalStore()

  const isCfx = useNetworkTypeIsCfx()
  const isEth = useNetworkTypeIsEth()
  const symbol = isCfx ? 'CFX' : isEth ? 'ETH' : ''
  const estimateRst = useEstimateTx({
    from: 'cfx:aamysddjren1zfp36agsek5fxt2w0st8feps3297ek',
    gasPrice: '0x1',
    to: 'cfx:aar6gezvnnjyp2z9mjv06whavnadw1kurugxrgpdv7',
    value: '0x1bc16d674ec80000',
  })
  console.log('estimateRst', estimateRst)
  const {
    loading,
    gasPrice: initGasPrice,
    gasUsed,
    nonce: initNonce,
    storageCollateralized,
    storageFeeDrip,
  } = estimateRst || {}
  // TODO: get from address
  // if (!toAddress) {
  //   history.push(HOME)
  // }

  useEffect(() => {
    gasUsed && setInputGasLimit(getDecimalData(gasUsed))
    initGasPrice && setInputGasPrice(getDecimalData(initGasPrice))
    initNonce && setInputNonce(getDecimalData(initNonce))
  }, [gasUsed, initGasPrice, initNonce])

  useEffect(() => {
    setGasPriceErr(
      new Big(inputGasPrice).gt(0)
        ? ''
        : t('gasPriceErrMSg', {
            unit: isCfx ? t('drip') : isEth ? t('gWei') : '',
          }),
    )
  }, [inputGasPrice, isCfx, isEth, t])

  useEffect(() => {
    setGasLimitErr(
      new Big(inputGasLimit).gte(getDecimalData(gasUsed))
        ? ''
        : t('gasLimitErrMsg', {
            gasUsed: getDecimalData(gasUsed),
          }),
    )
  }, [inputGasLimit, gasUsed, t])

  useEffect(() => {
    setNonceErr(new Big(inputNonce).gt(0) ? '' : t('nonceErr'))
  }, [inputNonce, t])

  useEffect(() => {
    if (isCfx) {
      setGasFee(new Big(inputGasLimit).times(inputGasPrice).toString(10))
    }
    if (isEth) {
      setGasFee(
        new Big(inputGasLimit)
          .times(inputGasPrice)
          .times(`1e${GWEI_DECIMALS}`)
          .toString(10),
      )
    }
  }, [inputGasLimit, inputGasPrice, isCfx, isEth])

  useEffect(() => {
    if (isCfx) {
      setTotalFee(
        new Big(gasFee)
          .add(new Big(getDecimalData(storageFeeDrip)))
          .toString(10),
      )
    }
  }, [storageFeeDrip, gasFee, isCfx])

  const saveGasData = () => {
    setGasPrice(inputGasPrice)
    setGasLimit(inputGasLimit)
    setNonce(inputNonce)
    history.goBack()
  }

  return initGasPrice &&
    gasUsed &&
    initNonce &&
    storageCollateralized &&
    storageFeeDrip ? (
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
                maxWidth={218}
                maxWidthStyle="max-w-[218px]"
                symbol={symbol}
                balance={gasFee}
              />
            }
          />
          <WrapperWithLabel
            containerClass={`${gasPriceErr ? 'mb-9' : 'mb-3'} relative`}
            leftContent={`${t('inputGasPrice')} (${
              isCfx ? t('drip') : isEth ? t('gWei') : ''
            })`}
            rightContent={
              <NumberInput
                size="small"
                width="w-32"
                value={inputGasPrice}
                errorMessage={gasPriceErr}
                errorClassName="absolute right-0 -bottom-6"
                onInputChange={setInputGasPrice}
              />
            }
          />
          <WrapperWithLabel
            leftContent={t('inputGasLimit')}
            containerClass={`${gasLimitErr ? 'mb-9' : 'mb-3'} relative`}
            rightContent={
              <NumberInput
                size="small"
                width="w-32"
                errorClassName="absolute right-0 -bottom-6"
                value={inputGasLimit}
                errorMessage={gasLimitErr}
                onInputChange={setInputGasLimit}
              />
            }
          />
          {isCfx ? (
            <div>
              <WrapperWithLabel
                leftContent={t('storageFee')}
                containerClass="mb-3"
                rightClass="text-gray-80"
                rightContent={
                  <DisplayBalance
                    maxWidth={218}
                    maxWidthStyle="max-w-[218px]"
                    symbol={symbol}
                    balance={getDecimalData(storageFeeDrip)}
                  />
                }
              />
              <WrapperWithLabel
                leftContent={t('storageCollateralized')}
                rightClass="text-gray-80"
                rightContent={getDecimalData(storageCollateralized)}
              />
            </div>
          ) : null}
          <div className="bg-gray-20 h-px mx-3 my-4" />
          {isCfx ? (
            <WrapperWithLabel
              leftContent={t('totalFee')}
              containerClass="mb-10"
              leftClass="text-gray-80"
              rightClass="text-gray-80 text-base"
              rightContent={
                <DisplayBalance
                  maxWidth={218}
                  maxWidthStyle="max-w-[218px]"
                  symbol={symbol}
                  initialFontSize={16}
                  balance={totalFee}
                />
              }
            />
          ) : null}

          <WrapperWithLabel
            leftContent={t('customNonce')}
            containerClass="relative"
            rightContent={
              <NumberInput
                size="small"
                width="w-32"
                value={inputNonce}
                errorMessage={nonceErr}
                errorClassName="absolute right-0 -bottom-6"
                onInputChange={setInputNonce}
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
          disabled={loading || !!gasPriceErr || !!nonceErr || !!gasLimitErr}
        >
          {t('save')}
        </Button>
      </footer>
    </div>
  ) : null
}

export default EditGasFee
