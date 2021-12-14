import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {PlusOutlined} from '@fluent-wallet/component-icons'
import {WrapIcon, TokenList} from '../../../components'
import {useCurrentAddressTokens} from '../../../hooks/useApi'

function HomeTokenList({onOpenAddToken}) {
  const {data: tokens} = useCurrentAddressTokens()
  const homeTokenList = ['native'].concat(tokens)
  const {t} = useTranslation()
  return (
    <div
      className="flex flex-col flex-1 mx-2 rounded-xl bg-gray-0 mb-3 px-3 py-3 z-0 overflow-auto"
      id="homeTokenListWrapper"
    >
      <span
        className="flex items-center justify-between mb-2 text-primary text-xs font-medium"
        id="openAddTokenBtnWrapper"
      >
        {t('assets')}
        <WrapIcon size="w-5 h-5" onClick={onOpenAddToken} id="openAddTokenBtn">
          <PlusOutlined className="w-3 h-3 text-primary" />
        </WrapIcon>
      </span>
      <TokenList tokenList={homeTokenList} />
      <div className="absolute bottom-[76px] left-0 rounded-xl h-6 bg-token-background mx-2 w-[calc(100%-1rem)]" />
    </div>
  )
}
HomeTokenList.propTypes = {
  onOpenAddToken: PropTypes.func.isRequired,
}

export default HomeTokenList
