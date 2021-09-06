import {useState, useEffect} from 'react'
import {useTranslation, Trans} from 'react-i18next'
import {useHistory} from 'react-router-dom'
import Button from '@cfxjs/component-button'
import {useRPC} from '@cfxjs/use-rpc'
import useGlobalStore from '../../stores'
import {SeedWord} from './components'

function BackupSeed() {
  const {t} = useTranslation()
  const history = useHistory()
  const {setCreatedMnemonic} = useGlobalStore()
  const [mnemonic, setMnemonic] = useState([])
  const {data: mnemonicData} = useRPC(['wallet_generateMnemonic'], undefined, {
    fallbackData: '',
    refreshInterval: 0,
  })
  useEffect(() => {
    setMnemonic(mnemonicData.split(' '))
  }, [mnemonicData])

  return (
    <div className="h-full px-3 pt-3 flex flex-col bg-gray-0 justify-between">
      <div>
        <span className="inline-block ml-1 mb-1 text-gray-80">
          {t('backupSeedTitle')}
        </span>
        <span className="inline-block ml-1 text-xs text-gray-40">
          <Trans i18nKey="backupSeedContent" />
        </span>
        <div className="mt-4 pt-3 px-3 bg-bg rounded-sm flex flex-wrap justify-between">
          {mnemonic.map((word, index) => (
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
            setCreatedMnemonic(mnemonicData)
          }}
        >
          {t('next')}
        </Button>
      </div>
    </div>
  )
}

export default BackupSeed
