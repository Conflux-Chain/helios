/* eslint-disable testing-library/await-async-utils */
// eslint-disable-next-line no-unused-vars

import {render, screen, fireEvent, cleanup} from '@testing-library/react'
import {beforeEach, describe, expect, vi, it} from 'vitest'
import Modal from './index.js'
beforeEach(cleanup)

describe('Modal', () => {
  it('test snapshot', () => {
    // eslint-disable-next-line testing-library/render-result-naming-convention
    const snapshot = render(<Modal content="content" open={true} />)
    expect(snapshot).toMatchSnapshot()
  })
  it('should show modal', () => {
    render(<Modal content="content" open={true} />)
    expect(screen.getByTestId('modal-wrapper')).toBeInTheDocument()
  })
  it('should not render modal', () => {
    render(<Modal content="content" open={false} />)
    expect(screen.queryByTestId('modal-wrapper')).not.toBeInTheDocument()
  })
  it('should render incoming class name', () => {
    render(<Modal content="content" open={true} className="test-class-name" />)
    expect(screen.getByTestId('modal-content')).toHaveClass('test-class-name')
  })
  it('should render small size', () => {
    render(<Modal content="content" open={true} size="small" />)
    expect(screen.getByTestId('modal-content')).toHaveClass('w-full md:w-70')
  })
  it('should render medium size', () => {
    render(<Modal content="content" open={true} size="medium" />)
    expect(screen.getByTestId('modal-content')).toHaveClass('w-full md:w-80')
  })
  it('should render large size', () => {
    render(<Modal content="content" open={true} size="large" />)
    expect(screen.getByTestId('modal-content')).toHaveClass('w-full md:w-110')
  })
  it('should render incoming width', () => {
    render(<Modal content="content" open={true} width="test-width" />)
    expect(screen.getByTestId('modal-content')).toHaveClass('test-width')
  })
  it('should render title', () => {
    render(<Modal content="content" open={true} title="test-title" />)
    expect(screen.getByText('test-title')).toBeInTheDocument()
  })
  it('should show close icon', () => {
    render(<Modal content="content" open={true} closable={true} />)
    expect(screen.getByTestId('modal-close-wrapper')).toBeInTheDocument()
  })
  it('passing icon', () => {
    render(
      <Modal
        content="content"
        open={true}
        icon={<div data-testid="test-icon" />}
      />,
    )
    expect(screen.getByTestId('test-icon')).toBeInTheDocument()
  })
  it('passing closeIcon', () => {
    render(
      <Modal
        content="content"
        open={true}
        closeIcon={<div data-testid="test-close-icon" />}
      />,
    )
    expect(screen.getByTestId('test-close-icon')).toBeInTheDocument()
  })
  it('click close icon', () => {
    const onClose = vi.fn()
    render(
      <Modal content="content" open={true} closable={true} onClose={onClose} />,
    )
    fireEvent.click(screen.getByTestId('modal-close-wrapper'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
  it('trigger clicks outside the Modal', () => {
    const onClose = vi.fn()
    render(
      <div>
        <div data-testid="outside-element">some other element</div>
        <Modal
          content="content"
          open={true}
          closable={false}
          onClose={onClose}
        />
        ,
      </div>,
    )
    fireEvent.mouseDown(screen.getByTestId('outside-element'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
