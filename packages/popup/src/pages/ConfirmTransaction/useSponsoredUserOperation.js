import {useCurrentTxStore} from '../../hooks'
import {useSponsorshipPreparation} from '../../hooks/useSponsorshipPreparation'

function useSponsoredUserOperation({accountId, networkId, calls}) {
  const sponsorshipDeclined = useCurrentTxStore(
    state => state.sponsorshipDeclined,
  )
  const {refresh, ...preparation} = useSponsorshipPreparation({
    accountId,
    networkId,
    calls,
  })

  return {
    ...preparation,
    isActive: preparation.available && !sponsorshipDeclined,
    prepare: refresh,
  }
}

export default useSponsoredUserOperation
