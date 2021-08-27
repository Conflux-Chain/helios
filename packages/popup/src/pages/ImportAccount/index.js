import {useParams} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import {TextNav} from '../../components/index'
import Button from '@cfxjs/component-button'
import Input from '@cfxjs/component-input'

function ImportAccount() {
  const {t} = useTranslation()
  const {pattern} = useParams()
  const lanPrefix = pattern === 'seed-phrase' ? 'seed' : 'pKey'

  return (
    <>
      <TextNav hasGoBack={true} title={t(`${lanPrefix}Import`)} />
      <main>
        <h3>{t(`${lanPrefix}GroupName`)}</h3>
        <Input />
        <h3>{t(pattern === 'seed-phrase' ? 'seedPhrase' : 'pKey')}</h3>
        <textarea
          name=""
          id=""
          cols="40"
          rows="10"
          placeholder={t(`${lanPrefix}ImportPlaceholder`)}
        ></textarea>
        <Button>{t('import')}</Button>
      </main>
    </>
  )
}

export default ImportAccount
