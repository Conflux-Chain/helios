import React from 'react'
import testingLibrary from '@testing-library/react'
import {describe, expect, jest} from '@jest/globals'
import Link from './index.js'
const {render, screen, fireEvent} = testingLibrary

describe('Link', () => {
  it('should render class name', () => {
    render(<Link className="test-class">text</Link>)
    expect(screen.getByTestId('link-wrapper')).toHaveClass('test-class')
  })

  it('test incoming small size', () => {
    render(<Link size="small">text</Link>)
    expect(screen.getByTestId('link-wrapper')).toHaveClass('text-xs')
  })
  it('test incoming medium size', () => {
    render(<Link size="medium">text</Link>)
    expect(screen.getByTestId('link-wrapper')).toHaveClass('text-sm')
  })
  it('test incoming large size', () => {
    render(<Link size="large">text</Link>)
    expect(screen.getByTestId('link-wrapper')).toHaveClass('text-base')
  })
  it('test disabled', () => {
    const onClick = jest.fn()
    render(
      <Link
        disabled={true}
        onClick={onClick}
        startIcon={<div data-testid="start" />}
        endIcon={<div data-testid="end" />}
      >
        text
      </Link>,
    )
    // style
    expect(screen.getByTestId('link-wrapper')).toHaveClass(
      'bg-transparent text-gray-40 cursor-not-allowed',
    )

    // iconColor
    expect(screen.getByTestId('start')).toHaveClass('text-gray-40')
    expect(screen.getByTestId('end')).toHaveClass('text-gray-40')

    // event
    fireEvent.click(screen.getByTestId('link-wrapper'))
    expect(onClick).toHaveBeenCalledTimes(0)
  })
  it('test incoming click', () => {
    const onClick = jest.fn()
    render(<Link onClick={onClick}>text</Link>)

    fireEvent.click(screen.getByTestId('link-wrapper'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
