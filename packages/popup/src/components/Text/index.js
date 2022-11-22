import React, {useEffect, useState, memo, forwardRef, useRef} from 'react'
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
 *   delay?: number; // After the delay(ms, default - 0) time is still in the loading state, only then will the animation appear.If the delay value is less than 100, it will be ignored.
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
      placeholderAnimation = false,
      skeleton = false,
      delay = 700,
      className,
      ...otherProps
    },
    ref,
  ) => {
    const [inDelay, setInDelay] = useState(() => !text && delay > 100)
    const textNodeRef = useRef(null)
    useEffect(() => {
      if (!text && delay > 100) setInDelay(true)
      else setInDelay(false)
      const timer = setTimeout(() => setInDelay(false), delay)
      return () => clearTimeout(timer)
    }, [text, delay])

    if (inDelay)
      return React.createElement(
        as,
        {
          ref,
          className: classNames(className, 'opacity-0'),
          ...otherProps,
        },
        placeholder,
      )

    return React.createElement(
      as,
      {
        ref,
        className,
        ...otherProps,
      },
      <SwitchTransition>
        <CSSTransition
          key={text || placeholder || 'text_loading'}
          nodeRef={textNodeRef}
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
            ref={textNodeRef}
            className={classNames(
              {
                'text-placeholder-animation':
                  !text && placeholderAnimation && !skeleton,
                'text-transparent': !!skeleton && !text,
              },
              'transition-opacity',
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
  text: PropTypes.oneOfType(PropTypes.node, PropTypes.string),
  skeleton: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  delay: PropTypes.number,
  className: PropTypes.string,
}

export default memo(Text)
