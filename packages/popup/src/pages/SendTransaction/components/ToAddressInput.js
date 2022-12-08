import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import Input from '@fluent-wallet/component-input'

import {AddressCheckingSymbol} from './'

function ToAddressInput({
  address,
  onChangeAddress,
  onClickCloseBtn,
  errorMessage,
  addressLoading = false,
  addressChecked = false,
}) {
  const {t} = useTranslation()

  return (
    <Input
      width="w-full"
      value={address}
      placeholder={t('toAddressPlaceholder')}
      onChange={e => onChangeAddress && onChangeAddress(e.target.value)}
      errorMessage={errorMessage}
      id="toAddressInput"
      suffixWrapperClassName="w-auto h-auto"
      suffix={
        address && (
          <AddressCheckingSymbol
            loading={addressLoading}
            checked={addressChecked}
            onClickCloseBtn={onClickCloseBtn}
            className="!w-5 !h-5 text-success"
          />
        )
      }
    />
  )
}

ToAddressInput.propTypes = {
  address: PropTypes.string,
  onChangeAddress: PropTypes.func,
  onClickCloseBtn: PropTypes.func,
  errorMessage: PropTypes.string,
  addressLoading: PropTypes.bool,
  addressChecked: PropTypes.bool,
}

export default ToAddressInput
