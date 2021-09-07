import {useState, useEffect} from 'react'
import {useTranslation} from 'react-i18next'
import Button from '@cfxjs/component-button'
import useGlobalStore from '../../stores'
import {SeedWord} from './components'
import {request, shuffle} from '../../utils'

function ConfirmSeed() {
  const {t} = useTranslation()
  const {createdMnemonic, createdPassword, setCreatedMnemonic} =
    useGlobalStore()
  const initData = new Array(12).fill(null)
  const [mnemonic, setMnemonic] = useState(initData.join(' '))
  const [mnemonicError, setMnemonicError] = useState('')
  const [buttonArray, setButtonArray] = useState([])
  const [importingMnemonic, setImportingMnemonic] = useState(false)
  useEffect(() => {
    setButtonArray(shuffle(createdMnemonic.split(' ')))
  }, [createdMnemonic])
  const onDeleteMnemonic = index => {
    const mnemonicArray = mnemonic.split(' ')
    mnemonicArray.splice(index, 1, null)
    setMnemonic(mnemonicArray.join(' '))
  }
  const onAddMnemonic = word => {
    const mnemonicArray = mnemonic.split(' ')
    const index = mnemonicArray.findIndex(word => word === '')
    mnemonicArray.splice(index, 1, word)
    setMnemonic(mnemonicArray.join(' '))
  }
  const getDisabled = word => {
    const mnemonicArray = mnemonic.split(' ')
    const index = mnemonicArray.findIndex(item => word === item)
    return index > -1
  }
  const onCreate = () => {
    if (mnemonic !== createdMnemonic) {
      setMnemonicError(t('confirmSeedError'))
      return
    }
    setMnemonicError('')
    setImportingMnemonic(true)
    request('wallet_importMnemonic', {
      mnemonic,
      password: createdPassword,
    }).then(({error}) => {
      setImportingMnemonic(false)
      if (error) {
        setMnemonicError(error.message)
        return
      }
      setCreatedMnemonic('')
      console.log('success')
    })
  }

  return (
    <div className="h-full px-3 pt-3 flex flex-col bg-gray-0 justify-between">
      <div>
        <span className="inline-block ml-1 mb-1 text-gray-80">
          {t('confirmSeedTitle')}
        </span>
        <span className="inline-block ml-1 text-xs text-gray-40">
          {t('confirmSeedContent')}
        </span>
        <div
          className={`mt-4 px-3 pt-3 bg-bg rounded-sm flex flex-wrap justify-between ${
            mnemonicError ? 'border-error border border-solid' : ''
          }`}
        >
          {mnemonic.split(' ').map((word, index) => (
            <SeedWord
              key={index}
              word={word}
              idx={index + 1}
              onClose={() => onDeleteMnemonic(index)}
            />
          ))}
        </div>
        {mnemonicError && (
          <span className="inline-block ml-1 mt-2 text-error">
            {mnemonicError}
          </span>
        )}
        <div className="mt-4 px-3 pt-3 flex flex-wrap justify-between">
          {buttonArray.map((word, index) => (
            <Button
              key={index}
              variant="outlined"
              className="w-25 mb-3"
              size="small"
              onClick={() => onAddMnemonic(word)}
              disabled={getDisabled(word)}
            >
              {word}
            </Button>
          ))}
        </div>
      </div>
      <div className="flex justify-center mb-4">
        <Button
          className="w-70"
          onClick={onCreate}
          disabled={!!mnemonicError || importingMnemonic}
        >
          {t('create')}
        </Button>
      </div>
    </div>
  )
}

export default ConfirmSeed
