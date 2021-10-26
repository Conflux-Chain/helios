import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {PlusOutlined} from '@fluent-wallet/component-icons'
import {useRPC} from '@fluent-wallet/use-rpc'
import {WrapIcon, TokenList} from '../../../components'
import {RPC_METHODS} from '../../../constants'
const {GET_HOME_TOKEN_LIST, REFETCH_BALANCE} = RPC_METHODS

function HomeTokenList({onOpenAddToken}) {
  const {
    data: {added, native},
  } = useRPC([GET_HOME_TOKEN_LIST], undefined, {fallbackData: {}})
  useRPC([REFETCH_BALANCE])
  const homeTokenList = [native].concat(added)
  const {t} = useTranslation()
  return (
    <div className="flex flex-col flex-1 mx-2 rounded-xl bg-gray-0 mb-3 px-3 pt-3 z-0">
      <span className="flex items-center justify-between mb-2 text-primary text-xs font-medium">
        {t('assets')}
        <WrapIcon size="w-5 h-5" onClick={onOpenAddToken} id="openAddTokenBtn">
          <PlusOutlined className="w-3 h-3 text-primary" />
        </WrapIcon>
      </span>
      <TokenList tokenList={homeTokenList} />
    </div>
  )
}
HomeTokenList.propTypes = {
  onOpenAddToken: PropTypes.func.isRequired,
}

export default HomeTokenList
