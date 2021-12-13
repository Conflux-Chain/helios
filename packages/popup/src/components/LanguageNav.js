import Dropdown from '@fluent-wallet/component-dropdown'
import {useTranslation} from 'react-i18next'
import {LANGUAGES} from '../constants'
import {
  CaretDownFilled,
  ArrowLeftOutlined,
} from '@fluent-wallet/component-icons'
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

function LanguageNav({
  hasGoBack = false,
  showLan = true,
  color = 'text-white',
  onClickBack,
}) {
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
    <nav className={`flex justify-between items-center h-13 px-3 ${color}`}>
      {hasGoBack ? (
        <div
          className="flex items-center cursor-pointer"
          aria-hidden="true"
          id="goBack"
          onClick={() => {
            onClickBack && onClickBack()
          }}
        >
          <ArrowLeftOutlined className={`w-5 h-5 mr-2 ${color}`} />
          <span className="text-sm">{t('back')}</span>
        </div>
      ) : (
        <div />
      )}
      {showLan ? (
        <Dropdown
          overlay={Overlay(changeLanguage)}
          trigger={['hover']}
          id="languageDropdown"
        >
          <div className="flex items-center">
            <span className="text-xs">{t(language)}</span>
            {LANGUAGES.length ? (
              <CaretDownFilled className="ml-1 w-3 h-3" />
            ) : null}
          </div>
        </Dropdown>
      ) : null}
    </nav>
  )
}
LanguageNav.propTypes = {
  hasGoBack: PropTypes.bool,
  showLan: PropTypes.bool,
  color: PropTypes.string,
  onClickBack: PropTypes.func,
}
export default LanguageNav
