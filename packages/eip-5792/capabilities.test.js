import {describe, expect, test} from 'vitest'
import {getAtomicCapability} from './capabilities.js'

const supportedAccount = {
  isChainEnabled: true,
  isAccountSupported: true,
}

describe('getAtomicCapability', () => {
  test('returns supported for the configured delegate', () => {
    expect(
      getAtomicCapability({
        ...supportedAccount,
        delegationState: 'delegatedToConfigured',
      }),
    ).toEqual({
      status: 'supported',
      requiredDelegationAction: null,
    })
  })

  test('returns ready with an upgrade for an undelegated account', () => {
    expect(
      getAtomicCapability({
        ...supportedAccount,
        delegationState: 'notDelegated',
      }),
    ).toEqual({
      status: 'ready',
      requiredDelegationAction: 'upgrade',
    })
  })

  test('does not advertise an unverified delegation switch', () => {
    expect(
      getAtomicCapability({
        ...supportedAccount,
        delegationState: 'delegatedToOther',
      }),
    ).toBeNull()
  })

  test('returns ready when delegation switching is enabled', () => {
    expect(
      getAtomicCapability({
        ...supportedAccount,
        delegationState: 'delegatedToOther',
        canSwitchDelegation: true,
      }),
    ).toEqual({
      status: 'ready',
      requiredDelegationAction: 'switch',
    })
  })

  test.each([
    ['the chain is disabled', {isChainEnabled: false}],
    ['the account is unsupported', {isAccountSupported: false}],
    ['the account code is unsupported', {delegationState: 'unsupportedCode'}],
  ])('does not advertise atomic capability when %s', (_name, overrides) => {
    expect(
      getAtomicCapability({
        ...supportedAccount,
        delegationState: 'delegatedToConfigured',
        ...overrides,
      }),
    ).toBeNull()
  })
})
