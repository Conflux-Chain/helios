import {describe, expect, it} from 'vitest'
import {
  detectPermit,
  formatPermitAmount,
  getPermitDisplayData,
  getPermitFieldDisplay,
} from './permit'

const TOKEN_ADDRESS = '0x1111111111111111111111111111111111111111'
const SPENDER_ADDRESS = '0x3333333333333333333333333333333333333333'
const UINT160_MAX = `0x${'f'.repeat(40)}`
const UINT256_MAX = `0x${'f'.repeat(64)}`

const OWNER_ADDRESS = '0x2222222222222222222222222222222222222222'
const VERIFYING_CONTRACT = '0x4444444444444444444444444444444444444444'

const EIP712_DOMAIN = [
  {name: 'name', type: 'string'},
  {name: 'chainId', type: 'uint256'},
  {name: 'verifyingContract', type: 'address'},
]

const PERMIT_DETAILS = [
  {name: 'token', type: 'address'},
  {name: 'amount', type: 'uint160'},
  {name: 'expiration', type: 'uint48'},
  {name: 'nonce', type: 'uint48'},
]

const TOKEN_PERMISSIONS = [
  {name: 'token', type: 'address'},
  {name: 'amount', type: 'uint256'},
]

const permit2Domain = {
  name: 'Permit2',
  chainId: 1,
  verifyingContract: VERIFYING_CONTRACT,
}

const permit2Message = {
  details: {
    token: TOKEN_ADDRESS,
    amount: '100',
    expiration: '123',
    nonce: '0',
  },
  spender: SPENDER_ADDRESS,
  sigDeadline: '456',
}

const createPermit2Data = ({types: typeOverrides, ...overrides} = {}) => ({
  domain: permit2Domain,
  types: {
    EIP712Domain: EIP712_DOMAIN,
    PermitDetails: PERMIT_DETAILS,
    ...typeOverrides,
  },
  primaryType: 'PermitSingle',
  message: permit2Message,
  ...overrides,
})

const createStandardPermitData = overrides => ({
  domain: {
    name: 'Example Token',
    chainId: 1,
    verifyingContract: VERIFYING_CONTRACT,
  },
  types: {
    EIP712Domain: EIP712_DOMAIN,
    Permit: [
      {name: 'owner', type: 'address'},
      {name: 'spender', type: 'address'},
      {name: 'value', type: 'uint256'},
      {name: 'nonce', type: 'uint256'},
      {name: 'deadline', type: 'uint256'},
    ],
  },
  primaryType: 'Permit',
  message: {
    owner: OWNER_ADDRESS,
    spender: SPENDER_ADDRESS,
    value: '1000000000000000000',
    nonce: '0',
    deadline: '456',
  },
  ...overrides,
})

const createDaiPermitData = overrides => ({
  domain: {
    name: 'Dai Stablecoin',
    version: '1',
    chainId: 1,
    verifyingContract: VERIFYING_CONTRACT,
  },
  types: {
    EIP712Domain: [...EIP712_DOMAIN, {name: 'version', type: 'string'}],
    Permit: [
      {name: 'holder', type: 'address'},
      {name: 'spender', type: 'address'},
      {name: 'nonce', type: 'uint256'},
      {name: 'expiry', type: 'uint256'},
      {name: 'allowed', type: 'bool'},
    ],
  },
  primaryType: 'Permit',
  message: {
    holder: OWNER_ADDRESS,
    spender: SPENDER_ADDRESS,
    nonce: '0',
    expiry: '456',
    allowed: false,
  },
  ...overrides,
})

