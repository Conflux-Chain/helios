import {useTranslation} from 'react-i18next'
import {TextNav} from '../../components/index'
import {Add, Search, Article, Folder} from '@cfxjs/component-icons'
import TypeItem from './components/TypeItem'

function Tag() {
  return <span className="inline-block leading-4 px-1 ml-4">Faster</span>
}
function WithCurrentSeed() {
  const {t} = useTranslation()
  return (
    <>
      <TextNav hasGoBack={true} title={t('newAccount')} />
      <main>
        <div>{t('createAccount')}</div>
        <TypeItem
          Icon={<Article />}
          title={t('UseExistingSeed')}
          subTitle={t('UseExistingSeedDes')}
          Tag={<Tag />}
        />
        <TypeItem
          Icon={<Add />}
          title={t('newSeedPhrase')}
          subTitle={t('newSeedPhraseDes')}
        />
        <div>{t('createAccount')}</div>
        <TypeItem
          Icon={<Folder />}
          title={t('seedPhrase')}
          subTitle={t('seedPhraseDes')}
        />
        <TypeItem
          Icon={<Search />}
          title={t('pKey')}
          subTitle={t('pKeysDes')}
        />
      </main>
    </>
  )
}

export default WithCurrentSeed
