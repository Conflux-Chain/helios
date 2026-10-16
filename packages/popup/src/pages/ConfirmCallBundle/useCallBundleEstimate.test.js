// @vitest-environment jsdom
import {createElement} from 'react'
import PropTypes from 'prop-types'
import {cleanup, fireEvent, render, screen} from '@testing-library/react'
import {afterEach, describe, expect, it, vi} from 'vitest'
import {useTransactionEstimate} from '../../hooks/useTransactionEstimate'
import {useSimulateTransaction} from '../../hooks/useSimulateTransaction'
import {useCallBundleEstimate} from './useCallBundleEstimate'

vi.mock('../../hooks/useTransactionEstimate', () => ({
  useTransactionEstimate: vi.fn(),
}))
vi.mock('@fluent-wallet/estimate-tx', () => ({ethGetFeeData: vi.fn()}))
vi.mock('../../utils', () => ({bn16: vi.fn()}))
vi.mock('../../hooks/useApi', () => ({
  usePreferences: () => ({data: {enableSimulate: true}}),
}))
vi.mock('react-i18next', () => ({useTranslation: () => ({t: key => key})}))
vi.mock('@fluent-wallet/component-message', () => ({default: {error: vi.fn()}}))

const network = {
  type: 'eth',
  chainId: '0x406',
  scanUrl: 'https://evm.confluxscan.org',
}
const transaction = {
  from: '0x1111111111111111111111111111111111111111',
  to: '0x2222222222222222222222222222222222222222',
  data: '0xaabb',
  value: '0x1',
}

function Probe({tx = transaction, txOptions = null}) {
  const estimate = useCallBundleEstimate({
    transaction: tx,
    calls: [],
    network,
    txOptions,
  })
  const {showSimulate, simulateDisabled, onSimulate} = useSimulateTransaction({
    transaction: estimate.simulationTransaction,
    network,
    estimationLoading: estimate.loading,
  })
  return showSimulate
    ? createElement(
        'button',
        {disabled: simulateDisabled, onClick: onSimulate},
        'Simulate',
      )
    : null
}

Probe.propTypes = {
  tx: PropTypes.object,
  txOptions: PropTypes.object,
}

afterEach(() => {
  cleanup()
  vi.resetAllMocks()
  vi.restoreAllMocks()
})

describe('batch simulation after estimation failure', () => {
  it('enables simulation after failure and leaves missing gas out of the URL', () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null)
    useTransactionEstimate.mockReturnValue({loading: true})
    const {rerender} = render(createElement(Probe))
    expect(screen.getByRole('button').disabled).toBe(true)

    useTransactionEstimate.mockReturnValue({
      loading: false,
      error: new Error('execution reverted'),
    })
    rerender(createElement(Probe))
    expect(screen.getByRole('button').disabled).toBe(false)
    fireEvent.click(screen.getByRole('button'))
    const params = new URL(open.mock.calls[0][0]).searchParams
    expect(params.has('gas')).toBe(false)
    expect(Object.fromEntries(params)).toEqual(transaction)
  })

  it.each([
    [{gasLimit: '30000', maxFeePerGas: '42'}, '0x7530'],
    [{gasLimit: '', maxFeePerGas: '42'}, null],
  ])(
    'preserves current gas edits when estimation fails: %j',
    (txOptions, gas) => {
      const open = vi.spyOn(window, 'open').mockImplementation(() => null)
      useTransactionEstimate.mockReturnValue({
        loading: false,
        error: new Error('RPC unavailable'),
      })
      render(
        createElement(Probe, {
          tx: {...transaction, gas: '0x5208'},
          txOptions,
        }),
      )
      fireEvent.click(screen.getByRole('button'))
      const params = new URL(open.mock.calls[0][0]).searchParams
      expect(params.get('gas')).toBe(gas)
      expect(params.get('maxFeePerGas')).toBe('0x2a')
    },
  )
})