describe('detectPermit', () => {
  it('returns null for missing or unsupported typed data', () => {
    expect(detectPermit()).toBeNull()
    expect(detectPermit(null)).toBeNull()
    expect(detectPermit({typedData: null})).toBeNull()
    expect(
      detectPermit({
        typedData: {primaryType: 'Message', types: {}, message: {}},
      }),
    ).toBeNull()
    expect(
      detectPermit({typedData: {domain: null, types: null, message: null}}),
    ).toBeNull()
  })

  it('detects a Permit2 single allowance request', () => {
    const typedData = createPermit2Data({
      types: {
        PermitSingle: [
          {name: 'details', type: 'PermitDetails'},
          {name: 'spender', type: 'address'},
          {name: 'sigDeadline', type: 'uint256'},
        ],
      },
    })

    expect(detectPermit({typedData})).toEqual({
      type: 'permit2',
      mode: 'signature-allowance',
      amountBits: 160,
      permissionField: 'details',
      isBatch: false,
      isWitness: false,
    })
    expect(getPermitDisplayData(typedData, detectPermit({typedData}))).toEqual({
      permissions: [permit2Message.details],
      amountBits: 160,
      isBatch: false,
      spender: SPENDER_ADDRESS,
    })
  })

  it('detects a Permit2 batch allowance request', () => {
    const typedData = createPermit2Data({
      primaryType: 'PermitBatch',
      types: {
        PermitBatch: [
          {name: 'details', type: 'PermitDetails[]'},
          {name: 'spender', type: 'address'},
          {name: 'sigDeadline', type: 'uint256'},
        ],
      },
      message: {
        ...permit2Message,
        details: [permit2Message.details],
      },
    })

    expect(detectPermit({typedData})).toEqual({
      type: 'permit2',
      mode: 'signature-allowance',
      amountBits: 160,
      permissionField: 'details',
      isBatch: true,
      isWitness: false,
    })
    expect(getPermitDisplayData(typedData, detectPermit({typedData}))).toEqual({
      permissions: typedData.message.details,
      amountBits: 160,
      isBatch: true,
      spender: SPENDER_ADDRESS,
    })
  })

  it.each([
    ['PermitTransferFrom', 'TokenPermissions', false, false],
    ['PermitBatchTransferFrom', 'TokenPermissions[]', true, false],
    ['PermitWitnessTransferFrom', 'TokenPermissions', false, true],
    ['PermitBatchWitnessTransferFrom', 'TokenPermissions[]', true, true],
  ])(
    'detects Permit2 signature-transfer type %s',
    (primaryType, permittedType, isBatch, isWitness) => {
      const typedData = createPermit2Data({
        primaryType,
        types: {
          TokenPermissions: TOKEN_PERMISSIONS,
          [primaryType]: [
            {name: 'permitted', type: permittedType},
            {name: 'spender', type: 'address'},
            {name: 'nonce', type: 'uint256'},
            {name: 'deadline', type: 'uint256'},
            ...(isWitness ? [{name: 'witness', type: 'WitnessData'}] : []),
          ],
        },
        message: {
          permitted: isBatch
            ? [
                {token: TOKEN_ADDRESS, amount: '100'},
                {token: VERIFYING_CONTRACT, amount: '200'},
              ]
            : {token: TOKEN_ADDRESS, amount: '100'},
          spender: SPENDER_ADDRESS,
          nonce: '0',
          deadline: '456',
          ...(isWitness ? {witness: {value: 'example'}} : {}),
        },
      })

      if (isWitness) {
        expect(
          detectPermit({
            typedData: {
              ...typedData,
              message: {...typedData.message, witness: null},
            },
          }),
        ).not.toBeNull()
      }

      expect(detectPermit({typedData})).toEqual({
        type: 'permit2',
        mode: 'signature-transfer',
        isBatch,
        isWitness,
        amountBits: 256,
        permissionField: 'permitted',
      })
      expect(
        getPermitDisplayData(typedData, detectPermit({typedData})),
      ).toEqual({
        permissions: isBatch
          ? typedData.message.permitted
          : [typedData.message.permitted],
        amountBits: 256,
        isBatch,
        spender: SPENDER_ADDRESS,
      })
    },
  )

  it('does not classify malformed Permit2 structures', () => {
    const valid = createPermit2Data({
      types: {
        PermitSingle: [
          {name: 'details', type: 'PermitDetails'},
          {name: 'spender', type: 'address'},
          {name: 'sigDeadline', type: 'uint256'},
        ],
      },
    })

    expect(
      detectPermit({
        typedData: {
          ...valid,
          message: {...valid.message, sigDeadline: undefined},
        },
      }),
    ).toBeNull()

    expect(
      detectPermit({
        typedData: {
          ...valid,
          types: {
            ...valid.types,
            PermitDetails: PERMIT_DETAILS.map(field =>
              field.name === 'amount' ? {...field, type: 'uint256'} : field,
            ),
          },
        },
      }),
    ).toBeNull()

    expect(
      detectPermit({
        typedData: {
          ...valid,
          domain: {...valid.domain, name: 'Not Permit2'},
        },
      }),
    ).toBeNull()
  })

  it.each([
    ['standard Permit', createStandardPermitData],
    ['DAI Permit', createDaiPermitData],
  ])('rejects unsigned verifyingContract metadata for %s', (_, createData) => {
    const typedData = createData()
    for (const domainFields of [
      undefined,
      typedData.types.EIP712Domain.filter(
        ({name}) => name !== 'verifyingContract',
      ),
      typedData.types.EIP712Domain.map(field =>
        field.name === 'verifyingContract' ? {...field, type: 'string'} : field,
      ),
    ]) {
      expect(
        detectPermit({
          typedData: {
            ...typedData,
            types: {...typedData.types, EIP712Domain: domainFields},
          },
        }),
      ).toBeNull()
    }

    for (const verifyingContract of [undefined, null, '']) {
      expect(
        detectPermit({
          typedData: {
            ...typedData,
            domain: {...typedData.domain, verifyingContract},
          },
        }),
      ).toBeNull()
    }
  })

  it('detects a standard Permit', () => {
    const typedData = createStandardPermitData()

    expect(detectPermit({typedData})).toEqual({
      type: 'permit',
      mode: 'normal-permit',
      amountBits: 256,
      permissionField: null,
      isBatch: false,
      isWitness: false,
    })
  })

  it.each([true, false])('detects a DAI Permit with allowed=%s', allowed => {
    const typedData = createDaiPermitData()
    typedData.message.allowed = allowed

    expect(detectPermit({typedData})).toEqual({
      type: 'permit',
      mode: 'dai-permit',
      amountBits: 256,
      permissionField: null,
      isBatch: false,
      isWitness: false,
    })
  })
})

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
  it('does not build a display model for an unrecognized payload', () => {
    const typedData = {primaryType: 'Message'}
    expect(
      getPermitDisplayData(typedData, detectPermit({typedData})),
    ).toBeNull()
  })

  it('maps a recognized standard Permit to the verifying token', () => {
    const typedData = createStandardPermitData()
    expect(getPermitDisplayData(typedData, detectPermit({typedData}))).toEqual({
      permissions: [
        {amount: typedData.message.value, token: VERIFYING_CONTRACT},
      ],
      amountBits: 256,
      isBatch: false,
      spender: SPENDER_ADDRESS,
    })
  })

  it.each([true, false])('maps DAI allowed=%s to its allowance', allowed => {
    const typedData = createDaiPermitData()
    typedData.message.allowed = allowed
    expect(getPermitDisplayData(typedData, detectPermit({typedData}))).toEqual({
      permissions: [
        {
          amount: allowed ? ((1n << 256n) - 1n).toString() : '0',
          token: VERIFYING_CONTRACT,
        },
      ],
      amountBits: 256,
      isBatch: false,
      spender: SPENDER_ADDRESS,
    })
  })

  it.each(['uint96', 'uint128'])(
    'rejects nonstandard Permit value type %s',
    type => {
      const typedData = createStandardPermitData()
      typedData.types.Permit = typedData.types.Permit.map(field =>
        field.name === 'value' ? {...field, type} : field,
      )
      expect(detectPermit({typedData})).toBeNull()
      expect(
        getPermitDisplayData(typedData, detectPermit({typedData})),
      ).toBeNull()
    },
  )
})

