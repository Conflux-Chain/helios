import {render, screen, fireEvent, cleanup} from '@testing-library/react'
import {describe, expect, vi, it, beforeEach} from 'vitest'
import Link from './index.js'

beforeEach(cleanup)
describe('Link', () => {
  it('test snapshot', () => {
    // eslint-disable-next-line testing-library/render-result-naming-convention
    const snapshot = render(<Link className="test-class">text</Link>)
    expect(snapshot).toMatchSnapshot()
  })
  it('should render class name', () => {
    render(<Link className="test-class">text</Link>)
    expect(screen.getByTestId('link-wrapper')).toHaveClass('test-class')
  })

  it('test incoming small size', () => {
    render(<Link size="small">text</Link>)
    expect(screen.getByTestId('link-wrapper')).toHaveClass('text-xs')
  })
  it('test incoming medium size', () => {
    render(<Link size="medium">text</Link>)
    expect(screen.getByTestId('link-wrapper')).toHaveClass('text-sm')
  })
  it('test incoming large size', () => {
    render(<Link size="large">text</Link>)
    expect(screen.getByTestId('link-wrapper')).toHaveClass('text-base')
  })
  it('test disabled', () => {
    const onClick = vi.fn()
    render(
      <Link
        disabled={true}
        onClick={onClick}
        startIcon={<div data-testid="start" />}
        endIcon={<div data-testid="end" />}
      >
        text
      </Link>,
    )
    // style
    expect(screen.getByTestId('link-wrapper')).toHaveClass(
      'bg-transparent text-gray-40 cursor-not-allowed',
    )

    // iconColor
    expect(screen.getByTestId('start')).toHaveClass('text-gray-40')
    expect(screen.getByTestId('end')).toHaveClass('text-gray-40')

    // event
    fireEvent.click(screen.getByTestId('link-wrapper'))
    expect(onClick).toHaveBeenCalledTimes(0)
  })
  it('test incoming click', () => {
    const onClick = vi.fn()
    render(<Link onClick={onClick}>text</Link>)

    fireEvent.click(screen.getByTestId('link-wrapper'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
