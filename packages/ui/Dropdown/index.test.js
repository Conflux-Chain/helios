/* eslint-disable testing-library/await-async-utils */
import React from 'react'
import testingLibrary from '@testing-library/react'
import {describe, expect} from '@jest/globals'
import Dropdown from './index.js'
const {render, screen, fireEvent, waitFor} = testingLibrary

describe('Dropdown', () => {
  it('test snapshot', () => {
    // eslint-disable-next-line testing-library/render-result-naming-convention
    const snapshot = render(
      <Dropdown overlay={<div>test menu</div>}>
        <span>test content</span>
      </Dropdown>,
    )
    expect(snapshot).toMatchSnapshot()
  })
  it('should render content', () => {
    render(
      <Dropdown overlay={<div>test menu</div>}>
        <span>test content</span>
      </Dropdown>,
    )
    expect(screen.getByText('test content')).toBeInTheDocument()
  })

  it('should not render menu', () => {
    render(
      <Dropdown overlay={<div>test menu</div>} disabled={true}>
        <span>test content</span>
      </Dropdown>,
    )
    expect(screen.queryByText('test menu')).not.toBeInTheDocument()
  })

  it('should render menu when trigger component', () => {
    render(
      <Dropdown overlay={<div>test menu</div>} trigger={['click']}>
        <span>test content</span>
      </Dropdown>,
    )
    fireEvent.click(screen.getByTestId('dropdown-wrapper'))
    waitFor(() => {
      expect(screen.getByText('test menu')).toBeInTheDocument()
    })
  })

  it('should place menu with incoming position', () => {
    render(
      <Dropdown overlay={<div>test menu</div>} placement="bottomCenter">
        <span>test content</span>
      </Dropdown>,
    )
    fireEvent.click(screen.getByTestId('dropdown-wrapper'))
    waitFor(() => {
      expect(screen.getByText('test menu')).toHaveClass(
        'rc-dropdown-placement-bottomCenter',
      )
    })
  })
})
