import {useState} from 'react'
import Dropdown from '@fluent-wallet/component-dropdown'
import {useTranslation} from 'react-i18next'
import {LANGUAGES} from '../constants'
import {formatLocalizationLang} from '../utils'
import {
  CaretDownFilled,
  ArrowLeftOutlined,
  CheckCircleFilled,
} from '@fluent-wallet/component-icons'
import PropTypes from 'prop-types'

function Overlay({changeLanguage}) {
  const {t, i18n} = useTranslation()

  return (
    <>
      {LANGUAGES.map(lang => (
        <div
          className="px-4 h-10 flex items-center justify-between text-sm text-gray-80 cursor-pointer hover:bg-primary-10 hover:text-primary"
          aria-hidden="true"
          key={lang}
          id={`switch-${lang}`}
          onClick={() => changeLanguage(lang)}
        >
          <span>{t(lang)}</span>
          {formatLocalizationLang(i18n.language) === lang && (
            <CheckCircleFilled className="w-4 h-4 text-primary" />
          )}
        </div>
      ))}
    </>
  )
}

Overlay.propTypes = {
  changeLanguage: PropTypes.func,
}

function LanguageNav({
  hasGoBack = false,
  showLan = true,
  color = 'text-white',
  onClickBack,
}) {
  const {i18n, t} = useTranslation()
  const {language} = i18n
  const [rotateTriangle, setRotateTriangle] = useState(false)

  const changeLanguage = lang => {
    formatLocalizationLang(language) !== lang && i18n.changeLanguage(lang)
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
      {showLan && (
        <Dropdown
          overlay={<Overlay changeLanguage={changeLanguage} />}
          overlayClassName="bg-gray-0 rounded py-2"
          id="language-dropdown"
          onVisibleChange={status => {
            setRotateTriangle(status)
          }}
        >
          <div className="flex items-center cursor-pointer w-[132px] justify-end">
            <span className="text-xs">
              {t(formatLocalizationLang(language))}
            </span>
            <CaretDownFilled
              className={`ml-1 w-3 h-3 transition duration-300 ease-in-out ${
                rotateTriangle ? 'rotate-180' : ''
              }`}
            />
          </div>
        </Dropdown>
      )}
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
