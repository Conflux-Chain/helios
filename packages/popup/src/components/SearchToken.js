import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import Input from '@fluent-wallet/component-input'
import {CloseCircleFilled, SearchOutlined} from '@fluent-wallet/component-icons'

function SearchToken({value, onChange}) {
  const {t} = useTranslation()
  return (
    <Input
      prefix={<SearchOutlined className="w-4 h-4 text-gray-40" />}
      width="w-full"
      value={value}
      placeholder={t('searchToken')}
      onChange={e => onChange(e.target.value)}
      suffix={
        value ? (
          <CloseCircleFilled className="w-4 h-4 cursor-pointer text-gray-40" />
        ) : null
      }
      onSuffixClick={() => onChange('')}
    />
  )
}

SearchToken.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
}

export default SearchToken
