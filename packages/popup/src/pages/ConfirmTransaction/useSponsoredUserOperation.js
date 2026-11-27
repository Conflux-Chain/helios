import {useCurrentTxStore} from '../../hooks'
import {useSponsorshipPreparation} from '../../hooks/useSponsorshipPreparation'

function useSponsoredUserOperation({accountId, networkId, calls}) {
  const sponsorshipEnabled = useCurrentTxStore(
    state => state.sponsorshipEnabled,
  )
  const sessionId = useCurrentTxStore(state => state.sessionId)
  const {refresh, ...preparation} = useSponsorshipPreparation({
    accountId,
    networkId,
    calls,
    sessionId,
    enabled: sponsorshipEnabled,
  })

  return {
    ...preparation,
    isActive: preparation.available,
    prepare: refresh,
  }
}

export default useSponsoredUserOperation
