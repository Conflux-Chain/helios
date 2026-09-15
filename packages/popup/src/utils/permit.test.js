import {describe, expect, it} from 'vitest'
import {formatPermitAmount, getPermitDisplayData} from './permit'

const TOKEN_ADDRESS = '0x1111111111111111111111111111111111111111'
const SECOND_TOKEN_ADDRESS = '0x2222222222222222222222222222222222222222'
const SPENDER_ADDRESS = '0x3333333333333333333333333333333333333333'
const UINT160_MAX = `0x${'f'.repeat(40)}`
const UINT256_MAX = `0x${'f'.repeat(64)}`

describe('formatPermitAmount', () => {
  it('shows the unlimited label only for the exact maximum uint value', () => {
    expect(formatPermitAmount(UINT160_MAX, 18, 160, 'Unlimited')).toBe(
      'Unlimited',
    )
    expect(formatPermitAmount(UINT256_MAX, 18, 256, 'Unlimited')).toBe(
      'Unlimited',
    )
    expect(
      formatPermitAmount((1n << 160n).toString(), 0, 160, 'Unlimited'),
    ).not.toBe('Unlimited')
  })

  it('formats hexadecimal and decimal amounts using token decimals', () => {
    expect(formatPermitAmount('0xde0b6b3a7640000', 18, 256, 'Unlimited')).toBe(
      '1',
    )
    expect(
      formatPermitAmount('1234567890000000000', 18, 256, 'Unlimited'),
    ).toBe('1.23456789')
    expect(formatPermitAmount('42', 0, 160, 'Unlimited')).toBe('42')
  })

  it('uses zero decimals when unavailable and rejects invalid precision', () => {
    for (const decimals of [undefined, null, '', 0]) {
      expect(formatPermitAmount('1000000', decimals, 256, 'Unlimited')).toBe(
        '1,000,000',
      )
    }
    for (const decimals of [-1, 1.5, 'invalid']) {
      expect(formatPermitAmount('1000000', decimals, 256, 'Unlimited')).toBe(
        '-',
      )
    }
    expect(formatPermitAmount('1000000', 0, 256, 'Unlimited')).toBe('1,000,000')
    expect(formatPermitAmount(UINT256_MAX, undefined, 256, 'Unlimited')).toBe(
      'Unlimited',
    )
  })

  it('keeps zero visible and uses a placeholder for invalid amounts', () => {
    expect(formatPermitAmount('0', 18, 256, 'Unlimited')).toBe('0')
    expect(formatPermitAmount(undefined, 18, 256, 'Unlimited')).toBe('-')
    expect(formatPermitAmount('not-a-number', 18, 256, 'Unlimited')).toBe('-')
  })
})

describe('getPermitDisplayData', () => {
  it('normalizes single and fixed-size batch Permit2 allowance details', () => {
    const details = {
      token: TOKEN_ADDRESS,
      amount: '100',
      expiration: '123',
      nonce: '0',
    }
    const types = {
      PermitDetails: [
        {name: 'token', type: 'address'},
        {name: 'amount', type: 'uint160'},
      ],
      PermitSingle: [{name: 'details', type: 'PermitDetails'}],
      PermitBatch: [{name: 'details', type: 'PermitDetails[2]'}],
    }

    expect(
      getPermitDisplayData(
        {
          primaryType: 'PermitSingle',
          types,
          message: {details, spender: SPENDER_ADDRESS},
        },
        {type: 'permit2', mode: 'signature-allowance'},
      ),
    ).toEqual({
      permissions: [details],
      amountBits: 160,
      isBatch: false,
      spender: SPENDER_ADDRESS,
      tokenCount: 1,
    })

    const batchDetails = [details, {...details, token: SECOND_TOKEN_ADDRESS}]
    expect(
      getPermitDisplayData(
        {
          primaryType: 'PermitBatch',
          types,
          message: {details: batchDetails, spender: SPENDER_ADDRESS},
        },
        {type: 'permit2', mode: 'signature-allowance', isBatch: true},
      ),
    ).toEqual({
      permissions: batchDetails,
      amountBits: 160,
      isBatch: true,
      spender: SPENDER_ADDRESS,
      tokenCount: 2,
    })
  })

  it('normalizes a Permit2 transfer permission and reads its amount width', () => {
    const permission = {token: TOKEN_ADDRESS, amount: '100'}
    const typedData = {
      primaryType: 'PermitTransferFrom',
      types: {
        PermitTransferFrom: [{name: 'permitted', type: 'TokenPermissions'}],
        TokenPermissions: [{name: 'amount', type: 'uint128'}],
      },
      message: {permitted: permission, spender: SPENDER_ADDRESS},
    }

    expect(
      getPermitDisplayData(typedData, {
        type: 'permit2',
        mode: 'signature-transfer',
      }),
    ).toEqual({
      permissions: [permission],
      amountBits: 128,
      isBatch: false,
      spender: SPENDER_ADDRESS,
      tokenCount: 1,
    })
  })

  it('maps a Permit2 batch transfer list and preserves the batch flag', () => {
    const permissions = [
      {token: TOKEN_ADDRESS, amount: '100'},
      {token: SECOND_TOKEN_ADDRESS, amount: '200'},
    ]
    const typedData = {
      primaryType: 'PermitBatchTransferFrom',
      types: {
        PermitBatchTransferFrom: [
          {name: 'permitted', type: 'TokenPermissions[]'},
        ],
        TokenPermissions: [{name: 'amount', type: 'uint256'}],
      },
      message: {permitted: permissions, spender: SPENDER_ADDRESS},
    }

    expect(
      getPermitDisplayData(typedData, {
        type: 'permit2',
        mode: 'signature-transfer',
        isBatch: true,
      }),
    ).toEqual({
      permissions,
      amountBits: 256,
      isBatch: true,
      spender: SPENDER_ADDRESS,
      tokenCount: 2,
    })
  })

  it('maps a DAI Permit allowed state to an allowance amount', () => {
    const typedData = {
      primaryType: 'Permit',
      domain: {verifyingContract: TOKEN_ADDRESS},
      types: {Permit: [{name: 'allowed', type: 'bool'}]},
      message: {spender: SPENDER_ADDRESS},
    }
    const maxUint256 = (1n << 256n) - 1n

    expect(
      getPermitDisplayData(
        {...typedData, message: {...typedData.message, allowed: true}},
        {type: 'permit', mode: 'dai-permit'},
      ),
    ).toEqual({
      permissions: [{amount: maxUint256.toString(), token: TOKEN_ADDRESS}],
      amountBits: 256,
      isBatch: false,
      spender: SPENDER_ADDRESS,
      tokenCount: 1,
    })

    expect(
      getPermitDisplayData(
        {...typedData, message: {...typedData.message, allowed: false}},
        {type: 'permit', mode: 'dai-permit'},
      ).permissions[0].amount,
    ).toBe('0')
  })

  it('maps a standard Permit value to the verifying token', () => {
    const typedData = {
      primaryType: 'Permit',
      domain: {verifyingContract: TOKEN_ADDRESS},
      types: {Permit: [{name: 'value', type: 'uint96'}]},
      message: {value: '100', spender: SPENDER_ADDRESS},
    }

    expect(
      getPermitDisplayData(typedData, {
        type: 'permit',
        mode: 'normal-permit',
      }),
    ).toEqual({
      permissions: [{amount: '100', token: TOKEN_ADDRESS}],
      amountBits: 96,
      isBatch: false,
      spender: SPENDER_ADDRESS,
      tokenCount: 1,
    })
  })
})
