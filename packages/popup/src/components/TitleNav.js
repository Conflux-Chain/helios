import {useHistory} from 'react-router-dom'
import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {LeftOutlined} from '@fluent-wallet/component-icons'

function TitleNav({
  hasGoBack = true,
  autoGoBack = true,
  title = '',
  onGoBack,
  className,
  rightButton,
}) {
  const history = useHistory()
  const {t} = useTranslation()

  return (
    <nav className="flex h-13 items-center justify-center px-3 relative">
      {hasGoBack ? (
        <button
          type="button"
          aria-label={t('back')}
          id="go-back"
          className="absolute left-3 top-4 h-5 w-5 cursor-pointer"
          onMouseDown={e => e.preventDefault()}
          onClick={() => {
            if (autoGoBack) {
              history.goBack()
            }
            onGoBack?.()
          }}
        >
          <LeftOutlined className="w-5 h-5 text-gray-60" />
        </button>
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
  autoGoBack: PropTypes.bool,
  title: PropTypes.node,
  onGoBack: PropTypes.func,
  className: PropTypes.string,
  rightButton: PropTypes.node,
}

export default TitleNav
