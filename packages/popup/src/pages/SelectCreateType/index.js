import {useHistory} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import {TitleNav} from '../../components'
import {CreateTypeItem} from './components'
import {ROUTES} from '../../constants'

const {
  CURRENT_SEED_PHRASE,
  NEW_SEED_PHRASE,
  IMPORT_SEED_PHRASE,
  IMPORT_PRIVATE_KEY,
} = ROUTES
function Tag() {
  const {t} = useTranslation()
  return (
    <span className="px-1 ml-1 h-4 text-white flex items-center rounded-sm bg-[#80ac9e] text-2xs">
      {t('faster')}
    </span>
  )
}
function SelectCreateType() {
  const {t} = useTranslation()
  const history = useHistory()
  return (
    <div className="bg-bg  h-full">
      <TitleNav title={t('newAccount')} />
      <main className="px-3">
        <em className="not-italic text-xs text-gray-40 ml-1 mt-3 mb-2 inline-block">
          {t('createAccount')}
        </em>
        <CreateTypeItem
          Icon={<img src="images/existing-seed-phrase-icon.svg" alt="icon" />}
          title={t('useExistingSeed')}
          subTitle={t('useExistingSeedDes')}
          Tag={Tag}
          onClick={() => {
            history.push(CURRENT_SEED_PHRASE)
          }}
        />
        <CreateTypeItem
          Icon={<img src="images/new-seed-phrase-icon.svg" alt="icon" />}
          title={t('newSeedPhrase')}
          subTitle={t('newSeedPhraseDes')}
          onClick={() => {
            history.push(NEW_SEED_PHRASE)
          }}
        />
        <em className="not-italic text-xs text-gray-40 ml-1 mb-2 inline-block">
          {t('importExistingAccount')}
        </em>
        <CreateTypeItem
          Icon={<img src="images/new-seed-phrase-icon.svg" alt="icon" />}
          title={t('seedPhrase')}
          subTitle={t('seedPhraseDes')}
          onClick={() => {
            history.push(IMPORT_SEED_PHRASE)
          }}
        />
        <CreateTypeItem
          Icon={<img src="images/private-key-icon.svg" alt="icon" />}
          title={t('pKey')}
          subTitle={t('pKeysDes')}
          onClick={() => {
            history.push(IMPORT_PRIVATE_KEY)
          }}
        />
      </main>
    </div>
  )
}

export default SelectCreateType
