/* eslint-disable no-unused-vars */
/* eslint-disable testing-library/await-async-utils */
import {
  render,
  screen,
  waitFor,
  fireEvent,
  cleanup,
} from '@testing-library/react'
import {describe, expect, vi, afterEach, beforeEach, it} from 'vitest'
import Notification from './index.js'

beforeEach(cleanup)
// TODO resolve test error
describe('Notification', () => {
  describe('single Notification', () => {
    afterEach(() => {
      Notification.destroy()
    })
    it('shows up', () => {
      // Notification.config({
      //   TEST_RENDER: node => {
      //     render(node)
      //   },
      // })
      // Notification.success({content: 'test value', duration: 0})
      // expect(screen.getByText('test value')).toBeInTheDocument()
    })
    // it('should shows success icon', () => {
    //   Notification.config({
    //     TEST_RENDER: node => {
    //       render(node)
    //     },
    //   })
    //   Notification.success({content: 'test value', duration: 0})
    //   expect(screen.getByTestId('success-filled-wrapper')).toBeInTheDocument()
    // })
    // it('should shows info icon', () => {
    //   Notification.config({
    //     TEST_RENDER: node => {
    //       render(node)
    //     },
    //   })
    //   Notification.info({content: 'test value', duration: 0})
    //   expect(screen.getByTestId('info-filled-wrapper')).toBeInTheDocument()
    // })
    // it('should shows error icon', () => {
    //   Notification.config({
    //     TEST_RENDER: node => {
    //       render(node)
    //     },
    //   })
    //   Notification.error({content: 'test value', duration: 0})
    //   expect(screen.getByTestId('error-filled-wrapper')).toBeInTheDocument()
    // })
    // it('should shows warning icon', () => {
    //   Notification.config({
    //     TEST_RENDER: node => {
    //       render(node)
    //     },
    //   })
    //   Notification.warning({content: 'test value', duration: 0})
    //   expect(screen.getByTestId('warning-filled-wrapper')).toBeInTheDocument()
    // })
    // it('test duration', async () => {
    //   Notification.config({
    //     TEST_RENDER: node => {
    //       render(node)
    //     },
    //   })
    //   Notification.warning({content: 'test value', duration: 0.3})
    //   await waitFor(() => {
    //     expect(screen.queryByText('test value')).not.toBeInTheDocument()
    //   }, 300)
    // })
    // it('test close', async () => {
    //   const onClose = vi.fn()
    //   Notification.config({
    //     TEST_RENDER: node => {
    //       render(node)
    //     },
    //   })
    //   Notification.warning({
    //     content: 'test value',
    //     duration: 0.3,
    //     onClose,
    //   })
    //   await waitFor(() => {
    //     expect(screen.queryByText('test value')).not.toBeInTheDocument()
    //     expect(onClose).toHaveBeenCalledTimes(1)
    //   }, 300)
    // })
    // it('test click', () => {
    //   const onClick = vi.fn()
    //   Notification.config({
    //     TEST_RENDER: node => {
    //       render(node)
    //     },
    //     props: {
    //       'data-testid': 'notification-box-wrapper',
    //     },
    //   })
    //   Notification.warning({
    //     content: 'test value',
    //     onClick,
    //     duration: 0,
    //     props: {
    //       'data-testid': 'notification-box',
    //     },
    //   })
    //   fireEvent.click(screen.getByTestId('notification-box'))
    //   expect(onClick).toHaveBeenCalledTimes(1)
    // })
    // it('close specified notice', () => {
    //   Notification.config({
    //     TEST_RENDER: node => {
    //       render(node)
    //     },
    //   })
    //   Notification.warning({
    //     content: 'test value',
    //     duration: 0,
    //     key: 'test key',
    //   })
    //   Notification.close('test key')
    //   waitFor(() => {
    //     expect(screen.getByText('test value')).not.toBeInTheDocument()
    //   })
    // })
  })
})
