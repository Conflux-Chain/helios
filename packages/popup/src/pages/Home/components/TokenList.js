import {useEffect} from 'react'
import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {PlusOutlined} from '@fluent-wallet/component-icons'
import {formatBalance} from '@fluent-wallet/data-format'
import {WrapIcon} from '../../../components'

function TokenItem({
  icon,
  name = 'Conflux',
  symbol = 'CFX',
  balance = '1234567890.123456',
}) {
  useEffect(() => {
    const balanceDom = document.getElementById('balance')
    const contentWidth = balanceDom.offsetWidth
    console.log(contentWidth)
    if (contentWidth > 175) {
      const fontSize = (175 / contentWidth) * 14
      console.log(fontSize)
      balanceDom.style.fontSize = parseInt(fontSize * 100) / 100 + 'px'
    }
  }, [balance])
  return (
    <div className="w-full h-14 flex items-center">
      <img className="w-8 h-8 rounded-full mr-2" src={icon} alt="logo" />
      <div className="flex flex-1 flex-col">
        <div className="flex w-full items-center justify-between">
          <span className="text-gray-80 font-medium">{symbol}</span>
          <div className="max-w-[175px] text-sm text-gray-80 font-mono font-semibold whitespace-nowrap overflow-hidden overflow-ellipsis">
            <span id="balance">{formatBalance(balance)}</span>
          </div>
        </div>
        <span className="text-gray-40 text-xs">{name}</span>
      </div>
    </div>
  )
}

TokenItem.propTypes = {
  icon: PropTypes.string,
  name: PropTypes.string,
  symbol: PropTypes.string,
  balance: PropTypes.string,
}

function TokenList() {
  const {t} = useTranslation()
  return (
    <div className="flex flex-col flex-1 mx-2 rounded-xl bg-gray-0 mb-3 px-3 pt-3 relative">
      <span className="flex items-center justify-between mb-2 text-primary text-xs font-medium">
        {t('assets')}
        <WrapIcon size="w-5 h-5">
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

export default TokenList
