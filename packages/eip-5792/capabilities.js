import {EIP7702_ACCOUNT_STATES} from '@fluent-wallet/consts'

export function getAtomicCapability({
  isChainEnabled,
  isAccountSupported,
  delegationState,
  canSwitchDelegation = false,
}) {
  if (!isChainEnabled || !isAccountSupported) {
    return null
  }

  switch (delegationState) {
    case EIP7702_ACCOUNT_STATES.DELEGATED_TO_CONFIGURED:
      return {
        status: 'supported',
        requiredDelegationAction: null,
      }

    case EIP7702_ACCOUNT_STATES.NOT_DELEGATED:
      return {
        status: 'ready',
        requiredDelegationAction: 'upgrade',
      }

    case EIP7702_ACCOUNT_STATES.DELEGATED_TO_OTHER:
      if (canSwitchDelegation) {
        return {
          status: 'ready',
          requiredDelegationAction: 'switch',
        }
      }

      return null

    default:
      return null
  }
}
