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
      cardTitle={t('network')}
      onClose={onClose}
      onOpen={onOpen}
      cardDescription={<CurrentAccountNetworkLabel />}
      cardContent={<NetworkContent onClickNetworkItem={onClickNetworkItem} />}
    />
  )
}

NetworkList.propTypes = {
  onClose: PropTypes.func.isRequired,
  onOpen: PropTypes.bool,
}

export default NetworkList
