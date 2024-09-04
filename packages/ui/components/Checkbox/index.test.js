import {render, screen, fireEvent, cleanup} from '@testing-library/react'
import {beforeEach, describe, expect, vi, it} from 'vitest'
import Checkbox from './index.js'
beforeEach(cleanup)
describe('Checkbox', () => {
  it('test snapshot', () => {
    // eslint-disable-next-line testing-library/render-result-naming-convention
    const snapshot = render(<Checkbox checked={true}>test children</Checkbox>)
    expect(snapshot).toMatchSnapshot()
  })
  it('should render checked SVG', () => {
    render(<Checkbox checked={true}>test children</Checkbox>)
    expect(screen.getByTestId('checked-svg')).toBeInTheDocument()
  })

  it('should render  non-checked SVG', () => {
    render(<Checkbox checked={false}>test children</Checkbox>)
    expect(screen.getByTestId('non-checked-svg')).toBeInTheDocument()
  })
  it('should render incoming class name', () => {
    render(
      <Checkbox checked={false} className="test-class-name">
        test children
      </Checkbox>,
    )
    expect(screen.getByTestId('checkbox-wrapper')).toHaveClass(
      'test-class-name',
    )
  })

  it('should execute incoming onChange function', () => {
    const onChange = vi.fn()
    render(<Checkbox onChange={onChange}>test children</Checkbox>)
    fireEvent.click(screen.getByTestId('checkbox-wrapper'))
    expect(onChange).toHaveBeenCalledTimes(1)
  })
})
