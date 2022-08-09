import {useHistory} from 'react-router-dom'
import PropTypes from 'prop-types'
import {LeftOutlined} from '@fluent-wallet/component-icons'

function TitleNav({
  hasGoBack = true,
  title = '',
  onGoBack,
  className,
  rightButton,
}) {
  const history = useHistory()
  return (
    <nav className="flex h-13 items-center justify-center px-3 relative">
      {hasGoBack ? (
        <span
          aria-hidden="true"
          id="go-back"
          onMouseDown={e => {
            e.preventDefault()
            history.goBack()
            onGoBack?.()
          }}
        >
          <LeftOutlined className="w-5 h-5 text-gray-60 absolute left-3 top-4 cursor-pointer" />
        </span>
      ) : null}
      <div className={`text-sm text-gray-100 ${className}`}>{title}</div>
      <div className="absolute right-3 cursor-pointer">
        {rightButton && rightButton}
      </div>
    </nav>
  )
}
TitleNav.propTypes = {
  hasGoBack: PropTypes.bool,
  title: PropTypes.string,
  className: PropTypes.string,
  onGoBack: PropTypes.func,
  rightButton: PropTypes.node,
}
export default TitleNav
