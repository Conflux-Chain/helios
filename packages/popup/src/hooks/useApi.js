import {useRPC} from '@cfxjs/use-rpc'
import {useGlobalState} from '../stores/useGlobalStore'

export function useAccountGroup(isFetch) {
  const {setAccountGroups, accountGroups} = useGlobalState()
  const {data: newAccountGroups} = useRPC(
    isFetch ? 'wallet_getAccountGroup' : null,
    {type: 'pd'},
  )
  if (newAccountGroups && newAccountGroups !== accountGroups) {
    setAccountGroups(newAccountGroups)
  }
}
