import PropTypes from 'prop-types'
import {Close} from '@fluent-wallet/component-icons'
import {useState, useEffect} from 'react'
import {useTranslation} from 'react-i18next'

// TODO: remove when avatar programme confirmed
// eslint-disable-next-line react/prop-types
function TemporaryIcon({className = ''}) {
  return (
    <div className={`inline-block bg-gray-40 rounded-full ${className}`}></div>
  )
}

const ActionSheet = ({close, showActionSheet = false, children}) => {
  const [containerStyle, setContainerStyle] = useState('hidden')
  const {t} = useTranslation()
  const onClose = () => {
    close()
    setContainerStyle('animate-slide-down')
  }

  useEffect(() => {
    showActionSheet && setContainerStyle('animate-slide-up block')
  }, [showActionSheet])

  return (
    <div
      className={`bg-bg rounded-t-xl px-3 pt-4 pb-7 absolute w-93 bottom-0 overflow-y-auto no-scroll ${containerStyle} h-[500px] `}
    >
      <div className="ml-3 pb-1">
        <p className="text-base text-gray-80">{t('myAccounts')}</p>
        <div className="flex items-center text-xs mt-1">
          <TemporaryIcon className="w-3 h-3" />
          <div className="text-gray-40 ml-1">current account</div>
          <div className="mx-2 w-px h-2 bg-gray-40" />
          <TemporaryIcon className="w-3 h-3" />
          <div className="text-gray-60 ml-1">current net</div>
        </div>
      </div>
      <Close
        onClick={onClose}
        className="w-5 h-5 text-gray-60 cursor-pointer absolute top-3 right-3"
      />
      {children}
    </div>
  )
}

ActionSheet.propTypes = {
  close: PropTypes.func.isRequired,
  showActionSheet: PropTypes.bool,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
}
export default ActionSheet
