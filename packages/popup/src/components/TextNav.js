import {useHistory} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import PropTypes from 'prop-types'

function TextNav({hasGoBack = false, title = ''}) {
  const history = useHistory()
  const {t} = useTranslation()

  return (
    <nav className="flex justify-between">
      {hasGoBack ? (
        <div
          aria-hidden="true"
          onClick={() => {
            history.goBack()
          }}
        >
          {t('back')}
        </div>
      ) : null}
      <div>{title}</div>
    </nav>
  )
}
TextNav.propTypes = {
  hasGoBack: PropTypes.bool,
  title: PropTypes.string,
}
export default TextNav
