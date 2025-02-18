import {useState} from 'react'
import {useEffectOnce} from 'react-use'
import {useTranslation, Trans} from 'react-i18next'
import {useHistory} from 'react-router-dom'
import Button from '@fluent-wallet/component-button'
import useGlobalStore from '../../stores'
import {SeedWord} from './components'
import {TitleNav} from '../../components'
import {request} from '../../utils'
import {useCreatedPasswordGuard} from '../../hooks'
import {RPC_METHODS, ROUTES} from '../../constants'
import './index.css'
const {CONFIRM_SEED_PHRASE} = ROUTES
const {WALLET_GENERATE_MNEMONIC} = RPC_METHODS

function BackupSeed() {
  useCreatedPasswordGuard()
  const {t} = useTranslation()
  const history = useHistory()
  const {setCreatedMnemonic} = useGlobalStore()
  const [mnemonic, setMnemonic] = useState('')
  useEffectOnce(() =>
    request(WALLET_GENERATE_MNEMONIC).then(result => setMnemonic(result)),
  )

  return (
    <div
      className="h-full w-full flex flex-col bg-gray-0"
      id="backupSeedContainer"
    >
      <TitleNav title={t('newAccount')} />
      <main className="px-3 flex flex-col flex-1 justify-between pt-3">
        <div>
          <span className="block ml-1 mb-1 text-gray-80">
            {t('backupSeedTitle')}
          </span>
          <span className="block ml-1 text-xs text-gray-40">
            <Trans i18nKey="backupSeedContent" />
          </span>
          <div
            className="seed-word-container mt-4 pt-3 px-3 bg-bg rounded-sm flex flex-wrap"
            id="mnemonicContainer"
          >
            {mnemonic.split(' ').map((word, index) => (
              <SeedWord
                key={index}
                closable={false}
                word={word}
                idx={index + 1}
              />
            ))}
          </div>
        </div>
        <div className="flex justify-center mb-6">
          <Button
            className="w-70"
            id="backupSeedBtn"
            onClick={() => {
              history.push(CONFIRM_SEED_PHRASE)
              setCreatedMnemonic(mnemonic)
            }}
          >
            {t('next')}
          </Button>
        </div>
      </main>
    </div>
  )
}

export default BackupSeed
