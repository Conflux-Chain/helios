import {describe, expect, it} from 'vitest'
import {detectPermitType, getIsRevokeDAIPermit, parseTypedData} from './index'

const TOKEN_ADDRESS = '0x1111111111111111111111111111111111111111'
const OWNER_ADDRESS = '0x2222222222222222222222222222222222222222'
const SPENDER_ADDRESS = '0x3333333333333333333333333333333333333333'
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

describe('parseTypedData', () => {
  it('parses object payloads and returns an empty object for invalid payloads', () => {
    expect(parseTypedData('{"primaryType":"Permit"}')).toEqual({
      primaryType: 'Permit',
    })
    expect(parseTypedData('not-json')).toEqual({})
    expect(parseTypedData('null')).toEqual({})
    expect(parseTypedData('[]')).toEqual({})
    expect(parseTypedData()).toEqual({})
  })
})

describe('detectPermitType', () => {
  it('returns null for missing or unsupported typed data', () => {
    expect(detectPermitType()).toBeNull()
    expect(detectPermitType(null)).toBeNull()
    expect(detectPermitType({typedData: null})).toBeNull()
    expect(
      detectPermitType({
        typedData: {primaryType: 'Message', types: {}, message: {}},
      }),
    ).toBeNull()
    expect(
      detectPermitType({typedData: {domain: null, types: null, message: null}}),
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

    expect(detectPermitType({typedData})).toEqual({
      type: 'permit2',
      mode: 'signature-allowance',
      typedData,
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

    expect(detectPermitType({typedData})).toEqual({
      type: 'permit2',
      mode: 'signature-allowance',
      isBatch: true,
      typedData,
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

      expect(detectPermitType({typedData})).toMatchObject({
        type: 'permit2',
        mode: 'signature-transfer',
        isBatch,
        isWitness,
        typedData,
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
      detectPermitType({
        typedData: {
          ...valid,
          message: {...valid.message, sigDeadline: undefined},
        },
      }),
    ).toBeNull()

    expect(
      detectPermitType({
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
      detectPermitType({
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
        detectPermitType({
          typedData: {
            ...typedData,
            types: {...typedData.types, EIP712Domain: domainFields},
          },
        }),
      ).toBeNull()
    }

    for (const verifyingContract of [undefined, null, '']) {
      expect(
        detectPermitType({
          typedData: {
            ...typedData,
            domain: {...typedData.domain, verifyingContract},
          },
        }),
      ).toBeNull()
    }
  })

  it('detects a standard Permit and compares its owner with the signer', () => {
    const typedData = createStandardPermitData()

    expect(
      detectPermitType({
        typedData,
        signerAddress: OWNER_ADDRESS.toUpperCase(),
      }),
    ).toEqual({
      type: 'permit',
      mode: 'normal-permit',
      ownerMatchesSigner: true,
      typedData,
    })

    expect(
      detectPermitType({
        typedData,
        signerAddress: SPENDER_ADDRESS,
      }),
    ).toMatchObject({
      type: 'permit',
      mode: 'normal-permit',
      ownerMatchesSigner: false,
    })
  })

  it('detects a DAI Permit independently of the normal Permit shape', () => {
    const typedData = createDaiPermitData()

    expect(detectPermitType({typedData, signerAddress: OWNER_ADDRESS})).toEqual(
      {
        type: 'permit',
        mode: 'dai-permit',
        ownerMatchesSigner: true,
        typedData,
      },
    )
  })
})

describe('getIsRevokeDAIPermit', () => {
  it('returns true only for a typed DAI permit with allowed=false', () => {
    expect(getIsRevokeDAIPermit(createDaiPermitData())).toBe(true)
    expect(
      getIsRevokeDAIPermit(
        createDaiPermitData({
          message: {...createDaiPermitData().message, allowed: true},
        }),
      ),
    ).toBe(false)
  })

  it('rejects missing or invalid verifying-contract metadata', () => {
    const typedData = createDaiPermitData()

    expect(getIsRevokeDAIPermit()).toBe(false)
    expect(
      getIsRevokeDAIPermit({domain: null, message: null, types: null}),
    ).toBe(false)
    expect(
      getIsRevokeDAIPermit({
        ...typedData,
        domain: {...typedData.domain, verifyingContract: undefined},
      }),
    ).toBe(false)
    expect(
      getIsRevokeDAIPermit({
        ...typedData,
        types: {
          ...typedData.types,
          Permit: typedData.types.Permit.filter(({name}) => name !== 'allowed'),
        },
      }),
    ).toBe(false)
  })
})
