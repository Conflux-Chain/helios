import Dropdown from '@cfxjs/component-dropdown'
import {Languages} from '../constants'
import {useTranslation} from 'react-i18next'

const LanguageNav = () => {
  const {i18n} = useTranslation()
  const {language} = i18n

  const onChangeLanguage = () => {
    if (language.indexOf('en') !== -1) {
      i18n.changeLanguage('zh-CN')
    } else if (language.indexOf('zh') !== -1) {
      i18n.changeLanguage('en')
    }
  }
  return (
    <header>
      <Dropdown overlay={<div>test menu</div>}>
        <>
          {Languages.map(lang => (
            <div aria-hidden="true" key={lang} onClick={onChangeLanguage}>
              {lang}
            </div>
          ))}
        </>
      </Dropdown>
    </header>
  )
}

export default LanguageNav
