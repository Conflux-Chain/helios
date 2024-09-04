import {render, screen, cleanup} from '@testing-library/react'
import {describe, expect, vi, beforeEach, afterEach, it} from 'vitest'
import Toast from './index.js'

beforeEach(cleanup)
describe('Tag', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })
  it('test snapshot', () => {
    // eslint-disable-next-line testing-library/render-result-naming-convention
    const snapshot = render(<Toast type="block" open={true} />)
    expect(snapshot).toMatchSnapshot()
  })
  it('test block type', () => {
    render(<Toast type="block" open={true} />)
    expect(screen.getByTestId('block-toast-wrapper')).toBeInTheDocument()
  })
  it('test line type', () => {
    render(<Toast type="line" open={true} />)
    expect(screen.getByTestId('line-toast-wrapper')).toBeInTheDocument()
  })
  it('test default type', () => {
    render(<Toast open={true} />)
    expect(screen.getByTestId('block-toast-wrapper')).toBeInTheDocument()
  })
  it('test open is false', () => {
    render(<Toast />)
    expect(screen.queryByTestId('block-toast-wrapper')).not.toBeInTheDocument()
  })
  it('test open is true', () => {
    render(<Toast open={true} />)
    expect(screen.getByTestId('block-toast-wrapper')).toBeInTheDocument()
  })
  it('test class name', () => {
    render(<Toast className="test-class-name" open={true} />)
    expect(screen.getByTestId('block-toast-wrapper')).toHaveClass(
      'test-class-name',
    )
  })
  it('test icon', () => {
    render(<Toast icon={<div data-testid="icon" />} open={true} />)
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('test title', () => {
    render(<Toast type="block" open={true} title="test-title" />)
    expect(screen.getByText('test-title')).toBeInTheDocument()
  })
  it('test content', () => {
    render(<Toast open={true} content="test-content" />)
    expect(screen.getByText('test-content')).toBeInTheDocument()
  })
  it('test onClose', async () => {
    const onClose = vi.fn()
    render(<Toast open={true} content="test-content" onClose={onClose} />)
    vi.advanceTimersByTime(2000)
    expect(onClose).toHaveBeenCalledTimes(1)
  })
  it('test autoHideDuration', async () => {
    const onClose = vi.fn()
    render(
      <Toast
        open={true}
        content="test-content"
        onClose={onClose}
        autoHideDuration={3000}
      />,
    )
    vi.advanceTimersByTime(3000)
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
