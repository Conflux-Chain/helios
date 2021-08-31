import {useHistory} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import {TextNav} from '../../components/index'
import {Add, Search, Article, Folder} from '@cfxjs/component-icons'
import TypeItem from './components/TypeItem'

function Tag() {
  const {t} = useTranslation()
  return (
    <span
      className="inline-block leading-4 px-1 ml-4 text-white "
      style={{backgroundColor: '#32E1A9', fontSize: '10px'}}
    >
      {t('faster')}
    </span>
  )
}
function WithCurrentSeed() {
  const {t} = useTranslation()
  const history = useHistory()
  return (
    <div className="bg-bg  h-full">
      <TextNav hasGoBack={true} title={t('newAccount')} />
      <main className="px-4 pt-3">
        <em className="not-italic text-xs text-gray-40">
          {t('createAccount')}
        </em>
        <TypeItem
          Icon={Article}
          title={t('useExistingSeed')}
          subTitle={t('useExistingSeedDes')}
          Tag={Tag}
          typeClass="my-3"
          onClick={() => {
            history.push('/create-account-current-seed-phrase')
          }}
        />
        <TypeItem
          Icon={Add}
          title={t('newSeedPhrase')}
          subTitle={t('newSeedPhraseDes')}
          typeClass="mb-4"
          onClick={() => {
            history.push('/create-account-new-seed-phrase')
          }}
        />
        <em className="not-italic text-xs text-gray-40">
          {t('importExistingAccount')}
        </em>
        <TypeItem
          typeClass="my-3"
          Icon={Folder}
          title={t('seedPhrase')}
          subTitle={t('seedPhraseDes')}
          onClick={() => {
            history.push('/import-account/seed-phrase')
          }}
        />
        <TypeItem
          Icon={Search}
          title={t('pKey')}
          subTitle={t('pKeysDes')}
          onClick={() => {
            history.push('/import-account/private-key')
          }}
        />
      </main>
    </div>
  )
}

export default WithCurrentSeed
