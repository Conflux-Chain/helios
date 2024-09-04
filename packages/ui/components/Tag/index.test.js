import {
  render,
  screen,
  waitFor,
  fireEvent,
  cleanup,
} from '@testing-library/react'
import {beforeEach, describe, expect, vi, it} from 'vitest'
import Tag from './index.js'

beforeEach(cleanup)
describe('Tag', () => {
  it('test snapshot', () => {
    // eslint-disable-next-line testing-library/render-result-naming-convention
    const snapshot = render(
      <Tag className="test-class-name">some children</Tag>,
    )
    expect(snapshot).toMatchSnapshot()
  })
  it('test className', () => {
    render(<Tag className="test-class-name">some children</Tag>)
    expect(screen.getByRole('button')).toHaveClass('test-class-name')
  })
  it('test close icon', () => {
    render(<Tag closable={true}>some children</Tag>)
    expect(screen.getByTestId('close-icon')).toBeInTheDocument()
  })
  it('test small size', () => {
    render(
      <Tag size="small" closable={true}>
        some children
      </Tag>,
    )
    expect(screen.getByRole('button')).toHaveClass('text-2xs h-4 px-1')
    expect(screen.getByTestId('close-icon')).toHaveClass('w-2 h-2')
  })
  it('test medium size', () => {
    render(
      <Tag size="medium" closable={true}>
        some children
      </Tag>,
    )
    expect(screen.getByRole('button')).toHaveClass('text-xs h-6 px-2')
    expect(screen.getByTestId('close-icon')).toHaveClass('w-3 h-3')
  })
  it('test primary color', () => {
    render(
      <Tag closable={true} color="primary">
        some children
      </Tag>,
    )
    expect(screen.getByRole('button')).toHaveClass(
      'text-primary bg-primary-10 border border-transparent hover:border-primary',
    )
    expect(screen.getByTestId('close-icon')).toHaveClass('text-primary')
  })

  it('test error color', () => {
    render(
      <Tag closable={true} color="error">
        some children
      </Tag>,
    )
    expect(screen.getByRole('button')).toHaveClass(
      'text-error bg-error-10 border border-transparent hover:border-error',
    )
    expect(screen.getByTestId('close-icon')).toHaveClass('text-error')
  })

  it('test onClose', async () => {
    const onClose = vi.fn()
    render(
      <Tag closable={true} onClose={onClose}>
        some children
      </Tag>,
    )
    await fireEvent.click(screen.getByTestId('close-icon-wrapper'))
    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  it('test onClick', async () => {
    const onClick = vi.fn()
    render(<Tag onClick={onClick}>some children</Tag>)
    await fireEvent.click(screen.getByRole('button'))
    await waitFor(() => {
      expect(onClick).toHaveBeenCalledTimes(1)
    })
  })

  it('test icon', () => {
    render(<Tag icon={<div data-testid="test-icon" />}>some children</Tag>)
    expect(screen.getByRole('button')).toContainElement(
      screen.getByTestId('test-icon'),
    )
  })

  it('test closeIcon', () => {
    render(
      <Tag closeIcon={<div data-testid="test-close-icon" />} closable={true}>
        some children
      </Tag>,
    )
    expect(screen.getByRole('button')).toContainElement(
      screen.getByTestId('test-close-icon'),
    )
  })
})
