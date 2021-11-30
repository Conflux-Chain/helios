import PropTypes from 'prop-types'
import {useState, useRef, useEffect} from 'react'
import {useTranslation} from 'react-i18next'
import {useSWRConfig} from 'swr'
import {SelectedOutlined, PlusOutlined} from '@fluent-wallet/component-icons'
import {validateBase32Address} from '@fluent-wallet/base32-address'
import {isHexAddress} from '@fluent-wallet/account'
import {SlideCard} from '../../../components'
import {WrapIcon, SearchToken, TokenItem} from '../../../components'
import {RPC_METHODS, DEFAULT_TOKEN_URL} from '../../../constants'
import {request} from '../../../utils'

import {
  useNetworkTypeIsCfx,
  useCurrentAccount,
  useDbAddTokenList,
} from '../../../hooks/useApi'

const {
  WALLETDB_ADD_TOKEN_LIST,
  WALLET_VALIDATE_20TOKEN,
  WALLET_WATCH_ASSET,
  WALLETDB_REFETCH_BALANCE,
} = RPC_METHODS

const isAddress = (value, isCfxChain) => {
  return (
    (isCfxChain && validateBase32Address(value)) ||
    (!isCfxChain && isHexAddress(value))
  )
}

function AddToken({onClose, onOpen}) {
  const {mutate} = useSWRConfig()
  const {t} = useTranslation()
  const [searchContent, setSearchContent] = useState('')
  const [tokenList, setTokenList] = useState([])
  const [noTokenStatus, setNoTokenStatus] = useState(false)
  const inputValueRef = useRef()
  const {address} = useCurrentAccount()
  const isCfxChain = useNetworkTypeIsCfx()
  const dbData = useDbAddTokenList()

  useEffect(() => {
    if (dbData.added && dbData.others) {
      const {added, others} = dbData
      const addTokenList = added.concat(others)
      if (searchContent === '') {
        setNoTokenStatus(false)
        return setTokenList([])
      }

      if (!isAddress(searchContent, isCfxChain)) {
        const ret = addTokenList.filter(
          token =>
            token.symbol.toUpperCase().indexOf(searchContent.toUpperCase()) !==
              -1 ||
            token.name.toUpperCase().indexOf(searchContent.toUpperCase()) !==
              -1,
        )
        setNoTokenStatus(!ret.length)
        setTokenList([...ret])
      }
    }
  }, [dbData, searchContent, isCfxChain])

  const getOther20Token = value => {
    request(WALLET_VALIDATE_20TOKEN, {
      tokenAddress: value,
      userAddress: address,
    }).then(result => {
      if (inputValueRef.current === value) {
        if (result?.valid) {
          setNoTokenStatus(false)
          return setTokenList([{...result, address: value}])
        }
        setNoTokenStatus(true)
      }
      // TODO:handle error
    })
  }

  const onChangeValue = value => {
    setSearchContent(value)
    inputValueRef.current = value
    if (isAddress(value, isCfxChain)) {
      getOther20Token(value)
    }
  }

  const onAddToken = ({decimals, symbol, address, logoURI}) => {
    const params = {
      type: isCfxChain ? 'CRC20' : 'ERC20',
      options: {
        address,
        symbol,
        decimals,
        image: logoURI || DEFAULT_TOKEN_URL,
      },
    }
    request(WALLET_WATCH_ASSET, params).then(() => {
      // TODO:error
      if (address === searchContent && tokenList.length === 1) {
        setTokenList([...tokenList.map(token => ({...token, added: true}))])
      }
      mutate([WALLETDB_REFETCH_BALANCE]).then(() => {
        mutate([WALLETDB_ADD_TOKEN_LIST])
      })
    })
  }

  const onCloseAddToken = () => {
    onClose()
    setSearchContent('')
  }

  if (!address) {
    return null
  }

  return (
    <SlideCard
      cardTitle={t('addToken')}
      onClose={onCloseAddToken}
      onOpen={onOpen}
      cardContent={
        <div className="mt-4">
          <SearchToken value={searchContent} onChange={onChangeValue} />
          {tokenList.length ? (
            <div className="px-3 pt-3 mt-3 bg-gray-0 rounded">
              <p className="ml-1 mb-1 text-gray-40">{t('searchResults')}</p>
              {tokenList.map((token, index) => (
                <TokenItem
                  key={index}
                  index={index}
                  token={{
                    ...token,
                  }}
                  maxWidth={135}
                  maxWidthStyle="max-w-[135px]"
                  id={`tokenItem-${token.eid}`}
                  rightIcon={
                    <WrapIcon size="w-5 h-5" onClick={() => onAddToken(token)}>
                      {token?.added ? (
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
                src="images/no-available-token.svg"
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
  onOpen: PropTypes.bool,
}

export default AddToken
