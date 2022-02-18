import {PlusOutlined, SelectedOutlined} from '@fluent-wallet/component-icons'
import {useDebounce} from 'react-use'
import PropTypes from 'prop-types'
import {useState, useMemo} from 'react'
import {useTranslation} from 'react-i18next'
import {
  SearchInput,
  SlideCard,
  TokenItem,
  WrapIcon,
  TokenList,
  NoResult,
} from '../../../components'
import {DEFAULT_TOKEN_URL, RPC_METHODS} from '../../../constants'
import {
  useDbRefetchBalance,
  useCurrentAddress,
  useCurrentAddressTokens,
  useCurrentNetworkTokens,
  useNetworkTypeIsCfx,
  useValidate20Token,
} from '../../../hooks/useApi'
import {request, validateAddress} from '../../../utils'

const {WALLET_WATCH_ASSET} = RPC_METHODS

function AddToken({onClose, open}) {
  const {t} = useTranslation()
  const [searchContent, setSearchContent] = useState('')
  const [debouncedSearchContent, setDebouncedSearchContent] =
    useState(searchContent)
  const [mutateAddrTokenBalance] = useDbRefetchBalance()

  useDebounce(
    () => {
      setDebouncedSearchContent(searchContent)
    },
    200,
    [searchContent],
  )

  const {
    data: {
      eid: addressId,
      network: {netId},
    },
  } = useCurrentAddress()

  const {data: networkTokens, mutate: mutateNetworkTokens} =
    useCurrentNetworkTokens({
      fuzzy: debouncedSearchContent || null,
    })

  const {data: addressTokens, mutate: mutateAddressTokens} =
    useCurrentAddressTokens()

  const isCfxChain = useNetworkTypeIsCfx()

  const builtinTokens = useMemo(() => {
    if (!addressId) return
    if (!networkTokens.length) return
    return networkTokens.map(t => [t, addressTokens.includes(t)])
  }, [addressId, networkTokens, addressTokens])

  const {data: other20Token} = useValidate20Token(
    debouncedSearchContent &&
      validateAddress(debouncedSearchContent, isCfxChain, netId) &&
      debouncedSearchContent,
  )

  const tokenList =
    builtinTokens || (other20Token.valid && [[other20Token, false]]) || null

  const onAddToken = token => {
    let params
    if (Number.isInteger(token)) {
      params = {tokenId: token}
    } else {
      const {decimals, symbol, address, logoURI} = token
      params = {
        type: isCfxChain ? 'CRC20' : 'ERC20',
        options: {
          address,
          symbol,
          decimals,
          image: logoURI || DEFAULT_TOKEN_URL,
        },
      }
    }
    request(WALLET_WATCH_ASSET, params).then(() => {
      // TODO: error
      mutateAddrTokenBalance().then(() => {
        mutateNetworkTokens()
        mutateAddressTokens()
      })
    })
  }

  const onCloseAddToken = () => {
    onClose && onClose()
    setSearchContent('')
  }

  return (
    <SlideCard
      id="add-token"
      cardTitle={
        <div className="ml-3 pb-1">
          <p className="text-base text-gray-80 font-medium">{t('addToken')}</p>
        </div>
      }
      onClose={onCloseAddToken}
      open={open}
      cardContent={
        // 2.75rem = parent paddingBottom + current marginTop = 1.75rem + 1rem
        <div className="mt-4 flex flex-col flex-grow h-[calc(100%-2.75rem)]">
          <SearchInput value={searchContent} onChange={setSearchContent} />
          {tokenList && (
            <div className="relative pt-3 mt-3 bg-gray-0 rounded flex flex-col flex-grow">
              <p className="ml-4 mb-1 text-gray-40">{t('searchResults')}</p>
              <TokenList>
                {tokenList.map(([token, added], index) => (
                  <TokenItem
                    key={index}
                    index={index}
                    token={token}
                    maxWidth={135}
                    maxWidthStyle="max-w-[135px]"
                    id={`tokenItem-${token}`}
                    rightIcon={
                      <WrapIcon
                        size="w-5 h-5"
                        onClick={() => !added && onAddToken(token)}
                      >
                        {added ? (
                          <SelectedOutlined className="w-3 h-3 text-gray-40" />
                        ) : (
                          <PlusOutlined className="w-3 h-3 text-primary" />
                        )}
                      </WrapIcon>
                    }
                  />
                ))}
              </TokenList>
            </div>
          )}
          {!tokenList && <NoResult content={t('noResult')} />}
        </div>
      }
    />
  )
}

AddToken.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
}

export default AddToken
