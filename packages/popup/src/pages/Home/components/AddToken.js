import {PlusOutlined, SelectedOutlined} from '@fluent-wallet/component-icons'
import PropTypes from 'prop-types'
import {useCallback, useEffect, useRef, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {useSWRConfig} from 'swr'

import {SearchToken, SlideCard, TokenItem, WrapIcon} from '../../../components'
import {DEFAULT_TOKEN_URL, RPC_METHODS} from '../../../constants'
import {
  useCurrentAddress,
  useCurrentAddressTokens,
  useCurrentNetworkTokens,
  useNetworkTypeIsCfx,
} from '../../../hooks/useApi'
import {request, validateAddress} from '../../../utils'

const {WALLET_VALIDATE_20TOKEN, WALLET_WATCH_ASSET, WALLETDB_REFETCH_BALANCE} =
  RPC_METHODS

function AddToken({onClose, open}) {
  const {mutate} = useSWRConfig()
  const {t} = useTranslation()
  const [searchContent, setSearchContent] = useState('')
  const [noTokenStatus, setNoTokenStatus] = useState(false)
  const inputValueRef = useRef()
  const {
    data: {
      eid: addressId,
      value: address,
      network: {netId},
    },
  } = useCurrentAddress()
  const isCfxChain = useNetworkTypeIsCfx()
  const {data: networkTokens, mutate: mutateNetworkTokens} =
    useCurrentNetworkTokens({
      fuzzy: searchContent || null,
    })
  const [tokenList, setTokenList] = useState([])
  const {data: addressTokens, mutate: mutateAddressTokens} =
    useCurrentAddressTokens()

  const getOther20Token = useCallback((userAddress, tokenAddress) => {
    request(WALLET_VALIDATE_20TOKEN, {
      tokenAddress,
      userAddress,
    }).then(result => {
      if (inputValueRef.current === tokenAddress) {
        if (result?.valid) {
          setNoTokenStatus(false)
          return setTokenList([[{...result, address: tokenAddress}, false]])
        }
        setNoTokenStatus(true)
      }
      // TODO:handle error
    })
  }, [])

  useEffect(() => {
    if (!addressId) return
    if (!networkTokens.length) setNoTokenStatus(true)
    else setNoTokenStatus(false)

    if (
      !networkTokens.length &&
      searchContent &&
      validateAddress(searchContent, isCfxChain, netId)
    ) {
      getOther20Token(address, searchContent)
      return
    }
    setTokenList(networkTokens.map(t => [t, addressTokens.includes(t)]))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addressId, searchContent, networkTokens, addressTokens])

  const onChangeValue = value => {
    setSearchContent(value)
    inputValueRef.current = value
  }

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
      // TODO:error
      mutateNetworkTokens()
      mutateAddressTokens()
      mutate([WALLETDB_REFETCH_BALANCE])
    })
  }

  const onCloseAddToken = () => {
    onClose && onClose()
    setSearchContent('')
  }

  if (!address) {
    return null
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
        <div className="mt-4">
          <SearchToken value={searchContent} onChange={onChangeValue} />
          {tokenList.length ? (
            <div className="px-3 pt-3 mt-3 bg-gray-0 rounded">
              <p className="ml-1 mb-1 text-gray-40">{t('searchResults')}</p>
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
            </div>
          ) : noTokenStatus ? (
            <div className="flex  items-center flex-col">
              <img
                src="/images/no-available-token.svg"
                alt="no result"
                className="w-33 h-24 mt-13 mb-4"
                data-clear-btn="true"
              />
              <p className="text-sm text-gray-40">{t('noResult')}</p>
            </div>
          ) : null}
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
