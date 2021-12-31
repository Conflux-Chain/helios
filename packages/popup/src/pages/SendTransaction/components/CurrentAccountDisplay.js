import PropTypes from 'prop-types'
import {AccountDisplay} from '../../../components'

function CurrentAccountDisplay({currentAccount}) {
  const {nickname, address, eid: accountId} = currentAccount

  return (
    <AccountDisplay
      address={address}
      accountId={accountId}
      nickname={nickname}
    />
  )
}

CurrentAccountDisplay.propTypes = {
  currentAccount: PropTypes.object,
}

export default CurrentAccountDisplay
