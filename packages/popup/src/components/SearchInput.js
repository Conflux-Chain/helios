import PropTypes from 'prop-types'
import {useRef} from 'react'
import {useClickAway} from 'react-use'
import {useTranslation} from 'react-i18next'
import Input from '@fluent-wallet/component-input'
import {CloseCircleFilled, SearchOutlined} from '@fluent-wallet/component-icons'
import {forwardRef} from 'react'

const SearchInput = forwardRef(function SearchInput(
  {
    value,
    prefixClassName = 'w-4 h-4 text-gray-40',
    suffixClassName = 'w-4 h-4 text-gray-40 cursor-pointer',
    onChange,
    placeholder,
    onClickAway,
    ...props
  },
  ref,
) {
  const {t} = useTranslation()
  const searchContainerRef = useRef(null)

  useClickAway(searchContainerRef, () => {
    onClickAway?.()
  })

  return (
    <div ref={searchContainerRef}>
      <Input
        id="searchText"
        prefix={<SearchOutlined className={prefixClassName} id="search-icon" />}
        width="w-full"
        value={value}
        ref={ref}
        placeholder={placeholder || t('searchToken')}
        onChange={e => onChange(e.target.value)}
        suffix={
          value ? <CloseCircleFilled className={suffixClassName} /> : null
        }
        onSuffixClick={() => onChange?.('')}
        {...props}
      />
    </div>
  )
})

SearchInput.propTypes = {
  value: PropTypes.string,
  prefixClassName: PropTypes.string,
  suffixClassName: PropTypes.string,
  placeholder: PropTypes.string,
  onChange: PropTypes.func,
  onClickAway: PropTypes.func,
}

export default SearchInput
