import PropTypes from 'prop-types'
import {useState} from 'react'
import {useTranslation} from 'react-i18next'
import {useRPC} from '@fluent-wallet/use-rpc'
import {SelectedOutlined, PlusOutlined} from '@fluent-wallet/component-icons'
import {validateBase32Address} from '@fluent-wallet/base32-address'
import {isHexAddress} from '@fluent-wallet/account'
import {SlideCard} from '../../../components'
import {WrapIcon, SearchToken, TokenItem} from '../../../components'
import {RPC_METHODS} from '../../../constants'
import {request} from '../../../utils'
import {useCurrentAccount, useIsCfx, useIsEth} from '../../../hooks'
const {GET_ADD_TOKEN_LIST, REFETCH_BALANCE, WALLET_VALIDATE_20TOKEN} =
  RPC_METHODS

function AddToken({onClose, onOpen}) {
  const {t} = useTranslation()
  const [searchContent, setSearchContent] = useState('')
  const {address} = useCurrentAccount()
  const isCfxChain = useIsCfx()
  const isEthChain = useIsEth()
  const onAddToken = () => {}
  const searchResults = []
  useRPC([REFETCH_BALANCE], {type: 'all'})
  const {data} = useRPC([GET_ADD_TOKEN_LIST])

  const getOther20Token = value => {
    request(WALLET_VALIDATE_20TOKEN, {
      tokenAddress: value,
      userAddress: address,
    }).then(({result, error}) => {
      console.log(result, error, value)
    })
  }

  const onChangeValue = value => {
    // TODO: search logic
    setSearchContent(value)
    if (
      (isCfxChain && validateBase32Address(value)) ||
      (isEthChain && isHexAddress(value))
    ) {
      getOther20Token(value)
    }
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
          {searchResults.length ? (
            <div className="px-3 pt-3 mt-3 bg-gray-0 rounded">
              <p className="ml-1 mb-1 text-gray-40">{t('searchResults')}</p>
              {/* TODO: add id for automation testing  */}
              <TokenItem
                maxWidth={135}
                maxWidthStyle="max-w-[135px]"
                rightIcon={
                  <WrapIcon size="w-5 h-5">
                    <SelectedOutlined className="w-3 h-3 text-gray-40" />
                  </WrapIcon>
                }
              />
              <TokenItem
                maxWidth={135}
                maxWidthStyle="max-w-[135px]"
                rightIcon={
                  <WrapIcon size="w-5 h-5" onClick={onAddToken}>
                    <PlusOutlined className="w-3 h-3 text-primary" />
                  </WrapIcon>
                }
              />
            </div>
          ) : (
            <div className="flex  items-center flex-col">
              <img
                src=""
                alt="no result"
                className="w-24 h-24 mt-13 mb-4"
                data-clear-btn="true"
              />
              <p>{t('noResult')}</p>
            </div>
          )}
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
