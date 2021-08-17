/* eslint-disable testing-library/no-node-access */
import React from 'react'
import testingLibrary from '@testing-library/react'
import {describe, expect, jest} from '@jest/globals'
import Tooltip from './index.js'
const {render, screen, waitFor, fireEvent} = testingLibrary

describe('Tooltip', () => {
  describe('shows and hides itself on hover', () => {
    it('should show tooltip-content at the beginning', () => {
      render(
        <Tooltip content={<div data-testid="tooltip-content" />} visible={true}>
          children
        </Tooltip>,
      )
      expect(screen.getByTestId('tooltip-content')).toBeInTheDocument()
    })
    it('should not show tooltip-content at the beginning', () => {
      render(
        <Tooltip content={<div data-testid="tooltip-content" />}>
          children
        </Tooltip>,
      )
      expect(screen.queryByTestId('tooltip-content')).not.toBeInTheDocument()
    })
    it('should show content when hover children', async () => {
      render(
        <Tooltip content={<div data-testid="tooltip-content" />}>
          <a href="#test" data-testid="test-children">
            children
          </a>
        </Tooltip>,
      )
      expect(screen.getByTestId('test-children')).toBeInTheDocument()
      fireEvent.mouseOver(screen.getByTestId('test-children'))
      await waitFor(() => {
        expect(screen.getByTestId('tooltip-content')).toBeInTheDocument()
      })
    })
    it('should call onVisibleChange', async () => {
      const onVisibleChange = jest.fn()
      render(
        <Tooltip
          onVisibleChange={onVisibleChange}
          content={<div data-testid="tooltip-content" />}
        >
          <a href="#test" data-testid="test-children">
            children
          </a>
        </Tooltip>,
      )
      fireEvent.mouseOver(screen.getByTestId('test-children'))
      await waitFor(() => {
        expect(onVisibleChange).toHaveBeenCalledTimes(1)
      })
    })
    it('test openClassName', async () => {
      render(
        <Tooltip
          openClassName="test-open-class"
          content={<div data-testid="tooltip-content" />}
        >
          <a href="#test" data-testid="test-children">
            children
          </a>
        </Tooltip>,
      )
      fireEvent.mouseOver(screen.getByTestId('test-children'))
      await waitFor(() => {
        expect(screen.getByTestId('test-children')).toHaveClass(
          'test-open-class',
        )
      })
    })
    it('test overlayClassName', () => {
      render(
        <Tooltip
          overlayClassName="test-overlay-class"
          content={<div data-testid="tooltip-content" />}
          visible={true}
        >
          <a href="#test">children</a>
        </Tooltip>,
      )
      const tooltipContainer = document.querySelector('.tooltip')
      expect(tooltipContainer).toHaveClass('test-overlay-class')
    })
    it('test overlayInnerStyle', () => {
      render(
        <Tooltip
          overlayClassName="test-overlay-class"
          content={<div data-testid="tooltip-content" />}
          visible={true}
          overlayInnerStyle={{background: 'red'}}
        >
          <a href="#test">children</a>
        </Tooltip>,
      )
      const tooltipInner = document.querySelector('.tooltip-inner')
      expect(tooltipInner).toHaveStyle('background-color: red')
    })

    it('test prefixCls', async () => {
      render(
        <Tooltip
          prefixCls="test-prefix-class"
          content={<div data-testid="tooltip-content" />}
        >
          <a href="#test" data-testid="test-children">
            children
          </a>
        </Tooltip>,
      )
      fireEvent.mouseOver(screen.getByTestId('test-children'))
      await waitFor(() => {
        expect(screen.getByTestId('test-children')).toHaveClass(
          'test-prefix-class-open',
        )
      })
    })
  })
})
