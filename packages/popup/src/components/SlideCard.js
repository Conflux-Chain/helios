import PropTypes from 'prop-types'
import {useClickAway} from 'react-use'
import {CloseOutlined} from '@fluent-wallet/component-icons'
import {useRef} from 'react'
import {useSlideAnimation} from '../hooks'

function SlideCard({
  onClose,
  open = false,
  maskClosable = true,
  showClose = true,
  cardTitle,
  cardContent,
  cardFooter = null,
  id = '',
  containerClassName = '',
  cardClassName = '',
  width = 'w-93',
  height = 'h-125',
  backgroundColor = 'bg-bg',
  direction = 'vertical',
}) {
  const animateStyle = useSlideAnimation(open, direction)
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
        className={`z-20 rounded-t-xl px-3 pt-4 pb-7 absolute bottom-0 overflow-y-auto no-scroll bg-gray-circles bg-no-repeat bg-contain ${animateStyle} ${cardClassName} ${width} ${height} ${backgroundColor}`}
        ref={ref}
      >
        {cardTitle}
        {cardContent}
        {cardFooter}
        {showClose ? (
          <CloseOutlined
            onClick={onClose}
            className="w-5 h-5 text-gray-60 cursor-pointer absolute top-3 right-3"
          />
        ) : null}
      </div>
      <div className="absolute inset-0 z-10 opacity-60 bg-black" />
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
}
export default SlideCard
