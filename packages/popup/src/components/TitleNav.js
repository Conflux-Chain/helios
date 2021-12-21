import {useHistory} from 'react-router-dom'
import PropTypes from 'prop-types'
import {LeftOutlined} from '@fluent-wallet/component-icons'

function TitleNav({hasGoBack = true, title = '', onGoBack, className}) {
  const history = useHistory()
  return (
    <nav className="flex h-13 items-center justify-center px-3 relative">
      {hasGoBack ? (
        <LeftOutlined
          onClick={() => {
            history.goBack()
            onGoBack && onGoBack()
          }}
          id="goBack"
          className="w-5 h-5 text-gray-60 absolute left-3 top-4 cursor-pointer"
        />
      ) : null}
      <div className={`text-sm text-gray-100 ${className}`}>{title}</div>
    </nav>
  )
}
TitleNav.propTypes = {
  hasGoBack: PropTypes.bool,
  title: PropTypes.string,
  className: PropTypes.string,
  onGoBack: PropTypes.func,
}
export default TitleNav
