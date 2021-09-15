import PropTypes from 'prop-types'
import {Close} from '@fluent-wallet/component-icons'
import {useState, useEffect, cloneElement} from 'react'
import {useTranslation} from 'react-i18next'
import {useRPC} from '@fluent-wallet/use-rpc'
import {GET_CURRENT_NETWORK, GET_CURRENT_ACCOUNT} from '../../../constants'

// TODO: remove when avatar programme confirmed
// eslint-disable-next-line react/prop-types
function TemporaryIcon({className = ''}) {
  return (
    <div className={`inline-block bg-gray-40 rounded-full ${className}`}></div>
  )
}

const ActionSheet = ({close, showActionSheet = false, title, children}) => {
  const [containerStyle, setContainerStyle] = useState('')
  const [accountName, setAccountName] = useState('')
  const [networkName, setNetworkName] = useState('')
  const [networkIconUrl, setNetworkIconUrl] = useState(null)

  const {t} = useTranslation()
  const {data: currentNetworkData} = useRPC([GET_CURRENT_NETWORK])
  const {data: currentAccountData} = useRPC([GET_CURRENT_ACCOUNT])

  const onClose = () => {
    close()
    setContainerStyle('animate-slide-down')
  }

  useEffect(() => {
    showActionSheet && setContainerStyle('animate-slide-up block')
  }, [showActionSheet])

  useEffect(() => {
    setAccountName(currentAccountData?.nickname || '')
  }, [currentAccountData])

  useEffect(() => {
    setNetworkIconUrl(currentNetworkData?.icon)
    setNetworkName(currentNetworkData?.name || '')
  }, [currentNetworkData])

  if (!containerStyle) {
    return null
  }
  return (
    <div
      className={`bg-bg rounded-t-xl px-3 pt-4 pb-7 absolute w-93 bottom-0 overflow-y-auto no-scroll ${containerStyle} h-125 `}
    >
      <div className="ml-3 pb-1">
        <p className="text-base text-gray-80 font-medium">{t(`${title}`)}</p>
        <div className="flex items-center text-xs mt-1">
          <TemporaryIcon className="w-3 h-3" />
          <div className="text-gray-40 ml-1">{accountName}</div>
          <div className="mx-2 w-px h-2 bg-gray-40" />
          {networkIconUrl ? (
            <img alt="network" src="networkIconUrl" className="w-3 h-3" />
          ) : (
            <TemporaryIcon className="w-3 h-3" />
          )}

          <div className="text-gray-60 ml-1">{networkName}</div>
        </div>
      </div>
      <Close
        onClick={onClose}
        className="w-5 h-5 text-gray-60 cursor-pointer absolute top-3 right-3"
      />
      {cloneElement(children, {
        closeAction: onClose,
      })}
    </div>
  )
}

ActionSheet.propTypes = {
  title: PropTypes.string.isRequired,
  close: PropTypes.func.isRequired,
  showActionSheet: PropTypes.bool,
  children: PropTypes.node.isRequired,
}
export default ActionSheet
