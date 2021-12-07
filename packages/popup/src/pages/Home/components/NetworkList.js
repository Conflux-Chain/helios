import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {SlideCard} from '../../../components'
import {CurrentAccountNetworkLabel} from './'
import {NetworkContent} from '../../../components'

function NetworkList({onClose, onOpen}) {
  const {t} = useTranslation()

  const onClickNetworkItem = result => {
    result && onClose()
  }
  return (
    <SlideCard
      cardTitle={
        <div className="ml-3 pb-1">
          <p className="text-base text-gray-80 font-medium">{t('network')}</p>
          {<CurrentAccountNetworkLabel />}
        </div>
      }
      onClose={onClose}
      onOpen={onOpen}
      cardContent={<NetworkContent onClickNetworkItem={onClickNetworkItem} />}
    />
  )
}

NetworkList.propTypes = {
  onClose: PropTypes.func.isRequired,
  onOpen: PropTypes.bool,
}

export default NetworkList
