// @vitest-environment jsdom
import {createElement} from 'react'
import {cleanup, fireEvent, render, screen} from '@testing-library/react'
import {afterEach, describe, expect, it, vi} from 'vitest'
import {useSimulateTransaction} from './useSimulateTransaction'

vi.mock('./useApi', () => ({
  usePreferences: () => ({data: {enableSimulate: true}}),
}))
vi.mock('react-i18next', () => ({useTranslation: () => ({t: key => key})}))
vi.mock('@fluent-wallet/component-message', () => ({default: {error: vi.fn()}}))

function SimulateProbe(props) {
  const {showSimulate, simulateDisabled, onSimulate} =
    useSimulateTransaction(props)
  return showSimulate
    ? createElement(
        'button',
        {onClick: onSimulate, disabled: simulateDisabled},
        'Simulate',
      )
    : null
}

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('useSimulateTransaction', () => {
  it('keeps Simulate visible but disabled during estimation and uses updated gas when ready', () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null)
    const props = {
      network: {
        type: 'eth',
        chainId: '0x406',
        scanUrl: 'https://evm.confluxscan.org',
      },
      transaction: {data: '0x', gas: '0x5208'},
      estimationLoading: true,
    }
    const {rerender} = render(createElement(SimulateProbe, props))
    const button = screen.getByRole('button', {name: 'Simulate'})
    expect(button.disabled).toBe(true)
    fireEvent.click(button)
    expect(open).not.toHaveBeenCalled()

    rerender(
      createElement(SimulateProbe, {
        ...props,
        estimationLoading: false,
        transaction: {...props.transaction, gas: '0x12345'},
      }),
    )
    expect(button.disabled).toBe(false)
    fireEvent.click(button)
    expect(new URL(open.mock.calls[0][0]).searchParams.get('gas')).toBe(
      '0x12345',
    )
  })

  it('guards direct handler invocation while estimation is pending', () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null)
    let simulate
    function HandlerProbe() {
      simulate = useSimulateTransaction({
        network: {
          type: 'eth',
          chainId: '0x406',
          scanUrl: 'https://evm.confluxscan.org',
        },
        transaction: {data: '0x'},
        estimationLoading: true,
      }).onSimulate
      return null
    }
    render(createElement(HandlerProbe))
    simulate()
    expect(open).not.toHaveBeenCalled()
  })
  it.each([
    ['0x406', 'https://evm.confluxscan.org'],
    ['0x47', 'https://evmtestnet.confluxscan.org'],
  ])('opens the transaction network Scan for %s', (chainId, scanUrl) => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null)
    render(
      createElement(SimulateProbe, {
        network: {type: 'eth', chainId, scanUrl},
        transaction: {data: '0x1234', value: '0x2'},
      }),
    )
    fireEvent.click(screen.getByRole('button', {name: 'Simulate'}))
    expect(open).toHaveBeenCalledWith(
      `${scanUrl}/simulate-trace?data=0x1234&value=0x2`,
      '_blank',
      'noopener,noreferrer',
    )
  })

  it('does not open Scan while the transaction is disabled', () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null)
    render(
      createElement(SimulateProbe, {
        network: {
          type: 'eth',
          chainId: '0x406',
          scanUrl: 'https://evm.confluxscan.org',
        },
        transaction: {data: '0x'},
        disabled: true,
      }),
    )
    fireEvent.click(screen.getByRole('button', {name: 'Simulate'}))
    expect(open).not.toHaveBeenCalled()
  })
})
