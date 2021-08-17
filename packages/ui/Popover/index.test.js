import React from 'react'
import testingLibrary from '@testing-library/react'
import {describe, expect} from '@jest/globals'
import Popover from './index.js'
const {render, screen, waitFor, fireEvent} = testingLibrary

describe('Popover', () => {
  it('test snapshot', () => {
    // eslint-disable-next-line testing-library/render-result-naming-convention
    const snapshot = render(
      <Popover content={<div data-testid="popover-content" />}>
        <a href="#test" data-testid="test-children">
          children
        </a>
      </Popover>,
    )
    expect(snapshot).toMatchSnapshot()
  })
  it('should render content', async () => {
    render(
      <Popover content={<div data-testid="popover-content" />}>
        <a href="#test" data-testid="test-children">
          children
        </a>
      </Popover>,
    )
    fireEvent.mouseOver(screen.getByTestId('test-children'))
    await waitFor(() => {
      expect(screen.getByTestId('popover-content')).toBeInTheDocument()
    })
  })

  it('should render title', async () => {
    render(
      <Popover content={<div />} title="test-title">
        <a href="#test" data-testid="test-children">
          children
        </a>
      </Popover>,
    )
    fireEvent.mouseOver(screen.getByTestId('test-children'))
    await waitFor(() => {
      expect(screen.getByText('test-title')).toBeInTheDocument()
    })
  })
  it('test prefix class', async () => {
    render(
      <Popover
        content={<div data-testid="popover-content" />}
        prefixCls="test-prefix-class"
      >
        <a href="#test" data-testid="test-children">
          children
        </a>
      </Popover>,
    )
    fireEvent.mouseOver(screen.getByTestId('test-children'))
    await waitFor(() => {
      expect(screen.getByTestId('test-children')).toHaveClass(
        'test-prefix-class-open',
      )
    })
  })

  it('test default prefix class', async () => {
    render(
      <Popover content={<div data-testid="popover-content" />}>
        <a href="#test" data-testid="test-children">
          children
        </a>
      </Popover>,
    )
    fireEvent.mouseOver(screen.getByTestId('test-children'))
    await waitFor(() => {
      expect(screen.getByTestId('test-children')).toHaveClass('popover-open')
    })
  })
})
