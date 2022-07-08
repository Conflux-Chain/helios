import {useState} from 'react'
import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {toThousands} from '@fluent-wallet/data-format'
import {EditOutlined} from '@fluent-wallet/component-icons'
import {WrapIcon, NumberInput} from '../../../components'

function CustomOptional({
  networkTypeIsCfx,
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
      <div className="flex justify-between">
        <span>{t('gasLimit')}</span>
        <span>
          <span id="gasLimit">{toThousands(gasLimit || '21000')}</span>
          <WrapIcon
            onClick={() => setShowGasLimitInput(true)}
            className=" ml-1 shadow-none !bg-primary-10"
            id="editGasLimit"
            size="w-5 h-5"
          >
            <EditOutlined className="w-[14px] h-[14px] text-primary" />
          </WrapIcon>
        </span>
      </div>
      <NumberInput
        className={`${showGasLimitInput ? '' : 'hidden'}`}
        id="gasLimitInput"
        value={inputGasLimit}
        placeholder={gasLimit}
        errorMessage={gasLimitErr}
        onChange={value => onChangeGasLimit(value)}
      />
      {networkTypeIsCfx && (
        <div className="flex justify-between">
          <span>{t('storageLimit')}</span>
          <span id="storageLimit">{toThousands(storageLimit || '0')}</span>
        </div>
      )}
      <div className="flex justify-between">
        <span>{t('nonce')}</span>
        <span>
          <span id="nonce">{toThousands(nonce || '21000')}</span>
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
        className={`${showNonceInput ? '' : 'hidden'}`}
        id="nonceInput"
        value={inputNonce}
        placeholder={nonce}
        errorMessage={nonceErr}
        onChange={value => onChangeNonce(value)}
      />
    </div>
  )
}

CustomOptional.propTypes = {
  networkTypeIsCfx: PropTypes.bool,
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
