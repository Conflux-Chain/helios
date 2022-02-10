import {useHistory} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import {TitleNav} from '../../components'
import {CreateTypeItem} from './components'
import {useHdAccountGroup, useDataForPopup} from '../../hooks/useApi'
import {ROUTES} from '../../constants'
import {detectFirefox} from '../../utils'

const isFirefox = detectFirefox()

const {
  CURRENT_SEED_PHRASE,
  NEW_SEED_PHRASE,
  IMPORT_SEED_PHRASE,
  WALLET_IMPORT_PRIVATE_KEY,
  HARDWARE_GUARD,
} = ROUTES
function Tag() {
  const {t} = useTranslation()
  return (
    <span className="px-1 ml-1 h-4 text-white flex items-center rounded-sm bg-[#32e1a9] text-2xs">
      {t('faster')}
    </span>
  )
}
function SelectCreateType() {
  const {t} = useTranslation()
  const history = useHistory()
  const hdGroup = useHdAccountGroup()
  const {zeroGroup} = useDataForPopup()

  return (
    <div className="bg-bg h-full w-full" id="selectCreateTypeContainer">
      <TitleNav title={t('newAccount')} />
      <main className="px-3">
        <em className="not-italic text-xs text-gray-40 ml-1 mt-3 mb-2 inline-block">
          {t('createAccount')}
        </em>
        {hdGroup?.length > 0 && (
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
        )}
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
          Icon={<img src="/images/seed-phrase-icon.svg" alt="icon" />}
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
            history.push(WALLET_IMPORT_PRIVATE_KEY)
          }}
        />
        {zeroGroup === false && !isFirefox && (
          <CreateTypeItem
            id="hw"
            Icon={<img src="/images/hardware-wallet-icon.svg" alt="icon" />}
            title={t('hardwareWallet')}
            subTitle={t('ledgerDes')}
            typeClass="mt-9"
            onClick={() => {
              history.push(HARDWARE_GUARD)
            }}
          />
        )}
      </main>
    </div>
  )
}

export default SelectCreateType
