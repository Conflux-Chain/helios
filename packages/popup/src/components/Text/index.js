import React, {memo, forwardRef} from 'react'
import PropTypes from 'prop-types'
import {CSSTransition, SwitchTransition} from 'react-transition-group'
import classNames from 'classnames'
import './index.css'

/**
 * A component to better display text content with transitions and skeleton effects.
 * When the 'text' property is changed, it displays the transition effect.
 *
 * When should you use it?
 * 1. When it is necessary to keep the text content at a height so that the process of changing it from nothing to something does not affect the layout change.
 * 2. When important text content changes, the user's attention needs to be focused to prompt them.
 *
 * When you shouldn't use it?
 * Those scenarios where the text content will change frequently in a short period of time, such as the balance.
 * Frequent transition animations will distract the user's attention.
 *
 * When to use skeleton?
 * 1. Multiple items of similar structure, such as list.
 * 2. Especially if these items occupy most of the view.
 *
 * @props {{
 *   text: string; // Use like this: <span>{text}</span> -> <Text text={text} />
 *   as?: 'span'(default) | 'p' | 'div' ...; // Render as whice type DOM element.
 *   placeholder?: string(default 'loading'); // Placeholder content displayed when text === ''
 *   placeholderAnimation?: boolean(default true); // Whether the placeholder text shows the fill animation or not
 *   skeleton?: boolean | string; // When set to true, a skeleton will be displayed to cover the placeholder.It can also be set to a string as className.
 *   ...otherNativeDOMProps
 * }}
 *
 * @example basic usage
 * <Text text={xx} className="xxxx" style="xxxxx"/>
 *
 * @example change placeholder
 * <Text text={xx} placeholder="in loading..."/>
 *
 * @example use skeleton
 * <Text text={xx} skeleton />
 *
 * @example custom skeleton color and width
 * <Text text={xx} skeleton="bg-red-200 min-w-[10rem]" />
 */
const Text = forwardRef(
  (
    {
      as = 'span',
      text,
      placeholder = 'loading...',
      placeholderAnimation = true,
      skeleton = false,
      ...otherProps
    },
    ref,
  ) => {
    return React.createElement(
      as,
      {
        ref,
        ...otherProps,
      },
      <SwitchTransition>
        <CSSTransition
          key={text || placeholder || 'text_loading'}
          classNames={{
            enter:
              !!skeleton && !text
                ? classNames(
                    'text-transition-skeleton-enter',
                    'bg-z-skeleton inline-block',
                    skeleton,
                  )
                : 'text-transition-blur-enter',
            enterActive:
              !!skeleton && !text
                ? classNames(
                    'text-transition-skeleton-enter-active',
                    'bg-z-skeleton inline-block',
                    skeleton,
                  )
                : 'text-transition-blur-enter-active',
            enterDone:
              !!skeleton && !text
                ? classNames(
                    'text-transition-skeleton-enter-done',
                    'bg-z-skeleton inline-block',
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
          <span
            className={classNames(
              !text &&
                placeholderAnimation &&
                !skeleton &&
                'text-placeholder-animation',
              !!skeleton && !text && 'text-transparent',
            )}
            data-placeholder={placeholder}
          >
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
  placeholder: PropTypes.string,
  placeholderAnimation: PropTypes.bool,
  text: PropTypes.string,
  skeleton: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
}

export default memo(Text)
