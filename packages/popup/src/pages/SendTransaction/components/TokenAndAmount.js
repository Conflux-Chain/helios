import {useState} from 'react'
import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {CaretDownFilled} from '@fluent-wallet/component-icons'
import Modal from '@fluent-wallet/component-modal'
import {
  CompWithLabel,
  DisplayBalance,
  SearchInput,
  TokenList,
  NumberInput,
} from '../../../components'
import {
  useCurrentNetworkTokens,
  useCurrentAddress,
  useSingleTokenInfoWithNativeTokenSupport,
} from '../../../hooks/useApi'
import {useCheckImage, useCurrentTxStore} from '../../../hooks'

const ChooseTokenList = ({open, onClose, onSelectToken}) => {
  const {t} = useTranslation()
  const {
    data: {eid: addressId},
  } = useCurrentAddress()
  const [searchValue, setSearchValue] = useState('')
  const {data: tokens} = useCurrentNetworkTokens({
    addressId,
    fuzzy: searchValue || null,
  })
  const homeTokenList = searchValue ? tokens : ['native'].concat(tokens)
  const onCloseTokenList = () => {
    onClose && onClose()
    setSearchValue('')
  }
  const content = (
    <div className="relative flex flex-col flex-1">
      <div className="px-3">
        <SearchInput value={searchValue} onChange={setSearchValue} />
      </div>
      <span className="inline-block px-3 mt-3 mb-1 text-gray-40 text-xs">
        {t('tokenList')}
      </span>
      <TokenList tokenList={homeTokenList} onSelectToken={onSelectToken} />
    </div>
  )
  return (
    <Modal
      className="!bg-gray-circles !px-3 bg-no-repeat w-80 h-[552px] pb-3 overflow-y-hidden"
      open={open}
      title={t('chooseToken')}
      content={content}
      onClose={onCloseTokenList}
      contentClassName="flex-1 flex overflow-y-auto"
      id="tokenListModal"
    />
  )
}

ChooseTokenList.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSelectToken: PropTypes.func.isRequired,
}

function TokenAndAmount({
  selectedTokenId,
  onChangeToken,
  amount,
  onChangeAmount,
  balance,
  onClickMax,
  disabled,
}) {
  const {t} = useTranslation()
  const {maxMode, setMaxMode} = useCurrentTxStore()
  const [tokenListShow, setTokenListShow] = useState(false)
  const {symbol, logoURI, decimals} =
    useSingleTokenInfoWithNativeTokenSupport(selectedTokenId)
  const isImgUrl = useCheckImage(logoURI)

  const label = (
    <span className="flex items-center justify-between text-gray-40 w-full">
      {t('tokenAndAmount')}
      <span className="flex items-center text-xs">
        {t('available')}
        <DisplayBalance
          maxWidth={140}
          maxWidthStyle="max-w-[140px]"
          balance={balance}
          decimals={decimals}
          className="mx-1 text-xs"
          initialFontSize={12}
          symbol={symbol}
          id="balance"
        />
      </span>
    </span>
  )
  const handleClickMax = () => {
    if (disabled) return

    onClickMax?.()
  }

  const onSelectToken = token => {
    setTokenListShow(false)
    onChangeToken(token)
  }
  return (
    <CompWithLabel label={label}>
      <div className="flex px-3 h-13 items-center justify-between bg-gray-4 border border-gray-10 rounded">
        <div
          className="flex items-center pr-3 border-r-gray-20 cursor-pointer border-r border-text-20 h-6"
          onClick={() => setTokenListShow(true)}
          id="changeToken"
          aria-hidden="true"
        >
          <img
            className="w-5 h-5 mr-1"
            src={isImgUrl ? logoURI : '/images/default-token-icon.svg'}
            alt="logo"
            id="tokenIcon"
          />
          <span className="text-gray-80 mr-2">{symbol}</span>
          <CaretDownFilled className="w-4 h-4 text-gray-60" />
        </div>
        <div className="flex flex-1">
          <NumberInput
            width="w-full bg-transparent"
            bordered={false}
            value={amount}
            decimals={decimals}
            onChange={value => {
              onChangeAmount && onChangeAmount(value)
              setMaxMode(false)
            }}
            id="amount"
          />
        </div>
        <div
          onClick={handleClickMax}
          id="max"
          className={`px-1 py-0.5 border rounded text-xs ${
            disabled
              ? 'border-gray-20 bg-gray-10 text-gray-40 cursor-not-allowed'
              : maxMode
              ? 'border-primary bg-primary text-white cursor-pointer'
              : 'border-primary bg-white cursor-pointer text-primary'
          }`}
          aria-hidden="true"
        >
          {t('max')}
        </div>
      </div>
      <ChooseTokenList
        open={tokenListShow}
        onClose={() => setTokenListShow(false)}
        onSelectToken={onSelectToken}
      />
    </CompWithLabel>
  )
}

TokenAndAmount.propTypes = {
  selectedTokenId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChangeToken: PropTypes.func,
  amount: PropTypes.string,
  onChangeAmount: PropTypes.func,
  balance: PropTypes.string,
  onClickMax: PropTypes.func,
  disabled: PropTypes.bool,
}

export default TokenAndAmount
