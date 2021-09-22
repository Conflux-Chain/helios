import PropTypes from 'prop-types'
import {useClickAway} from 'react-use'
import {CloseOutlined} from '@fluent-wallet/component-icons'
import {useState, useEffect, cloneElement, useRef} from 'react'
import {useTranslation} from 'react-i18next'
import {useRPC} from '@fluent-wallet/use-rpc'
import {RPC_METHODS} from '../../../constants'
import {useSlideAnimation} from '../../../hooks'
const {GET_CURRENT_NETWORK, GET_CURRENT_ACCOUNT} = RPC_METHODS

const ActionSheet = ({onClose, showActionSheet = false, title, children}) => {
  const [accountName, setAccountName] = useState('')
  const [networkName, setNetworkName] = useState('')
  const [networkIconUrl, setNetworkIconUrl] = useState(null)

  const {t} = useTranslation()
  const {data: currentNetworkData} = useRPC([GET_CURRENT_NETWORK])
  const {data: currentAccountData} = useRPC([GET_CURRENT_ACCOUNT])
  const animateStyle = useSlideAnimation(showActionSheet)
  const ref = useRef(null)

  useEffect(() => {
    setAccountName(currentAccountData?.nickname || '')
  }, [currentAccountData])

  useEffect(() => {
    setNetworkIconUrl(currentNetworkData?.icon)
    setNetworkName(currentNetworkData?.name || '')
  }, [currentNetworkData])

  useClickAway(ref, e => {
    onClose && onClose(e)
  })

  if (!animateStyle) {
    return null
  }
  return (
    <div
      className={`bg-bg rounded-t-xl px-3 pt-4 pb-7 absolute w-93 bottom-0 overflow-y-auto no-scroll ${animateStyle} h-125 `}
      ref={ref}
    >
      <div className="ml-3 pb-1">
        <p className="text-base text-gray-80 font-medium">{t(`${title}`)}</p>
        <div className="flex items-center text-xs mt-1">
          <img className="w-3 h-3 mr-1" src="" alt="avatar" />
          <div className="text-gray-40">{accountName}</div>
          <div className="mx-2 w-px h-2 bg-gray-40" />
          <img
            alt="network"
            src={networkIconUrl || ''}
            className="w-3 h-3 mr-1"
          />
          <div className="text-gray-60">{networkName}</div>
        </div>
      </div>
      <CloseOutlined
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
  onClose: PropTypes.func.isRequired,
  showActionSheet: PropTypes.bool,
  children: PropTypes.node.isRequired,
}
export default ActionSheet
