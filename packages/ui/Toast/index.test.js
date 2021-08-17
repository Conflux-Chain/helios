import React from 'react'
import testingLibrary from '@testing-library/react'
import {describe, expect, jest, beforeEach, afterEach} from '@jest/globals'
import Toast from './index.js'
const {render, screen} = testingLibrary

describe('Tag', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })
  afterEach(() => {
    jest.useRealTimers()
  })
  it('test snapshot', () => {
    // eslint-disable-next-line testing-library/render-result-naming-convention
    const snapshot = render(<Toast type="block" open={true} />)
    expect(snapshot).toMatchSnapshot()
  })
  it('test block type', () => {
    render(<Toast type="block" open={true} />)
    expect(screen.getByTestId('block-toast-wrapper')).toBeInTheDocument()
  })
  it('test line type', () => {
    render(<Toast type="line" open={true} />)
    expect(screen.getByTestId('line-toast-wrapper')).toBeInTheDocument()
  })
  it('test default type', () => {
    render(<Toast open={true} />)
    expect(screen.getByTestId('block-toast-wrapper')).toBeInTheDocument()
  })
  it('test open is false', () => {
    render(<Toast />)
    expect(screen.queryByTestId('block-toast-wrapper')).not.toBeInTheDocument()
  })
  it('test open is true', () => {
    render(<Toast open={true} />)
    expect(screen.getByTestId('block-toast-wrapper')).toBeInTheDocument()
  })
  it('test class name', () => {
    render(<Toast className="test-class-name" open={true} />)
    expect(screen.getByTestId('block-toast-wrapper')).toHaveClass(
      'test-class-name',
    )
  })
  it('test icon', () => {
    render(<Toast icon={<div data-testid="icon" />} open={true} />)
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('test title', () => {
    render(<Toast type="block" open={true} title="test-title" />)
    expect(screen.getByText('test-title')).toBeInTheDocument()
  })
  it('test content', () => {
    render(<Toast open={true} content="test-content" />)
    expect(screen.getByText('test-content')).toBeInTheDocument()
  })
  it('test onClose', async () => {
    const onClose = jest.fn()
    render(<Toast open={true} content="test-content" onClose={onClose} />)
    jest.advanceTimersByTime(2000)
    expect(onClose).toHaveBeenCalledTimes(1)
  })
  it('test autoHideDuration', async () => {
    const onClose = jest.fn()
    render(
      <Toast
        open={true}
        content="test-content"
        onClose={onClose}
        autoHideDuration={3000}
      />,
    )
    jest.advanceTimersByTime(3000)
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
