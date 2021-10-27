import {useState} from 'react'
import {useTranslation} from 'react-i18next'
import Input from '@fluent-wallet/component-input'
import Button from '@fluent-wallet/component-button'
import {TitleNav} from '../../components'
import {useIsCfx, useIsEth} from '../../hooks'

function EditGasFee() {
  const {t} = useTranslation()
  const [gasPrice, setGasPrice] = useState('')
  const [gasLimit, setGasLimit] = useState('')
  const [nonce, setNonce] = useState('')
  const isCfx = useIsCfx()
  const isEth = useIsEth()
  const tickerName = isCfx ? 'CFX' : isEth ? 'ETH' : ''

  return (
    <div
      id="editGasFeeContainer"
      className="flex flex-col h-full bg-blue-circles bg-no-repeat bg-bg"
    >
      <div>
        <TitleNav title={t('editGasFeeControl')} />
        <main>
          <div>
            <span>{t('gasFee')}</span>
            <span>0.015 {tickerName}</span>
          </div>
          <Input
            prefix={`${t('gasPrice')} (${
              isCfx ? t('drip') : isEth ? t('gWei') : ''
            })`}
            type="number"
            value={gasPrice}
            onChange={e => setGasPrice(e.target.value)}
          />
          <Input
            type="number"
            prefix={t('gasLimit')}
            value={gasLimit}
            onChange={e => setGasLimit(e.target.value)}
          />
          {isCfx ? (
            <div>
              <span>{t('storageFee')}</span>
              <span>0.0005 {tickerName}</span>
            </div>
          ) : null}
          {isCfx ? (
            <div>
              <span>{t('storageLimit')}</span>
              <span>128</span>
            </div>
          ) : null}
          <div />
          <div>
            <span>{t('totalFee')}</span>
            <span>0.02{tickerName}</span>
          </div>
          <Input
            type="number"
            prefix={t('customNonce')}
            value={nonce}
            onChange={e => setNonce(e.target.value)}
          />
        </main>
      </div>
      <footer>
        <Button className="flex-1">{t('save')}</Button>
      </footer>
    </div>
  )
}

export default EditGasFee
