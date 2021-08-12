import React from 'react'
import testingLibrary from '@testing-library/react'
import {describe, expect} from '@jest/globals'
import Circle from './index.js'
const {render, screen} = testingLibrary

describe('Circle', () => {
  beforeEach(() => {
    render(
      <Circle
        color="test-color-class-name"
        size="test-size-class-name"
        className="test-class-name"
        containerClassName="test-container-class-name"
      />,
    )
  })
  it('should render incoming color class name', () => {
    expect(screen.getByTestId('circle-inner')).toHaveClass(
      'test-color-class-name',
    )
  })
  it('should render incoming size class name', () => {
    expect(screen.getByTestId('circle-inner')).toHaveClass(
      'test-size-class-name',
    )
  })
  it('should render incoming class name', () => {
    expect(screen.getByTestId('circle-inner')).toHaveClass('test-class-name')
  })
  it('should render incoming container class name', () => {
    expect(screen.getByTestId('circle-wrapper')).toHaveClass(
      'test-container-class-name',
    )
  })
})
