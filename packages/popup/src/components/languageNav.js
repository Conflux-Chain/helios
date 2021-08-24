import Dropdown from '@cfxjs/component-dropdown'
import {useTranslation} from 'react-i18next'
import {Languages} from '../constants'

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

const LanguageNav = () => {
  const {i18n} = useTranslation()
  const {language} = i18n
  const changeLanguage = () => {
    if (language.indexOf('en') !== -1) {
      i18n.changeLanguage('zh-CN')
    } else if (language.indexOf('zh') !== -1) {
      i18n.changeLanguage('en')
    }
  }
  return (
    <header className="text-right">
      <Dropdown overlay={Overlay(changeLanguage)} trigger={['click']}>
        <span>{language}</span>
      </Dropdown>
    </header>
  )
}

export default LanguageNav
