import {render, screen, fireEvent, cleanup} from '@testing-library/react'
import {beforeEach, describe, expect, vi, it} from 'vitest'
import Menu from './index.js'

beforeEach(cleanup)

describe('Menu', () => {
  it('test snapshot', () => {
    // eslint-disable-next-line testing-library/render-result-naming-convention
    const snapshot = render(<Menu className="test-class">children</Menu>)
    expect(snapshot).toMatchSnapshot()
  })
  it('should render incoming class name', () => {
    render(<Menu className="test-class">children</Menu>)
    expect(screen.getByTestId('menu-wrapper')).toHaveClass('test-class')
  })

  it('test click function', () => {
    const onClick = vi.fn()
    render(<Menu onClick={onClick}>children</Menu>)
    fireEvent.click(screen.getByTestId('menu-wrapper'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
