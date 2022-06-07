import PropTypes from 'prop-types'
import {useState, forwardRef, useEffect} from 'react'
import {useDebounce} from 'react-use'
import {useTranslation} from 'react-i18next'
import {useAccountList} from '../hooks/useApi.js'

import {SearchInput} from './'

const SearchAccount = forwardRef(function SearchAccount(
  {
    currentNetworkId,
    onSearchCallback,
    searchContent,
    onSearch,
    onClickAway,
    refreshDataStatus,
    showHiddenAccount = false,
    ...props
  },
  ref,
) {
  const {t} = useTranslation()
  const [debouncedSearchAccount, setDebouncedSearchAccount] = useState('')

  const onInputChange = value => {
    onSearch(value)
  }

  useDebounce(
    () => {
      setDebouncedSearchAccount(searchContent)
    },
    300,
    [searchContent],
  )

  const {data: accountList, mutate} = useAccountList({
    networkId: debouncedSearchAccount && currentNetworkId,
    fuzzy: debouncedSearchAccount,
    includeHidden: showHiddenAccount,
  })

  useEffect(() => {
    mutate?.()
  }, [mutate, refreshDataStatus])

  useEffect(() => {
    if (!Object.keys(accountList).length && !debouncedSearchAccount) {
      onSearchCallback?.(null)
    } else {
      onSearchCallback?.(accountList)
    }
  }, [accountList, onSearchCallback, debouncedSearchAccount])

  return (
    <SearchInput
      value={searchContent}
      onChange={onInputChange}
      onClickAway={onClickAway}
      placeholder={t('search')}
      {...props}
      ref={ref}
    />
  )
})

SearchAccount.propTypes = {
  searchContent: PropTypes.string.isRequired,
  onSearch: PropTypes.func.isRequired,
  onClickAway: PropTypes.func,
  currentNetworkId: PropTypes.number.isRequired,
  onSearchCallback: PropTypes.func,
  refreshDataStatus: PropTypes.bool,
  showHiddenAccount: PropTypes.bool,
}

export default SearchAccount
