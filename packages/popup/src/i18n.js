import i18next from 'i18next'
import {initReactI18next} from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import resources from './locales'
import {IS_DEV_MODE} from '@fluent-wallet/inner-utils'

i18next
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    resources,
    react: {
      useSuspense: true,
    },
    debug: IS_DEV_MODE,
    fallbackLng: 'en',
    preload: ['en'],
    load: 'languageOnly',
    order: ['localStorage', 'navigator'],
    lookupLocalStorage: 'i18nextLng',
    caches: ['localStorage'],
  })

export default i18next
