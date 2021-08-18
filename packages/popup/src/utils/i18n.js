/* eslint-disable no-unused-vars */
import i18next from 'i18next'
import {initReactI18next} from 'react-i18next'
import Backend from 'i18next-http-backend'
import LanguageDetector from 'i18next-browser-languagedetector'
import resources from '../../public/locales/index'
// i18next
//   .use(Backend)
//   .use(LanguageDetector)
//   .use(initReactI18next)
//   .init({
//     backend: {
//       loadPath: `./locales/{{lng}}.json`,
//     },
//     react: {
//       useSuspense: true,
//     },
//     debug: true,
//     fallbackLng: 'en',
//     preload: ['en', 'zh-CN'],
//   })
i18next
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: 'en',
    debug: true,
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  })

export default i18next
