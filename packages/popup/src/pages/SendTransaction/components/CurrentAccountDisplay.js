import {useCurrentAccount} from '../../../hooks'
import {AccountDisplay} from '../../../components'

function CurrentAccountDisplay() {
  const {nickname, address, eid: accountId} = useCurrentAccount()

  return (
    <AccountDisplay
      address={address}
      accountId={accountId}
      nickname={nickname}
    />
  )
}
export default CurrentAccountDisplay
