import React from 'react'
import testingLibrary from '@testing-library/react'
import {describe, expect, jest} from '@jest/globals'
import Button from './index.js'
const {render, screen, fireEvent} = testingLibrary

describe('Button', () => {
  describe('normal Button status', () => {
    beforeEach(() => {
      render(
        <Button
          className="test-class-name"
          size="small"
          color="primary"
          variant="contained"
        >
          test children
        </Button>,
      )
    })

    it('should render small size', () => {
      expect(screen.getByTestId('button-wrapper')).toHaveClass('text-xs h-8')
    })
    it('should render incoming class name', () => {
      expect(screen.getByTestId('button-wrapper')).toHaveClass(
        'test-class-name',
      )
    })
    it('should render incoming children', () => {
      expect(screen.getByText('test children')).toBeInTheDocument()
    })
    it('should render incoming contained button color style', () => {
      expect(screen.getByTestId('button-wrapper')).toHaveClass(
        'text-white bg-primary hover:bg-primary-dark',
      )
    })
    it('should render a enable button', () => {
      expect(screen.getByTestId('button-wrapper')).toBeEnabled()
    })
  })
  describe('disable Button status', () => {
    beforeEach(() => {
      render(
        <Button
          variant="outlined"
          size="small"
          disabled={true}
          fullWidth={true}
        >
          test children
        </Button>,
      )
    })
    it('should render a disabled button', () => {
      expect(screen.getByTestId('button-wrapper')).toBeDisabled()
    })
    it('should render full width size of button', () => {
      expect(screen.getByTestId('button-wrapper')).toHaveClass('w-full')
    })
  })
  describe('Button event', () => {
    let onClick = null
    beforeEach(() => {
      onClick = jest.fn()
      render(<Button onClick={onClick}>test children</Button>)
    })
    afterEach(() => {
      onClick = null
    })
    it('should execute incoming click function', () => {
      fireEvent.click(screen.getByTestId('button-wrapper'))
      expect(onClick).toHaveBeenCalledTimes(1)
    })
  })
})
