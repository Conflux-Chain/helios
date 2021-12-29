import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {SlideCard, NetworkContent} from '../../../components'

function NetworkList({onClose, open}) {
  const {t} = useTranslation()

  const onCloseNetwork = () => {
    onClose && onClose()
  }
  return (
    <SlideCard
      id="network-list"
      cardTitle={
        <div className="ml-3 pb-1">
          <p className="text-base text-gray-80 font-medium">{t('network')}</p>
        </div>
      }
      onClose={onClose}
      open={open}
      cardContent={<NetworkContent onClose={onCloseNetwork} />}
    />
  )
}

NetworkList.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
}

export default NetworkList
