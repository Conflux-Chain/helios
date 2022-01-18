import i18next from 'i18next'
import {initReactI18next} from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import resources from './locales'

i18next
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    resources,
    react: {
      useSuspense: true,
    },
    debug: import.meta.env.NODE_ENV === 'development' ? true : false,
    fallbackLng: 'en',
    preload: ['en'],
    load: 'languageOnly',
    order: ['localStorage', 'navigator'],
    lookupLocalStorage: 'i18nextLng',
    caches: ['localStorage'],
  })

export default i18next
