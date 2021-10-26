import {useHistory} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import {useRPC} from '@fluent-wallet/use-rpc'
import {TitleNav} from '../../components'
import {CreateTypeItem} from './components'
import {ROUTES, RPC_METHODS} from '../../constants'
const {GET_ACCOUNT_GROUP, ACCOUNT_GROUP_TYPE} = RPC_METHODS

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
  const {data: hdGroup} = useRPC(
    [GET_ACCOUNT_GROUP, ACCOUNT_GROUP_TYPE.HD],
    {type: ACCOUNT_GROUP_TYPE.HD},
    {fallbackData: []},
  )

  return (
    <div className="bg-bg  h-full" id="selectCreateTypeContainer">
      <TitleNav title={t('newAccount')} />
      <main className="px-3">
        <em className="not-italic text-xs text-gray-40 ml-1 mt-3 mb-2 inline-block">
          {t('createAccount')}
        </em>
        {hdGroup?.length ? (
          <CreateTypeItem
            id="useExistingSeed"
            Icon={
              <img src="/images/existing-seed-phrase-icon.svg" alt="icon" />
            }
            title={t('useExistingSeed')}
            subTitle={t('useExistingSeedDes')}
            Tag={Tag}
            onClick={() => {
              history.push(CURRENT_SEED_PHRASE)
            }}
          />
        ) : null}
        <CreateTypeItem
          id="newSeedPhrase"
          Icon={<img src="/images/new-seed-phrase-icon.svg" alt="icon" />}
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
          id="seedPhrase"
          Icon={<img src="/images/new-seed-phrase-icon.svg" alt="icon" />}
          title={t('seedPhrase')}
          subTitle={t('seedPhraseDes')}
          onClick={() => {
            history.push(IMPORT_SEED_PHRASE)
          }}
        />
        <CreateTypeItem
          id="pKey"
          Icon={<img src="/images/private-key-icon.svg" alt="icon" />}
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
