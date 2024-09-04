import {render, screen, fireEvent, cleanup} from '@testing-library/react'
import {beforeEach, describe, expect, vi, it, afterEach} from 'vitest'
import Alert from './index.js'
beforeEach(cleanup)

describe('Alert', () => {
  describe('Dom structure', () => {
    let snapshot
    beforeEach(() => {
      snapshot = render(
        <Alert
          open={true}
          type="warning"
          closable={false}
          content="testValue"
          width="w-full"
        />,
      )
    })
    it('test snapshot', () => {
      expect(snapshot).toMatchSnapshot()
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
      onClose = vi.fn()
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
