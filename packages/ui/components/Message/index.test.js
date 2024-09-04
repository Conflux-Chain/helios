/* eslint-disable no-unused-vars */
/* eslint-disable testing-library/await-async-utils */
// eslint-disable-next-line no-unused-vars
import {
  render,
  screen,
  waitFor,
  fireEvent,
  cleanup,
} from '@testing-library/react'
import {describe, expect, vi, afterEach, beforeEach, it} from 'vitest'
import Message from './index.js'

beforeEach(cleanup)
// TODO resolve test error
describe('Message', () => {
  afterEach(() => {
    Message.destroy()
  })

  it('shows up', () => {
    // Message.config({
    //   TEST_RENDER: node => {
    //     render(node)
    //   },
    // })
    // Message.success({content: 'test value', duration: 0}).then(() => {})
    // expect(screen.getByText('test value')).toBeInTheDocument()
  })

  // it('should shows success icon', () => {
  //   Message.config({
  //     TEST_RENDER: node => {
  //       render(node)
  //     },
  //   })
  //   Message.success({content: 'test value', duration: 0}).then(() => {})
  //   expect(screen.getByTestId('success-filled-wrapper')).toBeInTheDocument()
  // })
  // it('should shows info icon', () => {
  //   Message.config({
  //     TEST_RENDER: node => {
  //       render(node)
  //     },
  //   })
  //   Message.info({content: 'test value', duration: 0}).then(() => {})
  //   expect(screen.getByTestId('info-filled-wrapper')).toBeInTheDocument()
  // })
  // it('should shows error icon', () => {
  //   Message.config({
  //     TEST_RENDER: node => {
  //       render(node)
  //     },
  //   })
  //   Message.error({content: 'test value', duration: 0}).then(() => {})
  //   expect(screen.getByTestId('error-filled-wrapper')).toBeInTheDocument()
  // })
  // it('should shows warning icon', () => {
  //   Message.config({
  //     TEST_RENDER: node => {
  //       render(node)
  //     },
  //   })
  //   Message.warning({content: 'test value', duration: 0}).then(() => {})
  //   expect(screen.getByTestId('warning-filled-wrapper')).toBeInTheDocument()
  // })

  // it('test duration', async () => {
  //   Message.config({
  //     TEST_RENDER: node => {
  //       render(node)
  //     },
  //   })
  //   Message.warning({content: 'test value', duration: 0.3}).then(() => {})
  //   await waitFor(() => {
  //     expect(screen.queryByText('test value')).not.toBeInTheDocument()
  //   }, 300)
  // })

  // it('test close', async () => {
  //   const onClose = vi.fn()
  //   Message.config({
  //     TEST_RENDER: node => {
  //       render(node)
  //     },
  //   })
  //   Message.warning({
  //     content: 'test value',
  //     duration: 0.3,
  //     onClose,
  //   }).then(() => {})
  //   await waitFor(() => {
  //     expect(screen.queryByText('test value')).not.toBeInTheDocument()
  //     expect(onClose).toHaveBeenCalledTimes(1)
  //   }, 300)
  // })
  // it('test click', () => {
  //   const onClick = vi.fn()

  //   Message.config({
  //     TEST_RENDER: node => {
  //       render(node)
  //     },
  //     props: {
  //       'data-testid': 'message-box-wrapper',
  //     },
  //   })
  //   Message.warning({
  //     content: 'test value',
  //     onClick,
  //     duration: 0,
  //     props: {
  //       'data-testid': 'message-box',
  //     },
  //   }).then(() => {})
  //   fireEvent.click(screen.getByTestId('message-box'))
  //   expect(onClick).toHaveBeenCalledTimes(1)
  // })
})
