import {render, screen, fireEvent} from '@testing-library/react'
import {describe, expect, jest} from '@jest/globals'
import Input from './index.js'

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
    render(<Input className="test-input" />)
    expect(screen.getByTestId('input-text')).toHaveClass('test-input')
  })
  it('should render incoming container class name on input', () => {
    render(<Input containerClassName="test-container" />)
    expect(screen.getByTestId('input-container')).toHaveClass('test-container')
  })
  it('should trigger the incoming onChange function', () => {
    const onChange = jest.fn()
    render(<Input onChange={onChange} />)
    fireEvent.change(screen.getByTestId('input-text'), {
      target: {value: 'value'},
    })
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('test incoming width class name', () => {
    render(<Input width="test-width" />)
    expect(screen.getByTestId('input-wrapper')).toHaveClass('test-width')
  })
  it('test incoming small size', () => {
    render(<Input size="small" />)
    expect(screen.getByTestId('input-container')).toHaveClass('h-8')
  })

  it('test incoming medium size', () => {
    render(<Input size="medium" />)
    expect(screen.getByTestId('input-container')).toHaveClass('h-10')
  })

  it('test incoming large size', () => {
    render(<Input size="large" />)
    expect(screen.getByTestId('input-container')).toHaveClass('h-12')
  })
  it('test incoming errorMessage', () => {
    render(<Input errorMessage="error message" />)
    expect(screen.getByText('error message')).toBeInTheDocument()
  })
  it('test incoming prefix', () => {
    render(<Input prefix="some label" />)
    expect(screen.getByText('some label')).toBeInTheDocument()
  })
  it('test incoming suffix', () => {
    render(<Input suffix="suffix" />)
    expect(screen.getByText('suffix')).toBeInTheDocument()
  })
  it('render disabled style', () => {
    render(<Input disabled={true} />)
    expect(screen.getByTestId('input-container')).toHaveClass(
      'bg-gray-10 cursor-not-allowed',
    )
  })
  it('render regular style', () => {
    render(<Input disabled={false} />)
    expect(screen.getByTestId('input-container')).toHaveClass('bg-gray-0')
  })
  it('test border style when passing false bordered param', () => {
    render(<Input bordered={false} />)
    expect(screen.getByTestId('input-container')).toHaveClass('border-0')
  })
  it('test border style when passing bordered param and errorMessage', () => {
    render(<Input errorMessage="err msg" bordered={true} />)
    expect(screen.getByTestId('input-container')).toHaveClass(
      'border-error border',
    )
  })
  it('test border style when passing bordered when focus and blur', () => {
    render(<Input bordered={true} />)
    fireEvent.focus(screen.getByTestId('input-text'))
    expect(screen.getByTestId('input-container')).toHaveClass('border-primary')
    fireEvent.blur(screen.getByTestId('input-text'))
    expect(screen.getByTestId('input-container')).toHaveClass('border-gray-20')
  })
  it('test incoming blur function', () => {
    const onBlur = jest.fn()
    render(<Input bordered={true} onBlur={onBlur} />)
    fireEvent.focus(screen.getByTestId('input-text'))
    fireEvent.blur(screen.getByTestId('input-text'))
    expect(onBlur).toHaveBeenCalledTimes(1)
  })
})
