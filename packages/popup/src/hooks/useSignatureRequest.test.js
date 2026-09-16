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
  const {typedData, address} = useSignatureRequest()
  return (
    <>
      <output data-testid="result">{JSON.stringify(typedData)}</output>
      <output data-testid="address">{address}</output>
    </>
  )
}

beforeEach(() => {
  mocks.usePendingAuthReq.mockReset()
  mocks.useAddressByNetworkId.mockReset()
  mocks.usePendingAuthReq.mockReturnValue([])
  mocks.useAddressByNetworkId.mockReturnValue({})
})

describe('useSignatureRequest', () => {
  it('returns empty typed data when there is no pending request', () => {
    render(<Result />)

    expect(screen.getByTestId('result')).toHaveTextContent('{}')
    expect(mocks.useAddressByNetworkId).toHaveBeenCalledWith(
      undefined,
      undefined,
    )
  })

  it('parses typed-data requests and resolves the account address', () => {
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

    expect(JSON.parse(screen.getByTestId('result').textContent)).toEqual(
      typedData,
    )
    expect(screen.getByTestId('address')).toHaveTextContent(OWNER_ADDRESS)
    expect(mocks.useAddressByNetworkId).toHaveBeenCalledWith(7, 8)
  })

  it('does not attempt to parse personal-sign payloads as typed data', () => {
    mocks.usePendingAuthReq.mockReturnValue([
      {
        req: {
          method: 'personal_sign',
          params: [JSON.stringify(typedData), JSON.stringify(typedData)],
        },
      },
    ])

    render(<Result />)

    expect(screen.getByTestId('result')).toHaveTextContent('{}')
  })

  it.each(['not-json', 'null', '[]', '42', '"text"', undefined, typedData])(
    'returns empty typed data for invalid payload %j',
    payload => {
      mocks.usePendingAuthReq.mockReturnValue([
        {
          req: {
            method: 'eth_signTypedData_v4',
            params: ['0xignored', payload],
          },
        },
      ])

      render(<Result />)

      expect(screen.getByTestId('result')).toHaveTextContent('{}')
    },
  )
})
