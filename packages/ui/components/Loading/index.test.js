import {render, screen, cleanup} from '@testing-library/react'
import Loading from './index.js'
import {beforeEach, describe, expect, it} from 'vitest'

beforeEach(cleanup)
describe('Loading', () => {
  it('test snapshot', () => {
    const snapshot = render(<Loading className="test-loading" />)
    expect(snapshot).toMatchSnapshot()
  })
  it('should render incoming class name', () => {
    render(<Loading className="test-loading" />)
    expect(screen.getByTestId('loading-wrapper')).toHaveClass('test-loading')
  })
})
