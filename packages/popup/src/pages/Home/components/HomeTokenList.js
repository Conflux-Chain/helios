import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {PlusOutlined} from '@fluent-wallet/component-icons'
import {useState, useEffect, useRef} from 'react'
import {WrapIcon, TokenList} from '../../../components'
import {useCurrentAddress, useCurrentAddressTokens} from '../../../hooks/useApi'
import {useFetchAddressNameInfos} from '../../../hooks/useNameInfoStore'

function HomeTokenList({onOpenAddToken}) {
  const {data: tokens, tokenAddresses, isValidating} = useCurrentAddressTokens()
  const {
    data: {network},
  } = useCurrentAddress()

  // In order for cfx that exist locally to appear with other tokens as much as possible
  // We should return 'native' with swr data
  const [homeTokenList, setHomeTokenList] = useState([])
  const isFetched = useRef(false)
  useEffect(() => {
    if (isFetched.current === false && isValidating === true) {
      return (isFetched.current = true)
    }
    if (isFetched.current && !isValidating) {
      isFetched.current = false
      setHomeTokenList(['native'].concat(tokens))
    }
  }, [isValidating])

  const {t} = useTranslation()

  useFetchAddressNameInfos({
    network,
    addresses: tokenAddresses,
  })

  return (
    <div
      className="relative home-token-list-wrapper flex flex-col flex-1 mx-2 rounded-xl bg-gray-0 mb-3 pt-3 z-0 overflow-auto"
      id="homeTokenListWrapper"
    >
      <span
        className="flex items-center justify-between px-3 mb-2 text-primary text-xs font-medium"
        id="openAddTokenBtnWrapper"
      >
        {t('assets')}
        <WrapIcon size="w-5 h-5" onClick={onOpenAddToken} id="openAddTokenBtn">
          <PlusOutlined className="w-3 h-3 text-primary" />
        </WrapIcon>
      </span>
      <TokenList tokenList={homeTokenList} autoFetchNameInfo={false} />
    </div>
  )
}
HomeTokenList.propTypes = {
  onOpenAddToken: PropTypes.func.isRequired,
}

export default HomeTokenList
