import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {RPC_METHODS} from '../../../constants'
import {request} from '../../../utils'
import {useSWRConfig} from 'swr'
import {SlideCard} from '../../../components'
import {CurrentAccountNetworkLabel} from './'
import {NetworkContent} from '../../../components'
const {SET_CURRENT_NETWORK, GET_CURRENT_NETWORK} = RPC_METHODS

function NetworkList({onClose, onOpen}) {
  const {t} = useTranslation()
  const {mutate} = useSWRConfig()

  const onClickNetworkItem = ({networkId}) => {
    request(SET_CURRENT_NETWORK, [networkId]).then(({result}) => {
      result && onClose()
      mutate([GET_CURRENT_NETWORK])
      // TODO: need deal with error condition
    })
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
