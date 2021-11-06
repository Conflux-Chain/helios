import {useState, useEffect} from 'react'
import {useTranslation} from 'react-i18next'
import Button from '@fluent-wallet/component-button'
import {TitleNav, DisplayBalance, NumberInput} from '../../components'
import {useIsCfx, useIsEth} from '../../hooks'
import {WrapperWithLabel} from './components'
import {fromCfxToDrip, GWEI_DECIMALS, Big} from '@fluent-wallet/data-format'

/* eslint-disable react/prop-types */
function EditGasFee({
  gasUsed = '21000',
  storageLimit = '128',
  _gasPrice = '6',
}) {
  const {t} = useTranslation()
  const [gasPrice, setGasPrice] = useState(_gasPrice)
  const [gasLimit, setGasLimit] = useState(gasUsed)
  const [nonce, setNonce] = useState('0')
  const [gasPriceErr, setGasPriceErr] = useState('')
  const [gasLimitErr, setGasLimitErr] = useState('')
  const [nonceErr, setNonceErr] = useState('')
  const [gasFee, setGasFee] = useState('0')
  const [totalFee, setTotalFee] = useState('0')
  const isCfx = useIsCfx()
  const isEth = useIsEth()
  const symbol = isCfx ? 'CFX' : isEth ? 'ETH' : ''
  // TODO: wait for hook reaching gas used and storage limit and gas price and nonce

  useEffect(() => {
    setGasPriceErr(
      new Big(gasPrice).gt(0)
        ? ''
        : t('gasPriceErrMSg', {
            unit: isCfx ? t('drip') : isEth ? t('gWei') : '',
          }),
    )
  }, [gasPrice, isCfx, isEth, t])

  useEffect(() => {
    setGasLimitErr(
      new Big(gasLimit).gte(gasUsed)
        ? ''
        : t('gasLimitErrMsg', {
            gasUsed,
          }),
    )
  }, [gasLimit, gasUsed, t])

  useEffect(() => {
    setNonceErr(new Big(nonce).gt(0) ? '' : t('nonceErr'))
  }, [nonce, t])

  useEffect(() => {
    if (isCfx) {
      setGasFee(new Big(gasLimit).times(gasPrice).toString(10))
    }
    if (isEth) {
      setGasFee(
        new Big(gasLimit)
          .times(gasPrice)
          .times(`1e${GWEI_DECIMALS}`)
          .toString(10),
      )
    }
  }, [gasLimit, gasPrice, isCfx, isEth])

  useEffect(() => {
    if (isCfx) {
      setTotalFee(
        new Big(gasFee)
          .add(fromCfxToDrip(new Big(storageLimit).div(1024)))
          .toString(10),
      )
    }
  }, [storageLimit, gasFee, isCfx])

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
                maxWidth={218}
                maxWidthStyle="max-w-[218px]"
                symbol={symbol}
                balance={gasFee}
              />
            }
          />
          <WrapperWithLabel
            containerClass={`${gasPriceErr ? 'mb-9' : 'mb-3'} relative`}
            leftContent={`${t('gasPrice')} (${
              isCfx ? t('drip') : isEth ? t('gWei') : ''
            })`}
            rightContent={
              <NumberInput
                size="small"
                width="w-32"
                value={gasPrice}
                errorMessage={gasPriceErr}
                errorClassName="absolute right-0 -bottom-6"
                onInputChange={setGasPrice}
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
                errorClassName="absolute right-0 -bottom-6"
                value={gasLimit}
                errorMessage={gasLimitErr}
                onInputChange={setGasLimit}
              />
            }
          />
          {isCfx ? (
            <div>
              <WrapperWithLabel
                leftContent={t('storageFee')}
                containerClass="mb-3"
                rightClass="text-gray-80"
                rightContent={`0.015 ${symbol}`}
              />
              <WrapperWithLabel
                leftContent={t('storageLimit')}
                rightClass="text-gray-80"
                rightContent={storageLimit}
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
                value={nonce}
                errorMessage={nonceErr}
                errorClassName="absolute right-0 -bottom-6"
                onInputChange={setNonce}
              />
            }
          />
        </main>
      </div>
      <footer>
        <Button
          className="w-70  mx-auto mb-9"
          id="saveGasFeeBtn"
          disabled={!!gasPriceErr || !!nonceErr || !!gasLimitErr}
        >
          {t('save')}
        </Button>
      </footer>
    </div>
  )
}

export default EditGasFee
