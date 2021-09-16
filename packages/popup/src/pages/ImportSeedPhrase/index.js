import {useState, useEffect} from 'react'
import {useHistory} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import {TitleNav, CompWithLabel} from '../../components'
import Button from '@fluent-wallet/component-button'
import Input from '@fluent-wallet/component-input'
import {useRPC} from '@fluent-wallet/use-rpc'
import {request} from '../../utils'
import {RPC_METHODS} from '../../constants'
import useGlobalStore from '../../stores'
import {useCreatedPasswordGuard} from '../../hooks'
import {useSWRConfig} from 'swr'
const {
  GET_ALL_ACCOUNT_GROUP,
  ACCOUNT_GROUP_TYPE,
  VALIDATE_MNEMONIC,
  IMPORT_MNEMONIC,
} = RPC_METHODS

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
    [GET_ALL_ACCOUNT_GROUP, ACCOUNT_GROUP_TYPE.HD],
    {type: ACCOUNT_GROUP_TYPE.HD},
    {fallbackData: []},
  )

  useCreatedPasswordGuard()
  useEffect(() => {
    setKeygenNamePlaceholder(`Seed-${keygenGroup.length + 1}`)
  }, [keygenGroup])

  const onChangeName = e => {
    setName(e.target.value)
  }
  const onChangeKeygen = e => {
    setKeygen(e.target.value)
  }
  const dispatchMutate = () => {
    mutate([GET_ALL_ACCOUNT_GROUP])
    mutate([GET_ALL_ACCOUNT_GROUP, ACCOUNT_GROUP_TYPE.HD])
  }

  const onCreate = () => {
    if (!keygen) {
      // TODO: replace error msg
      return setKeygenErrorMessage('Required')
    }

    if (!creatingAccount) {
      setCreatingAccount(true)
      request(VALIDATE_MNEMONIC, {
        mnemonic: keygen,
      }).then(({result}) => {
        if (result?.valid) {
          return request(IMPORT_MNEMONIC, {
            password: createdPassword,
            nickname: name || keygenNamePlaceholder,
            mnemonic: keygen,
          }).then(({error, result}) => {
            setCreatingAccount(false)
            if (result) {
              dispatchMutate()
              history.push('/')
            }
            if (error) {
              setKeygenErrorMessage(error.message.split('\n')[0])
            }
          })
        }
        // TODO: replace error msg
        setKeygenErrorMessage('Invalid or inner error!')
        setCreatingAccount(false)
      })
    }
  }

  return (
    <div className="bg-bg h-full flex flex-col">
      <TitleNav title={t('seedImport')} />
      <form
        onSubmit={event => event.preventDefault()}
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
            disabled={!name && !keygenNamePlaceholder}
          >
            {t('import')}
          </Button>
        </section>
      </form>
    </div>
  )
}

export default ImportSeedPhrase
