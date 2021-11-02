import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {CompWithLabel} from '../../../components'
import Input from '@fluent-wallet/component-input'

function ToAddressInput({address, onChangeAddress, errorMessage}) {
  const {t} = useTranslation()
  return (
    <CompWithLabel label={t('toAddressLabel')} className="!mt-0">
      <Input
        width="w-full"
        maxLength="20"
        value={address}
        placeholder={t('toAddressPlaceholder')}
        onChange={e => onChangeAddress && onChangeAddress(e.target.value)}
        errorMessage={errorMessage}
      />
    </CompWithLabel>
  )
}

ToAddressInput.propTypes = {
  address: PropTypes.string,
  onChangeAddress: PropTypes.func,
  errorMessage: PropTypes.string,
}

export default ToAddressInput
