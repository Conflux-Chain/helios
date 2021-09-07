import {useState, useEffect} from 'react'
import {useHistory} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import {TitleNav, CompWithLabel} from '../../components'
import Button from '@cfxjs/component-button'
import Input from '@cfxjs/component-input'
import {useRPC} from '@cfxjs/use-rpc'
import {request} from '../../utils'
import {GET_HD_ACCOUNT_GROUP, GET_ALL_ACCOUNT_GROUP} from '../../constants'
import useGlobalStore from '../../stores'
import {useCreatedPasswordGuard} from '../../hooks'

import {useSWRConfig} from 'swr'

function ImportSeedPhrase() {
  const {t} = useTranslation()
  const history = useHistory()
  const {mutate} = useSWRConfig()

  const [name, setName] = useState('')
  const [keygen, setKeygen] = useState('')
  const [keygenErrorMessage, setKeygenErrorMessage] = useState('')
  const [keygenNamePlaceholder, setKeygenNamePlaceholder] = useState('')
  const [creatingAccount, setCreatingAccount] = useState(false)
  const createdPassword = useGlobalStore(state => state.createdPassword)

  const {data: keygenGroup} = useRPC(
    [...GET_HD_ACCOUNT_GROUP],
    {
      type: 'hd',
    },
    {
      fallbackData: [],
    },
  )

  useCreatedPasswordGuard()
  useEffect(() => {
    setKeygenNamePlaceholder(`Seed-${keygenGroup.length + 1}`)
  }, [keygenGroup])

  // TODO should use rpc method wallet_validateMnemonic here
  const validateSeedPhrase = keygen => {
    setKeygenErrorMessage(keygen === '' ? 'Required!' : '')
  }
  const onChangeName = e => {
    setName(e.target.value)
  }
  const onChangeKeygen = e => {
    setKeygen(e.target.value)
    validateSeedPhrase(e.target.value)
  }
  const dispatchMutate = () => {
    mutate([...GET_ALL_ACCOUNT_GROUP])
    mutate([...GET_HD_ACCOUNT_GROUP])
  }

  const onSubmit = event => {
    event.preventDefault()
    validateSeedPhrase(keygen)
  }

  const onCreate = () => {
    if (name && keygen && !creatingAccount) {
      setCreatingAccount(true)
      request('wallet_importMnemonic', {
        password: createdPassword,
        nickname: name || keygenNamePlaceholder,
        mnemonic: keygen,
      }).then(({error, result}) => {
        setCreatingAccount(false)
        if (result) {
          dispatchMutate()
          history.push('/')
        }
        if (error?.message) {
          setKeygenErrorMessage(error.message.split('\n')[0])
        }
      })
    }
  }

  return (
    <div className="bg-bg h-full flex flex-col">
      <TitleNav title={t('seedImport')} />
      <form
        onSubmit={onSubmit}
        className="flex flex-1 px-3 flex-col justify-between"
      >
        <section>
          <CompWithLabel label={t(`seedGroupName`)}>
            <Input
              onChange={onChangeName}
              width="w-full"
              placeholder={keygenNamePlaceholder}
              maxLength="20"
              value={name}
            />
          </CompWithLabel>
          <CompWithLabel label={t('seedPhrase')}>
            <Input
              errorMessage={keygenErrorMessage}
              elementType="textarea"
              placeholder={t(`seedImportPlaceholder`)}
              onChange={onChangeKeygen}
              width="w-full"
              className="resize-none"
              textareaSize="h-40"
              value={keygen}
            />
          </CompWithLabel>
        </section>
        <section className="mb-4">
          <Button
            className="w-70  mx-auto"
            onClick={onCreate}
            disabled={(!name && !keygenNamePlaceholder) || !!keygenErrorMessage}
          >
            {t('import')}
          </Button>
        </section>
      </form>
    </div>
  )
}

export default ImportSeedPhrase
