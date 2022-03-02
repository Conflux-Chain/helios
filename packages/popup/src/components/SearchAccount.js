import PropTypes from 'prop-types'
import {useState, useEffect, forwardRef} from 'react'
import {useDebounce} from 'react-use'
import {useTranslation} from 'react-i18next'
import Message from '@fluent-wallet/component-message'
import {isUndefined, isArray} from '@fluent-wallet/checks'
import {request, formatAccountGroupData} from '../utils'
import {RPC_METHODS} from '../constants'
import {SearchInput} from './'

const {QUERY_ADDRESS} = RPC_METHODS

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

  useEffect(() => {
    if (!debouncedSearchAccount) {
      return onSearchCallback?.(null)
    }

    if (!isUndefined(currentNetworkId)) {
      request(QUERY_ADDRESS, {
        networkId: currentNetworkId,
        fuzzy: debouncedSearchAccount,
        g: {
          nativeBalance: 1,
          value: 1,
          hex: 1,
          _account: {
            nickname: 1,
            eid: 1,
            hidden: 1,
            _accountGroup: {nickname: 1, eid: 1, vault: {type: 1}},
            selected: 1,
          },
          network: {
            ticker: 1,
          },
        },
      })
        .then(res => {
          onSearchCallback?.(
            isArray(res) ? formatAccountGroupData(res, showHiddenAccount) : {},
          )
        })
        .catch(err => {
          Message.error({
            content:
              err?.message?.split?.('\n')?.[0] ??
              err?.message ??
              t('unCaughtErrMsg'),
            top: '10px',
            duration: 1,
          })
        })
    }
  }, [
    showHiddenAccount,
    currentNetworkId,
    debouncedSearchAccount,
    onSearchCallback,
    t,
    refreshDataStatus,
  ])

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
