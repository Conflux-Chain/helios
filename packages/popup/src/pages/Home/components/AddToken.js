import {
  PlusOutlined,
  SelectedOutlined,
  CloseOutlined,
} from '@fluent-wallet/component-icons'
import {isNumber} from '@fluent-wallet/checks'
import {useDebounce} from 'react-use'
import PropTypes from 'prop-types'
import {useState, useMemo} from 'react'
import {useTranslation} from 'react-i18next'
import Message from '@fluent-wallet/component-message'
import Tooltip from '@fluent-wallet/component-tooltip'
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
import useLoading from '../../../hooks/useLoading'
import {request, validateAddress} from '../../../utils'

const {WALLET_WATCH_ASSET, WALLET_UNWATCH_ASSET} = RPC_METHODS

function AddToken({onClose, open}) {
  const {t} = useTranslation()
  const [searchContent, setSearchContent] = useState('')
  const [showDeleteButtonTokenId, setShowDeleteButtonTokenId] = useState('')
  const [maskClosable, setMaskClosable] = useState(true)

  const {setLoading} = useLoading()
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

  const onAddToken = async token => {
    let params
    if (isNumber(token)) {
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
    return request(WALLET_WATCH_ASSET, params)
  }

  const onDeleteToken = async token => {
    return request(WALLET_UNWATCH_ASSET, {tokenId: token, addressId})
  }

  const onCloseAddToken = () => {
    onClose && onClose()
    setSearchContent('')
  }

  const onRightIconClick = (token, added) => {
    let clickMethod
    if (!added) {
      clickMethod = onAddToken
    } else if (isNumber(token) && isNumber(addressId)) {
      clickMethod = onDeleteToken
    }

    if (clickMethod) {
      setLoading(true)
      setMaskClosable(false)
      clickMethod(token)
        .then(() => {
          mutateAddrTokenBalance().then(() => {
            mutateNetworkTokens()
            mutateAddressTokens()
          })
        })
        .catch(e => {
          Message.error({
            content: e?.message ?? t('unCaughtErrMsg'),
            top: '10px',
            duration: 1,
          })
        })
        .finally(() => {
          setLoading(false)
          setTimeout(() => setMaskClosable(true), 200)
        })
    }
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
      maskClosable={maskClosable}
      cardContent={
        // 2.75rem = parent paddingBottom + current marginTop = 1.75rem + 1rem
        <div className="mt-4 flex flex-col grow h-[calc(100%-2.75rem)]">
          <SearchInput value={searchContent} onChange={setSearchContent} />
          {tokenList && (
            <div className="relative pt-3 mt-3 bg-gray-0 rounded flex flex-col grow">
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
                    onMouseEnter={() =>
                      added &&
                      isNumber(token) &&
                      setShowDeleteButtonTokenId(token)
                    }
                    onMouseLeave={() => setShowDeleteButtonTokenId('')}
                    rightIcon={
                      <WrapIcon
                        size="w-5 h-5"
                        onClick={() => onRightIconClick(token, added)}
                      >
                        {added ? (
                          isNumber(showDeleteButtonTokenId) &&
                          showDeleteButtonTokenId === token ? (
                            <Tooltip content={t('remove')}>
                              <CloseOutlined className="w-3 h-3 text-error" />
                            </Tooltip>
                          ) : (
                            <SelectedOutlined className="w-3 h-3 text-gray-40" />
                          )
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
