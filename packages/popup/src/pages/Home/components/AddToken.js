import PropTypes from 'prop-types'
import {useState, useRef} from 'react'
import {useTranslation} from 'react-i18next'
import {useSWRConfig} from 'swr'
import {SelectedOutlined, PlusOutlined} from '@fluent-wallet/component-icons'
import {validateBase32Address} from '@fluent-wallet/base32-address'
import {isHexAddress} from '@fluent-wallet/account'
import {SlideCard} from '../../../components'
import {WrapIcon, SearchToken, TokenItem} from '../../../components'
import {RPC_METHODS} from '../../../constants'
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

function AddToken({onClose, onOpen}) {
  const {mutate} = useSWRConfig()
  const {t} = useTranslation()
  const [searchContent, setSearchContent] = useState('')
  const [tokenList, setTokenList] = useState([])
  const [noTokenStatus, setNoTokenStatus] = useState(false)
  const inputValueRef = useRef()
  const {address} = useCurrentAccount()
  const isCfxChain = useNetworkTypeIsCfx()
  const {added, others} = useDbAddTokenList() || {}
  const addTokenList = added.concat(others)

  const getOther20Token = value => {
    request(WALLET_VALIDATE_20TOKEN, {
      tokenAddress: value,
      userAddress: address,
    }).then(({result}) => {
      if (inputValueRef.current === value && result) {
        if (result?.valid) {
          console.log('result', result)
          setTokenList([{...result, address: value}])
        }
        setNoTokenStatus(true)
      }
      // TODO:handle error
    })
  }

  const onChangeValue = value => {
    setSearchContent(value)
    inputValueRef.current = value
    if (value === '') {
      setNoTokenStatus(false)
      return setTokenList([])
    }

    if (!validateBase32Address(value) && !isHexAddress(value)) {
      const ret = addTokenList.filter(
        token =>
          token.symbol.toUpperCase().indexOf(value.toUpperCase()) !== -1 ||
          token.name.toUpperCase().indexOf(value.toUpperCase()) !== -1,
      )
      !ret.length && setNoTokenStatus(true)
      return setTokenList([...ret])
    }

    if (
      (isCfxChain && validateBase32Address(value)) ||
      (!isCfxChain && isHexAddress(value))
    ) {
      getOther20Token(value)
    }
  }
  const onAddToken = ({decimals, symbol, address, logoURI}) => {
    request(WALLET_WATCH_ASSET, {
      type: isCfxChain ? 'CRC20' : 'ERC20',
      options: {
        address,
        symbol,
        decimals,
        image: logoURI,
      },
    }).then(({result}) => {
      // TODO:error
      if (result) {
        mutate([WALLETDB_REFETCH_BALANCE])
        mutate([WALLETDB_ADD_TOKEN_LIST])
      }
    })
  }

  if (!address) {
    return null
  }

  return (
    <SlideCard
      cardTitle={t('addToken')}
      onClose={onClose}
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
