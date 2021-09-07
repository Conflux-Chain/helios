import {useState} from 'react'
import {useEffectOnce} from 'react-use'
import {useTranslation, Trans} from 'react-i18next'
import {useHistory} from 'react-router-dom'
import Button from '@cfxjs/component-button'
import useGlobalStore from '../../stores'
import {SeedWord} from './components'
import {TitleNav} from '../../components'
import {request} from '../../utils'

function BackupSeed() {
  const {t} = useTranslation()
  const history = useHistory()
  const {setCreatedMnemonic} = useGlobalStore()
  const [mnemonic, setMnemonic] = useState('')
  useEffectOnce(() =>
    request('wallet_generateMnemonic').then(({result}) => setMnemonic(result)),
  )

  console.log(mnemonic)

  return (
    <div className="h-full px-3 pt-3 flex flex-col bg-gray-0 justify-between">
      <div>
        <TitleNav title={t('newAccount')} />
        <span className="inline-block ml-1 mb-1 text-gray-80">
          {t('backupSeedTitle')}
        </span>
        <span className="inline-block ml-1 text-xs text-gray-40">
          <Trans i18nKey="backupSeedContent" />
        </span>
        <div className="mt-4 pt-3 px-3 bg-bg rounded-sm flex flex-wrap justify-between">
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
      <div className="flex justify-center mb-4">
        <Button
          className="w-70"
          onClick={() => {
            history.push('/create-account-confirm-seed-phrase')
            setCreatedMnemonic(mnemonic)
          }}
        >
          {t('next')}
        </Button>
      </div>
    </div>
  )
}

export default BackupSeed
