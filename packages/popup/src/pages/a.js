/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react'
import {useTranslation} from 'react-i18next'

const A = () => {
  const {t, i18n} = useTranslation()
  const onClick = () => {
    console.log(11)
    i18n.changeLanguage('zh-CN')
  }
  return <div onClick={onClick}>{t('waiting')}</div>
}

export default A
