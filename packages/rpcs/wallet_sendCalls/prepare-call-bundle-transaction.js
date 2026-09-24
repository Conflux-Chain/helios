import {
  buildCallBundleTransaction,
  getAtomicCapability,
} from '@fluent-wallet/eip-5792'

async function getCallBundleAtomicCapability({
  wallet_getEip7702AccountStates,
  network,
  accountId,
  canSwitchDelegation,
}) {
  const [accountState] = await wallet_getEip7702AccountStates(
    {
      errorFallThrough: true,
      network,
      networkName: network.name,
    },
    [
      {
        accountId,
        networkId: network.eid,
      },
    ],
  )

  const atomicCapability = getAtomicCapability({
    isChainEnabled: true,
    isAccountSupported: true,
    delegationState: accountState.state,
    canSwitchDelegation,
  })

  if (!atomicCapability) {
    return null
  }

  return {
    ...atomicCapability,
    preferredDelegateAddress: accountState.preferredDelegateAddress,
  }
}

export async function prepareCallBundleTransaction(
  {from, calls, accountId, atomicRequired, network, networkConfig},
  {wallet_getEip7702AccountStates, AtomicityNotSupported, Server},
) {
  let requiredDelegationAction = null
  let authorizationAddress

  // A single transaction sends the call directly to its target and therefore
  // does not depend on the account's current delegation.
  if (calls.length > 1) {
    const atomicCapability = await getCallBundleAtomicCapability({
      wallet_getEip7702AccountStates,
      network,
      accountId,
      canSwitchDelegation: networkConfig.canSwitchDelegation,
    })

    if (!atomicCapability) {
      const message =
        'The selected account cannot execute multiple calls atomically'

      if (atomicRequired) {
        throw AtomicityNotSupported(message)
      }

      throw Server(message)
    }

    requiredDelegationAction = atomicCapability.requiredDelegationAction
    authorizationAddress = requiredDelegationAction
      ? atomicCapability.preferredDelegateAddress
      : undefined
  }

  const transaction = buildCallBundleTransaction({
    from,
    chainId: network.chainId,
    calls,
    authorizationAddress,
  })

  return {
    transaction,
    requiredDelegationAction,
  }
}
