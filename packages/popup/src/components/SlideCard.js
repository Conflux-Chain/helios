import PropTypes from 'prop-types'
import {useClickAway} from 'react-use'
import {CloseCircleFilled} from '@fluent-wallet/component-icons'
import {useRef} from 'react'
import {useSlideAnimation} from '../hooks'
import {isRunningInSidePanel} from '../utils/side-panel'

function SlideCard({
  onClose,
  open = false,
  maskClosable = true,
  showClose = true,
  needAnimation = true,
  cardTitle,
  cardContent,
  cardFooter = null,
  id = '',
  containerClassName = '',
  cardClassName = '',
  width,
  height,
  backgroundColor = 'bg-bg',
  direction = 'vertical',
}) {
  const animateStyle = useSlideAnimation(open, direction, needAnimation)
  const inSidePanel = isRunningInSidePanel()
  width = width ?? (inSidePanel ? 'w-full' : 'w-93')
  height = height ?? (inSidePanel ? 'h-125 max-h-[80%]' : 'h-125')
  const ref = useRef(null)

  useClickAway(ref, e => {
    maskClosable && onClose && onClose(e)
  })

  if (!animateStyle) {
    return null
  }
  return (
    <div id={id} className={containerClassName}>
      <div
        className={`z-20 rounded-t-xl px-3 pt-4 pb-3 absolute bottom-0  bg-gray-circles bg-no-repeat bg-contain ${animateStyle} ${cardClassName} ${width} ${height} ${backgroundColor}`}
        ref={ref}
      >
        <div className="w-full h-full flex flex-col">
          <div>{cardTitle}</div>
          <div className="flex-1 overflow-y-auto no-scroll">{cardContent}</div>
          <div>{cardFooter}</div>
        </div>
        {showClose ? (
          <CloseCircleFilled
            onClick={onClose}
            className="w-6 h-6 text-[#ffffff33] cursor-pointer absolute -top-9 right-3 z-50"
          />
        ) : null}
      </div>
      <div
        className={`absolute inset-0 z-10 bg-black ${
          open && needAnimation
            ? 'animate-mask-fade-in opacity-60'
            : !open && needAnimation
            ? 'animate-mask-fade-out opacity-0'
            : 'opacity-60'
        }`}
      />
    </div>
  )
}

SlideCard.propTypes = {
  showClose: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  cardTitle: PropTypes.node,
  cardContent: PropTypes.node,
  cardFooter: PropTypes.node,
  id: PropTypes.string,
  containerClassName: PropTypes.string,
  cardClassName: PropTypes.string,
  width: PropTypes.string,
  height: PropTypes.string,
  backgroundColor: PropTypes.string,
  direction: PropTypes.string,
  maskClosable: PropTypes.bool,
  needAnimation: PropTypes.bool,
}
export default SlideCard
