import {useState, useEffect, useMemo} from 'react'
import {useSWRConfig} from 'swr'
import {useTranslation} from 'react-i18next'
import {useHistory} from 'react-router-dom'
import Button from '@fluent-wallet/component-button'
import useGlobalStore from '../../stores'
import {SeedWord} from './components'
import {TitleNav} from '../../components'
import {request, shuffle} from '../../utils'
import {useCreatedPasswordGuard} from '../../hooks'
import {RPC_METHODS, ROUTES} from '../../constants'
const {IMPORT_MNEMONIC, GET_NO_GROUP} = RPC_METHODS
const {HOME} = ROUTES

function ConfirmSeed() {
  useCreatedPasswordGuard()
  const {t} = useTranslation()
  const {mutate} = useSWRConfig()
  const history = useHistory()
  const {createdMnemonic, createdPassword, setCreatedMnemonic} =
    useGlobalStore()
  const initData = new Array(12).fill(null)
  // record the index of buttonArray
  const [mnemonicIndex, setMnemonicIndex] = useState(initData.join(' '))
  const [mnemonicError, setMnemonicError] = useState('')
  const [buttonArray, setButtonArray] = useState([])
  const [importingMnemonic, setImportingMnemonic] = useState(false)
  useEffect(() => {
    setButtonArray(shuffle(createdMnemonic.split(' ')))
  }, [createdMnemonic])
  const mnemonic = useMemo(
    () =>
      mnemonicIndex
        .split(' ')
        .map(index => buttonArray[index] || null)
        .join(' '),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mnemonicIndex],
  )
  useEffect(() => {
    if (mnemonic === createdMnemonic) {
      setMnemonicError('')
    }
  }, [mnemonic, createdMnemonic])
  const onDeleteMnemonic = index => {
    const mnemonicIndexArray = mnemonicIndex.split(' ')
    mnemonicIndexArray.splice(index, 1, null)
    setMnemonicIndex(mnemonicIndexArray.join(' '))
  }
  const onAddMnemonic = index => {
    const mnemonicIndexArray = mnemonicIndex.split(' ')
    const insertIndex = mnemonicIndexArray.findIndex(idx => idx === '')
    mnemonicIndexArray.splice(insertIndex, 1, index)
    setMnemonicIndex(mnemonicIndexArray.join(' '))
  }
  const getDisabled = index => {
    const mnemonicIndexArray = mnemonicIndex.split(' ')
    const findIndex = mnemonicIndexArray.findIndex(
      idx => index.toString() === idx,
    )
    return findIndex > -1
  }
  const onCreate = () => {
    if (mnemonic !== createdMnemonic) {
      setMnemonicError(t('confirmSeedError'))
      return
    }
    setMnemonicError('')
    if (importingMnemonic) return
    setImportingMnemonic(true)
    request(IMPORT_MNEMONIC, {
      mnemonic,
      password: createdPassword,
    }).then(({error}) => {
      setImportingMnemonic(false)
      if (error) {
        setMnemonicError(error.message)
        return
      }
      mutate([GET_NO_GROUP], false)
      history.push(HOME)
      setCreatedMnemonic('')
      console.log('success')
    })
  }

  return (
    <div className="h-full flex flex-col bg-gray-0" id="confirmSeedContainer">
      <TitleNav title={t('newAccount')} />
      <main className="px-3 pt-3 flex flex-col flex-1 justify-between">
        <div>
          <span className="inline-block ml-1 mb-1 text-gray-80">
            {t('confirmSeedTitle')}
          </span>
          <span className="inline-block ml-1 text-xs text-gray-40">
            {t('confirmSeedContent')}
          </span>
          <div
            className={`relative mt-4 px-3 pt-3 bg-bg rounded-sm flex flex-wrap justify-between ${
              mnemonicError
                ? 'after:absolute after:inset-0 after:border-error after:border after:border-solid after:z-[-1]'
                : ''
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
          <div
            className={`${
              mnemonicError ? 'mt-4' : 'mt-10'
            } px-3 pt-3 flex flex-wrap justify-between`}
          >
            {buttonArray.map((word, index) => (
              <Button
                key={index}
                variant="outlined"
                className="w-25 mb-3"
                size="small"
                id={`onAddMnemonicBtn-${index}`}
                onClick={() => onAddMnemonic(index)}
                disabled={getDisabled(index)}
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
            id="onCreateMnemonicBtn"
            disabled={!!mnemonicError}
          >
            {t('create')}
          </Button>
        </div>
      </main>
    </div>
  )
}

export default ConfirmSeed
