import {useHistory} from 'react-router-dom'
import Dropdown from '@fluent-wallet/component-dropdown'
import {useTranslation} from 'react-i18next'
import {LANGUAGES} from '../constants'
import {ArrowDownFilling, DirectionLeft} from '@fluent-wallet/component-icons'
import PropTypes from 'prop-types'

const Overlay = changeLanguage => {
  const {t} = useTranslation()
  return (
    <>
      {LANGUAGES.map(lang => (
        <div
          className="cursor-pointer"
          aria-hidden="true"
          key={lang}
          onClick={changeLanguage}
        >
          {t(lang)}
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
    <nav className="flex justify-between items-center h-13 text-white px-3">
      {hasGoBack ? (
        <div
          className="flex items-center cursor-pointer"
          aria-hidden="true"
          onClick={() => {
            history.goBack()
          }}
        >
          <DirectionLeft className="w-5 h-5 text-white mr-2" />
          <span className="text-sm">{t('back')}</span>
        </div>
      ) : (
        <div />
      )}
      <Dropdown overlay={Overlay(changeLanguage)} trigger={['hover']}>
        <div className="flex items-center">
          <span className="text-xs">{t(language)}</span>
          <ArrowDownFilling className="ml-1 w-3 h-3" />
        </div>
      </Dropdown>
    </nav>
  )
}
LanguageNav.propTypes = {
  hasGoBack: PropTypes.bool,
}
export default LanguageNav
