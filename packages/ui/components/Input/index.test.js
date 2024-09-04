import {render, screen, fireEvent, cleanup} from '@testing-library/react'
import {describe, expect, vi, it, beforeEach} from 'vitest'
import Input from './index.js'

beforeEach(cleanup)
describe('Input', () => {
  it('test snapshot', () => {
    // eslint-disable-next-line testing-library/render-result-naming-convention
    const snapshot = render(<Input value="test value" />)
    expect(snapshot).toMatchSnapshot()
  })
  it('should render incoming value', () => {
    render(<Input value="test value" />)
    expect(screen.getByTestId('input-text')).toHaveValue('test value')
  })
  it('should render incoming class name on input', () => {
    render(<Input className="test-input" value="test value" />)
    expect(screen.getByTestId('input-text')).toHaveClass('test-input')
  })
  it('should render incoming container class name on input', () => {
    render(<Input containerClassName="test-container" value="test value" />)
    expect(screen.getByTestId('input-container')).toHaveClass('test-container')
  })
  it('should trigger the incoming onChange function', () => {
    const onChange = vi.fn()
    render(<Input onChange={onChange} value="test value" />)
    fireEvent.change(screen.getByTestId('input-text'), {
      target: {value: 'value'},
    })
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('test incoming width class name', () => {
    render(<Input width="test-width" value="test value" />)
    expect(screen.getByTestId('input-wrapper')).toHaveClass('test-width')
  })
  it('test incoming small size', () => {
    render(<Input size="small" value="test value" />)
    expect(screen.getByTestId('input-container')).toHaveClass('h-8')
  })

  it('test incoming medium size', () => {
    render(<Input size="medium" value="test value" />)
    expect(screen.getByTestId('input-container')).toHaveClass('h-10')
  })

  it('test incoming large size', () => {
    render(<Input size="large" value="test value" />)
    expect(screen.getByTestId('input-container')).toHaveClass('h-12')
  })
  it('test incoming errorMessage', () => {
    render(<Input errorMessage="error message" value="test value" />)
    expect(screen.getByText('error message')).toBeInTheDocument()
  })
  it('test incoming prefix', () => {
    render(<Input prefix="some label" value="test value" />)
    expect(screen.getByText('some label')).toBeInTheDocument()
  })
  it('test incoming suffix', () => {
    render(<Input suffix="suffix" value="test value" />)
    expect(screen.getByText('suffix')).toBeInTheDocument()
  })
  it('render disabled style', () => {
    render(<Input disabled={true} value="test value" />)
    expect(screen.getByTestId('input-container')).toHaveClass(
      'bg-gray-10 cursor-not-allowed',
    )
  })
  it('render regular style', () => {
    render(<Input disabled={false} value="test value" />)
    expect(screen.getByTestId('input-container')).toHaveClass('bg-gray-0')
  })
  it('test border style when passing false bordered param', () => {
    render(<Input bordered={false} value="test value" />)
    expect(screen.getByTestId('input-container')).toHaveClass('border-0')
  })
  it('test border style when passing bordered param and errorMessage', () => {
    render(<Input errorMessage="err msg" bordered={true} value="test value" />)
    expect(screen.getByTestId('input-container')).toHaveClass(
      'border-error border',
    )
  })
  it('test border style when passing bordered when focus and blur', () => {
    render(<Input bordered={true} value="test value" />)
    fireEvent.focus(screen.getByTestId('input-text'))
    expect(screen.getByTestId('input-container')).toHaveClass('border-primary')
    fireEvent.blur(screen.getByTestId('input-text'))
    expect(screen.getByTestId('input-container')).toHaveClass('border-gray-20')
  })
  it('test incoming blur function', () => {
    const onBlur = vi.fn()
    render(<Input bordered={true} onBlur={onBlur} value="test value" />)
    fireEvent.focus(screen.getByTestId('input-text'))
    fireEvent.blur(screen.getByTestId('input-text'))
    expect(onBlur).toHaveBeenCalledTimes(1)
  })
})
