import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {PlusOutlined} from '@fluent-wallet/component-icons'
import {WrapIcon} from '../../../components'
import {TokenItem} from './'
function TokenList({onOpen}) {
  const {t} = useTranslation()
  return (
    <div className="flex flex-col flex-1 mx-2 rounded-xl bg-gray-0 mb-3 px-3 pt-3 relative">
      <span className="flex items-center justify-between mb-2 text-primary text-xs font-medium">
        {t('assets')}
        <WrapIcon size="w-5 h-5" onClick={onOpen}>
          <PlusOutlined className="w-3 h-3 text-primary" />
        </WrapIcon>
      </span>
      <div className="flex flex-1 flex-col overflow-y-auto">
        <TokenItem />
      </div>
      <div className="absolute bottom-0 left-0 h-6 bg-token-background w-[356px]" />
    </div>
  )
}
TokenList.propTypes = {
  onOpen: PropTypes.func.isRequired,
}

export default TokenList
