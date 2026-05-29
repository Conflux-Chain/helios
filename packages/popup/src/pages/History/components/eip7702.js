import {isArray} from '@fluent-wallet/checks'

export function getEip7702DelegateAddress(authorizationList) {
  const firstAuthorization = isArray(authorizationList)
    ? authorizationList[0]
    : authorizationList

  return (
    firstAuthorization?.address ||
    firstAuthorization?.eip7702Authorization?.address ||
    ''
  )
}
