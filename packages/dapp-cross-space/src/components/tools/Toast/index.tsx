import React, {memo} from 'react'
import {useSpring, a} from '@react-spring/web'
import {PopupClass} from '../../Popup'

const Toast = new PopupClass()
Toast.setListStyle({
  top: 'unset',
  left: 'unset',
  transform: 'unset',
  right: '12px',
  bottom: '6px',
  flexDirection: 'column-reverse',
})

const ToastComponent: React.FC<{text: string; duration: number}> = memo(
  ({text, duration}) => {
    const props = useSpring({
      from: {transform: 'translateX(-100%)'},
      to: {transform: 'translateX(0)'},
      config: {duration: 6000},
    })

    return (
      <div className="relative flex justify-center items-center min-w-[240px] h-[40px] px-[32px] bg-[#445159] text-white rounded overflow-hidden">
        {text}
        {duration ? (
          <a.div
            className="absolute bottom-0 w-full h-[4px] bg-gradient-to-l from-[#15C184] to-[#2959B4]"
            style={props}
          />
        ) : null}
      </div>
    )
  },
)

const showToast = (text: string, config?: any) =>
  Toast.show({
    Content: <ToastComponent text={text} duration={config?.duration ?? 6000} />,
    duration: 6000,
    ...config,
  })

export const hideToast = Toast.hide
export default showToast
