import PropTypes from 'prop-types'
import {AccountDisplay} from '../../../components'

function CurrentAccountDisplay({currentAccount}) {
  const {nickname, address} = currentAccount

  return <AccountDisplay address={address} nickname={nickname} />
}

CurrentAccountDisplay.propTypes = {
  currentAccount: PropTypes.object,
}

export default CurrentAccountDisplay
