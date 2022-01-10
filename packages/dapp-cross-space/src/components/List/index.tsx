import {cloneElement, CSSProperties, HTMLAttributes, useRef} from 'react'
import {a, useTransition} from '@react-spring/web'
import classNames from 'clsx'
import {transitionAnimation, TransitionAnimationType} from '../Animation'

export interface ItemProps {
  key: string | number
  animationType?: TransitionAnimationType
  animationDuration?: number | {enter: number; leave: number}
  ItemWrapperClassName?: string
  ItemWrapperStyle?: CSSProperties
}

export type Props<T> = OverWrite<
  HTMLAttributes<HTMLDivElement>,
  {
    list: T[]
    children: (item: T, index: number) => JSX.Element
    animatedHeight?: boolean
    animationType?: TransitionAnimationType
    animationDuration?: number | {enter: number; leave: number}
    ItemWrapperClassName?: string
    ItemWrapperStyle?: CSSProperties
  }
>

const List = <T extends ItemProps>({
  list,
  children,
  animatedHeight,
  animationType = 'zoom',
  animationDuration,
  ItemWrapperClassName,
  ItemWrapperStyle,
  ...props
}: Props<T>) => {
  const heightMap = useRef(new WeakMap())
  const render = useTransition(list, {
    keys: (item: T) => item.key,
    from: (item: T) => ({
      ...transitionAnimation[item?.animationType ?? animationType].from,
      height: animatedHeight ? 0 : undefined,
    }),
    enter: (item: T) => async next =>
      await next({
        ...transitionAnimation[item?.animationType ?? animationType].enter,
        height: animatedHeight ? heightMap.current.get(item) : undefined,
        config: {
          ...transitionAnimation[item?.animationType ?? animationType].enter
            ?.config,
          duration:
            typeof (item?.animationDuration ?? animationDuration) === 'object'
              ? ((item?.animationDuration ?? animationDuration) as {
                  enter: number
                  leave: number
                })?.enter
              : item?.animationDuration ?? animationDuration,
        },
      }),
    leave: (item: T) => ({
      ...transitionAnimation[item?.animationType ?? animationType].leave,
      height: animatedHeight ? 0 : undefined,
      margin: 0,
      overflow: 'hidden',
      config: {
        ...transitionAnimation[item?.animationType ?? animationType].leave
          ?.config,
        duration:
          typeof (item?.animationDuration ?? animationDuration) === 'object'
            ? ((item?.animationDuration ?? animationDuration) as {
                enter: number
                leave: number
              })?.leave
            : item?.animationDuration ?? animationDuration,
      },
    }),
  })

  return (
    <div {...props}>
      {render((style, item, _, index) => (
        <a.div
          className={classNames(
            'w-fit bg-transparent origin-center overflow-visible backface-visible will-change-transform',
            item?.ItemWrapperClassName ?? ItemWrapperClassName,
          )}
          style={{...(item?.ItemWrapperStyle ?? ItemWrapperStyle), ...style}}
        >
          {animatedHeight ? (
            <a.div
              className="w-fit will-change-[height]"
              ref={(r: HTMLDivElement) =>
                heightMap.current?.set(item, r?.offsetHeight)
              }
            >
              {cloneElement(children(item, index))}
            </a.div>
          ) : (
            cloneElement(children(item, index))
          )}
        </a.div>
      ))}
    </div>
  )
}

export default List
