import {render, screen, fireEvent, cleanup} from '@testing-library/react'
import {beforeEach, describe, expect, vi, it} from 'vitest'
import MenuItem from './MenuItem'

beforeEach(cleanup)
describe('MenuItem', () => {
  it('test snapshot', () => {
    // eslint-disable-next-line testing-library/render-result-naming-convention
    const snapshot = render(
      <MenuItem itemKey="key" selected={true}>
        content
      </MenuItem>,
    )
    expect(snapshot).toMatchSnapshot()
  })
  it('test selected when disabled is false', () => {
    render(
      <MenuItem itemKey="key" selected={true}>
        content
      </MenuItem>,
    )
    expect(screen.getByTestId('menu-item-wrapper')).toContainElement(
      screen.getByTestId('success-filled-wrapper'),
    )
  })
  it('test selected when disabled is true', () => {
    render(
      <MenuItem itemKey="key" selected={true} disabled={true}>
        content
      </MenuItem>,
    )
    expect(screen.getByTestId('menu-item-wrapper')).toContainElement(
      screen.getByTestId('disable-icon-wrapper'),
    )
  })

  it('test selected when passing selectedIcon', () => {
    render(
      <MenuItem
        itemKey="key"
        selected={true}
        selectedIcon={<div data-testid="selected-icon-wrapper" />}
      >
        content
      </MenuItem>,
    )
    expect(screen.getByTestId('menu-item-wrapper')).toContainElement(
      screen.getByTestId('selected-icon-wrapper'),
    )
  })

  it('test passing icon', () => {
    render(
      <MenuItem
        itemKey="key"
        icon={<div data-testid="icon-wrapper" className="test-class" />}
      >
        content
      </MenuItem>,
    )
    expect(screen.getByTestId('menu-item-wrapper')).toContainElement(
      screen.getByTestId('icon-wrapper'),
    )
    expect(screen.getByTestId('menu-item-wrapper')).toHaveClass('px-4')
    expect(screen.getByTestId('icon-wrapper')).toHaveClass(
      'mr-2 w-6 h-6',
      'test-class',
    )
  })
  it('test click function', () => {
    const onClick = vi.fn()
    render(
      <MenuItem onClick={onClick} itemKey="key">
        content
      </MenuItem>,
    )
    fireEvent.click(screen.getByTestId('menu-item-wrapper'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
  it('test click function and wrapper style when got disabled attribute', () => {
    const onClick = vi.fn()
    render(
      <MenuItem onClick={onClick} itemKey="key" disabled={true}>
        content
      </MenuItem>,
    )

    expect(screen.getByTestId('menu-item-wrapper')).toHaveClass(
      'text-gray-40 cursor-not-allowed',
    )

    fireEvent.click(screen.getByTestId('menu-item-wrapper'))
    expect(onClick).toHaveBeenCalledTimes(0)
  })
})
