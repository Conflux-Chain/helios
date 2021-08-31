import {useHistory} from 'react-router-dom'
import PropTypes from 'prop-types'
import {LeftTriangle} from '@cfxjs/component-icons'

function TextNav({hasGoBack = false, title = ''}) {
  const history = useHistory()
  return (
    <nav className="flex h-13 items-center px-3 justify-between relative">
      {hasGoBack ? (
        <div
          aria-hidden="true"
          className="flex items-center cursor-pointer"
          onClick={() => {
            history.goBack()
          }}
        >
          <LeftTriangle className="w-5 h-5" />
        </div>
      ) : null}
      <div className="text-sm text-gray-100 absolute left-1/2 -translate-x-1/2">
        {title}
      </div>
    </nav>
  )
}
TextNav.propTypes = {
  hasGoBack: PropTypes.bool,
  title: PropTypes.string,
}
export default TextNav
