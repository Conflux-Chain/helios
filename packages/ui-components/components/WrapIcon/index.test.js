import React from 'react'
import testingLibrary from '@testing-library/react'
import {describe, expect, jest} from '@jest/globals'
import WrapIcon from './index.js'
const {render, screen, fireEvent} = testingLibrary
describe('WrapIcon', () => {
  it('test circle type', () => {
    render(<WrapIcon type="circle">children</WrapIcon>)
    expect(screen.getByTestId('circle-id')).toBeInTheDocument()
  })
  it('test square type', () => {
    render(<WrapIcon type="square">children</WrapIcon>)
    expect(screen.getByTestId('square-id')).toBeInTheDocument()
  })
  it('test incoming size when type is square', () => {
    render(
      <WrapIcon type="square" size="test-size">
        children
      </WrapIcon>,
    )
    expect(screen.getByTestId('wrap-icon-test-id')).toHaveClass('test-size')
    expect(screen.getByTestId('square-id')).toHaveClass('test-size')
  })

  it('test incoming size when type is circle', () => {
    render(
      <WrapIcon type="circle" size="test-size">
        children
      </WrapIcon>,
    )
    expect(screen.getByTestId('wrap-icon-test-id')).toHaveClass('test-size')
    expect(screen.getByTestId('circle-id')).toHaveClass('test-size')
  })
  it('test incoming className', () => {
    render(
      <WrapIcon type="square" className="test-class-name">
        children
      </WrapIcon>,
    )
    expect(screen.getByTestId('wrap-icon-test-id')).toHaveClass(
      'test-class-name',
    )
  })

  it('test onClick', () => {
    const onClick = jest.fn()
    render(
      <WrapIcon type="square" onClick={onClick}>
        children
      </WrapIcon>,
    )
    fireEvent.click(screen.getByTestId('wrap-icon-test-id'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('test true clickable', () => {
    render(
      <WrapIcon type="square" clickable={true}>
        children
      </WrapIcon>,
    )
    expect(screen.getByTestId('wrap-icon-test-id')).toHaveClass(
      'cursor-pointer',
    )
  })
  it('test false clickable', () => {
    render(
      <WrapIcon type="square" clickable={false}>
        children
      </WrapIcon>,
    )
    expect(screen.getByTestId('wrap-icon-test-id')).not.toHaveClass(
      'cursor-pointer',
    )
  })
})
