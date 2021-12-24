import React, {memo, forwardRef} from 'react'
import PropTypes from 'prop-types'
import {CSSTransition, SwitchTransition} from 'react-transition-group'
import classNames from 'classnames'
import './index.css'

const Text = forwardRef(
  (
    {
      as = 'span',
      className,
      style,
      placeholder = 'loading...',
      skeleton = false,
      text,
    },
    ref,
  ) => {
    return React.createElement(
      as,
      {
        ref,
        className,
        style,
      },
      <SwitchTransition>
        <CSSTransition
          key={text || placeholder || 'text_loading'}
          classNames={{
            enter:
              !!skeleton && !text
                ? classNames(
                    'text-transition-skeleton-enter bg-red',
                    'bg-z-skeleton',
                    skeleton,
                  )
                : 'text-transition-blur-enter',
            enterActive:
              !!skeleton && !text
                ? classNames(
                    'text-transition-skeleton-enter-active',
                    'bg-z-skeleton',
                    skeleton,
                  )
                : 'text-transition-blur-enter-active',
            enterDone:
              !!skeleton && !text
                ? classNames(
                    'text-transition-skeleton-enter-done',
                    'bg-z-skeleton',
                    skeleton,
                  )
                : 'text-transition-blur-enter-done',
            exit: 'text-transition-blur-exit',
            exitActive: 'text-transition-blur-exit-active',
            exitDone: 'text-transition-blur-exit-done',
          }}
          timeout={{enter: 200, exit: 100}}
          appear={!!skeleton}
        >
          <span style={{color: !!skeleton && !text ? 'transparent' : ''}}>
            {text || placeholder}
          </span>
        </CSSTransition>
      </SwitchTransition>,
    )
  },
)

Text.displayName = 'Text'

Text.propTypes = {
  as: PropTypes.oneOf(['span', 'p', 'div']),
  className: PropTypes.string,
  style: PropTypes.object,
  placeholder: PropTypes.string,
  text: PropTypes.string,
  skeleton: PropTypes.oneOf([PropTypes.bool, PropTypes.string]),
}

export default memo(Text)
