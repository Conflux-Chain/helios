import {useHistory} from 'react-router-dom'
import Dropdown from '@cfxjs/component-dropdown'
import {useTranslation} from 'react-i18next'
import {Languages} from '../constants'
import PropTypes from 'prop-types'

const Overlay = changeLanguage => {
  return (
    <>
      {Languages.map(lang => (
        <div aria-hidden="true" key={lang} onClick={changeLanguage}>
          {lang}
        </div>
      ))}
    </>
  )
}

const LanguageNav = ({hasGoBack = false}) => {
  const history = useHistory()
  const {i18n, t} = useTranslation()
  const {language} = i18n
  const changeLanguage = () => {
    if (language.indexOf('en') !== -1) {
      i18n.changeLanguage('zh-CN')
    } else if (language.indexOf('zh') !== -1) {
      i18n.changeLanguage('en')
    }
  }

  return (
    <nav className="text-right">
      {hasGoBack ? (
        <div aria-hidden="true" onClick={history.goBack()}>
          {t('back')}
        </div>
      ) : null}
      <Dropdown overlay={Overlay(changeLanguage)} trigger={['click']}>
        <span>{language}</span>
      </Dropdown>
    </nav>
  )
}
LanguageNav.propTypes = {
  hasGoBack: PropTypes.bool,
}
export default LanguageNav
