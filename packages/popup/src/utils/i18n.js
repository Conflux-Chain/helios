/* eslint-disable import/no-unresolved */
/* eslint-disable no-unused-vars */
import i18next from 'i18next'
import {initReactI18next} from 'react-i18next'
import Backend from 'i18next-http-backend'
import '../locales/en.json'
const zhLanguages = ['zh', 'zh-CN', 'zh-TW', 'zh-HK']
i18next
  .use(Backend)
  .use(initReactI18next)
  .init({
    backend: {
      loadPath:
        import.meta.env.NODE_ENV === 'development'
          ? 'http://localhost:18001/dist/locales/{{lng}}.json'
          : '../popup/dist/locales/{{lng}}.json',
    },
    react: {
      useSuspense: true,
    },
    debug: import.meta.env.NODE_ENV === 'development' ? true : false,
    lng:
      navigator?.language && zhLanguages.includes(navigator.language)
        ? 'zh'
        : 'en',
    fallbackLng: 'en',
    preload: ['en'],
  })

export default i18next
