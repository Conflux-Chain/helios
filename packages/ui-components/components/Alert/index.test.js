import React from 'react'
import testingLibrary from '@testing-library/react'
import {describe, expect, jest} from '@jest/globals'
import Alert from './index.js'
const {render, screen, fireEvent} = testingLibrary

describe('Alert', () => {
  describe('Dom structure', () => {
    beforeEach(() => {
      render(
        <Alert
          open={true}
          type="warning"
          closable={false}
          content="testValue"
          width="w-full"
        />,
      )
    })

    it('should render expected text content', () => {
      expect(screen.getByText('testValue')).toBeInTheDocument()
    })
    it('should render expected color', () => {
      expect(screen.getByTestId('alert-wrapper')).toHaveClass('bg-warning-10')
    })
    it('should render expected width', () => {
      expect(screen.getByTestId('alert-wrapper')).toHaveClass('bg-warning-10')
    })

    it('should not render close icon', () => {
      expect(screen.queryByTestId('alert-close')).not.toBeInTheDocument()
    })
  })

  describe('Dom event', () => {
    let onClose = null
    beforeEach(() => {
      onClose = jest.fn()
      render(
        <Alert
          open={true}
          type="warning"
          closable={true}
          content="testValue"
          width="w-full"
          onClose={onClose}
        />,
      )
    })
    afterEach(() => {
      onClose = null
    })
    it('should render close icon', () => {
      expect(screen.getByTestId('alert-close')).toBeInTheDocument()
    })
    it('should execute close function', () => {
      fireEvent.click(screen.getByTestId('alert-close'))
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })
})
