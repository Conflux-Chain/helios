import {sponsorableInterface} from '@fluent-wallet/contract-abis/sponsorable.js'
import {toPackedUserOperation} from './packing.js'

export function encodeCanSponsorCall(userOperation) {
  return sponsorableInterface.encodeFunctionData('canSponsor', [
    toPackedUserOperation(userOperation),
  ])
}

export function decodeCanSponsorResult(result) {
  const [sponsorable, reason] = sponsorableInterface.decodeFunctionResult(
    'canSponsor',
    result,
  )

  return {
    sponsorable,
    reason,
  }
}
