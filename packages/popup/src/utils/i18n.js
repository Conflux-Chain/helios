/* eslint-disable import/no-unresolved */
/* eslint-disable no-unused-vars */
import i18next from 'i18next'
import {initReactI18next} from 'react-i18next'
import Backend from 'i18next-http-backend'
import LanguageDetector from 'i18next-browser-languagedetector'
i18next
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    backend: {
      loadPath:
        import.meta.env.NODE_ENV === 'development'
          ? 'http://localhost:18001/locales/{{lng}}.json'
          : './locales/{{lng}}.json',
    },
    react: {
      useSuspense: true,
    },
    debug: true,
    fallbackLng: 'en',
    preload: ['en'],
  })

export default i18next
