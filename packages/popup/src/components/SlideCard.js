import PropTypes from 'prop-types'
import {useClickAway} from 'react-use'
import {CloseOutlined} from '@fluent-wallet/component-icons'
import {useRef} from 'react'
import {useSlideAnimation} from '../hooks'

function SlideCard({
  onClose,
  onOpen = false,
  showClose = true,
  cardTitle,
  cardContent,
  cardFooter = null,
  id = '',
  containerClassName = '',
  width = 'w-93',
  height = 'h-125',
  backgroundColor = 'bg-bg',
  direction = 'vertical',
}) {
  const animateStyle = useSlideAnimation(onOpen, direction)
  const ref = useRef(null)

  useClickAway(ref, e => {
    onClose && onClose(e)
  })

  if (!animateStyle) {
    return null
  }
  return (
    <div id={id}>
      <div
        className={`z-20 rounded-t-xl px-3 pt-4 pb-7 absolute bottom-0 overflow-y-auto no-scroll bg-gray-circles bg-no-repeat bg-contain ${animateStyle} ${containerClassName} ${width} ${height} ${backgroundColor}`}
        ref={ref}
      >
        {cardTitle}
        {showClose ? (
          <CloseOutlined
            onClick={onClose}
            className="w-5 h-5 text-gray-60 cursor-pointer absolute top-3 right-3"
          />
        ) : null}
        {cardContent}
        {cardFooter}
      </div>
      <div className="absolute inset-0 z-10" />
    </div>
  )
}

SlideCard.propTypes = {
  showClose: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onOpen: PropTypes.bool.isRequired,
  cardTitle: PropTypes.node,
  cardContent: PropTypes.node,
  cardFooter: PropTypes.node,
  id: PropTypes.string,
  containerClassName: PropTypes.string,
  width: PropTypes.string,
  height: PropTypes.string,
  backgroundColor: PropTypes.string,
  direction: PropTypes.string,
}
export default SlideCard
