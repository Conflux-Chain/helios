import {useState} from 'react'
import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {toThousands} from '@fluent-wallet/data-format'
import {EditOutlined} from '@fluent-wallet/component-icons'
import {WrapIcon, NumberInput} from '../../../components'

function CustomOptional({
  networkTypeIsCfx,
  isHistoryTx,
  inputGasLimit,
  gasLimitErr,
  onChangeGasLimit,
  inputNonce,
  nonceErr,
  onChangeNonce,
  storageLimit,
  nonce,
  gasLimit,
}) {
  const {t} = useTranslation()
  const [showGasLimitInput, setShowGasLimitInput] = useState(false)
  const [showNonceInput, setShowNonceInput] = useState(false)

  return (
    <div className="flex flex-col">
      <div className="flex flex-col mb-3">
        <div
          className={`flex justify-between ${showGasLimitInput ? 'mb-2' : ''}`}
        >
          <span>{t('gasLimit')}</span>
          <span
            className={`flex items-center ${showGasLimitInput ? 'hidden' : ''}`}
          >
            <span id="gasLimit">{toThousands(gasLimit || '21000')}</span>
            <WrapIcon
              onClick={() => setShowGasLimitInput(true)}
              className=" ml-1 shadow-none !bg-primary-10"
              id="editGasLimit"
              size="w-5 h-5"
            >
              <EditOutlined className="w-[14px] h-[14px] text-primary" />
            </WrapIcon>
          </span>{' '}
        </div>
        <NumberInput
          containerClassName={`${showGasLimitInput ? '' : 'hidden'}`}
          width="w-full"
          id="gasLimitInput"
          value={inputGasLimit}
          placeholder={gasLimit}
          errorMessage={gasLimitErr}
          onChange={value => onChangeGasLimit(value)}
        />
      </div>
      {networkTypeIsCfx && (
        <div className={`flex justify-between mb-3`}>
          <span>{t('storageLimit')}</span>
          <span id="storageLimit">{toThousands(storageLimit || '0')}</span>
        </div>
      )}
      {!isHistoryTx && (
        <div className="flex flex-col mb-3">
          <div
            className={`flex justify-between ${showNonceInput ? 'mb-2' : ''}`}
          >
            <span>{t('customNonce')}</span>
            <span
              className={`flex items-center ${showNonceInput ? 'hidden' : ''}`}
            >
              <span id="nonce">{toThousands(nonce || '1')}</span>
              <WrapIcon
                onClick={() => setShowNonceInput(true)}
                className=" ml-1 shadow-none !bg-primary-10"
                id="editGasLimit"
                size="w-5 h-5"
              >
                <EditOutlined className="w-[14px] h-[14px] text-primary" />
              </WrapIcon>
            </span>
          </div>
          <NumberInput
            containerClassName={`${showNonceInput ? '' : 'hidden'}`}
            width="w-full"
            id="nonceInput"
            value={inputNonce}
            placeholder={nonce}
            errorMessage={nonceErr}
            onChange={value => onChangeNonce(value)}
          />
        </div>
      )}
    </div>
  )
}

CustomOptional.propTypes = {
  networkTypeIsCfx: PropTypes.bool,
  isHistoryTx: PropTypes.bool,
  inputGasLimit: PropTypes.string,
  gasLimitErr: PropTypes.string,
  onChangeGasLimit: PropTypes.func,
  inputNonce: PropTypes.string,
  nonceErr: PropTypes.string,
  onChangeNonce: PropTypes.func,
  storageLimit: PropTypes.string,
  nonce: PropTypes.string,
  gasLimit: PropTypes.string,
}

export default CustomOptional
