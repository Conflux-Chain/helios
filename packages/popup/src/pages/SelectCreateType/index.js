import {useHistory} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import {TextNav} from '../../components/index'
import {Add, Search, Article, Folder} from '@cfxjs/component-icons'
import TypeItem from './components/TypeItem'

function Tag() {
  return <span className="inline-block leading-4 px-1 ml-4">Faster</span>
}
function WithCurrentSeed() {
  const {t} = useTranslation()
  const history = useHistory()
  // TODO: add router click jump
  return (
    <>
      <TextNav hasGoBack={true} title={t('newAccount')} />
      <main>
        <h3>{t('createAccount')}</h3>
        <TypeItem
          Icon={<Article />}
          title={t('useExistingSeed')}
          subTitle={t('useExistingSeedDes')}
          Tag={<Tag />}
        />
        <TypeItem
          Icon={<Add />}
          title={t('newSeedPhrase')}
          subTitle={t('newSeedPhraseDes')}
        />
        <h3>{t('createAccount')}</h3>
        <TypeItem
          Icon={<Folder />}
          title={t('seedPhrase')}
          subTitle={t('seedPhraseDes')}
          onClick={() => {
            history.push('/import-account/seed-phrase')
          }}
        />
        <TypeItem
          Icon={<Search />}
          title={t('pKey')}
          subTitle={t('pKeysDes')}
          onClick={() => {
            history.push('/import-account/private-key')
          }}
        />
      </main>
    </>
  )
}

export default WithCurrentSeed
