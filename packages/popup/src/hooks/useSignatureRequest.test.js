import {render, screen, cleanup} from '@testing-library/react'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {useSignatureRequest} from './useSignatureRequest'

const mocks = vi.hoisted(() => ({
  useAddressByNetworkId: vi.fn(),
  usePendingAuthReq: vi.fn(),
}))

vi.mock('./useApi', () => mocks)

afterEach(cleanup)

const OWNER_ADDRESS = '0x2222222222222222222222222222222222222222'

const typedData = {
  domain: {
    name: 'Example Token',
    chainId: 1,
    verifyingContract: '0x4444444444444444444444444444444444444444',
  },
  types: {
    EIP712Domain: [
      {name: 'name', type: 'string'},
      {name: 'chainId', type: 'uint256'},
      {name: 'verifyingContract', type: 'address'},
    ],
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
    spender: '0x3333333333333333333333333333333333333333',
    value: '1',
    nonce: '0',
    deadline: '456',
  },
}

function Result() {
  const permitType = useSignatureRequest().permitType
  return (
    <output data-testid="result">
      {permitType
        ? `${permitType.type}:${permitType.mode}:${permitType.ownerMatchesSigner}`
        : 'null'}
    </output>
  )
}

beforeEach(() => {
  mocks.usePendingAuthReq.mockReset()
  mocks.useAddressByNetworkId.mockReset()
  mocks.usePendingAuthReq.mockReturnValue([])
  mocks.useAddressByNetworkId.mockReturnValue({})
})

describe('usePermitType', () => {
  it('returns null when there is no pending request', () => {
    render(<Result />)

    expect(screen.getByTestId('result')).toHaveTextContent('null')
    expect(mocks.useAddressByNetworkId).toHaveBeenCalledWith(
      undefined,
      undefined,
    )
  })

  it('parses typed-data requests and detects their Permit type', () => {
    mocks.usePendingAuthReq.mockReturnValue([
      {
        req: {
          method: 'eth_signTypedData_v4',
          params: ['0xignored', JSON.stringify(typedData)],
        },
        app: {
          currentAccount: {eid: 7},
          currentNetwork: {eid: 8},
        },
      },
    ])
    mocks.useAddressByNetworkId.mockReturnValue({value: OWNER_ADDRESS})

    render(<Result />)

    expect(screen.getByTestId('result')).toHaveTextContent(
      'permit:normal-permit:true',
    )
    expect(mocks.useAddressByNetworkId).toHaveBeenCalledWith(7, 8)
  })

  it('does not attempt to parse personal-sign payloads as typed data', () => {
    mocks.usePendingAuthReq.mockReturnValue([
      {
        req: {
          method: 'personal_sign',
          params: ['not-json', 'also-not-json'],
        },
      },
    ])

    render(<Result />)

    expect(screen.getByTestId('result')).toHaveTextContent('null')
  })

  it('ignores malformed typed-data payloads without throwing', () => {
    mocks.usePendingAuthReq.mockReturnValue([
      {
        req: {
          method: 'eth_signTypedData_v4',
          params: ['0xignored', 'not-json'],
        },
      },
    ])

    render(<Result />)

    expect(screen.getByTestId('result')).toHaveTextContent('null')
  })
})