describe('Permit2 permission data boundaries', () => {
  it.each([
    ['PermitSingle', 'details', false],
    ['PermitBatch', 'details', true],
    ['PermitTransferFrom', 'permitted', false],
    ['PermitBatchTransferFrom', 'permitted', true],
  ])(
    'rejects missing or malformed permissions for %s',
    (primaryType, field, isBatch) => {
      const isAllowance = field === 'details'
      const permissionType = isAllowance ? 'PermitDetails' : 'TokenPermissions'
      const typedData = createPermit2Data({
        primaryType,
        types: {
          TokenPermissions: TOKEN_PERMISSIONS,
          [primaryType]: [
            {name: field, type: permissionType + (isBatch ? '[]' : '')},
            {name: 'spender', type: 'address'},
            ...(isAllowance
              ? [{name: 'sigDeadline', type: 'uint256'}]
              : [
                  {name: 'nonce', type: 'uint256'},
                  {name: 'deadline', type: 'uint256'},
                ]),
          ],
        },
      })
      for (const invalid of [
        null,
        undefined,
        'invalid',
        {},
        ...(isBatch ? [[null], [{}]] : [[]]),
      ]) {
        const data = {
          ...typedData,
          message: {
            spender: SPENDER_ADDRESS,
            sigDeadline: '456',
            nonce: '0',
            deadline: '456',
            [field]: invalid,
          },
        }
        expect(detectPermit({typedData: data})).toBeNull()
      }
    },
  )
})

describe('getPermitFieldDisplay name matching', () => {
  it.each([
    'deadline',
    'endTime',
    'expiration',
    'expiry',
    'sigDeadline',
    'startTime',
    'validTo',
  ])('recognizes date field %s at root and nested paths', name => {
    for (const path of [[name], ['witness', name]]) {
      expect(getPermitFieldDisplay({}, {}, path)).toEqual({kind: 'date'})
    }
  })

  it.each([
    'amount',
    'buyAmount',
    'endAmount',
    'sellAmount',
    'startAmount',
    'value',
  ])('recognizes amount field %s with trusted token context', name => {
    const typedData = createStandardPermitData()
    typedData.message.token = TOKEN_ADDRESS
    expect(
      getPermitFieldDisplay(typedData, detectPermit({typedData}), [name]),
    ).toEqual({
      kind: 'amount',
      tokenAddress: VERIFYING_CONTRACT,
    })
    for (const isBatch of [false, true]) {
      const data = createPermit2Data({
        types: {
          PermitSingle: [
            {
              name: 'details',
              type: isBatch ? 'PermitDetails[]' : 'PermitDetails',
            },
          ],
        },
        message: {
          details: isBatch ? [permit2Message.details] : permit2Message.details,
        },
      })
      const descriptor = {type: 'permit2', permissionField: 'details', isBatch}
      expect(
        getPermitFieldDisplay(
          data,
          descriptor,
          isBatch ? ['details', 0, name] : ['details', name],
        ),
      ).toEqual({
        kind: 'amount',
        tokenAddress: TOKEN_ADDRESS,
      })
      expect(
        getPermitFieldDisplay(data, descriptor, ['witness', name]),
      ).toBeNull()
      data.types.PermitDetails = [{name: 'amount', type: 'uint160'}]
      expect(
        getPermitFieldDisplay(
          data,
          descriptor,
          isBatch ? ['details', 0, name] : ['details', name],
        ),
      ).toBeNull()
    }
  })
})
