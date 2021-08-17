import React from 'react'
import testingLibrary from '@testing-library/react'
import {describe, expect, jest} from '@jest/globals'
import Menu from './index.js'
const {render, screen, fireEvent} = testingLibrary

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
    const onClick = jest.fn()
    render(<Menu onClick={onClick}>children</Menu>)
    fireEvent.click(screen.getByTestId('menu-wrapper'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
