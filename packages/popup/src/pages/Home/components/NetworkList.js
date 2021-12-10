import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {SlideCard} from '../../../components'
import {CurrentAccountNetworkLabel} from './'
import {NetworkContent} from '../../../components'

function NetworkList({onClose, open}) {
  const {t} = useTranslation()

  const onCloseNetwork = () => {
    onClose && onClose()
  }
  return (
    <SlideCard
      cardTitle={t('network')}
      onClose={onClose}
      open={open}
      cardDescription={<CurrentAccountNetworkLabel />}
      cardContent={<NetworkContent onClose={onCloseNetwork} />}
    />
  )
}

NetworkList.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool,
}

export default NetworkList
