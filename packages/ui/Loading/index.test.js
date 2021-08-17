import React from 'react'
import testingLibrary from '@testing-library/react'
import Loading from './index.js'
import {describe, expect} from '@jest/globals'
const {render, screen} = testingLibrary

describe('Loading', () => {
  it('test snapshot', () => {
    // eslint-disable-next-line testing-library/render-result-naming-convention
    const snapshot = render(<Loading className="test-loading" />)
    expect(snapshot).toMatchSnapshot()
  })
  it('should render incoming class name', () => {
    render(<Loading className="test-loading" />)
    expect(screen.getByTestId('loading-wrapper')).toHaveClass('test-loading')
  })
})
