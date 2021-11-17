import {useState, useEffect} from 'react'
import {useHistory} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import {TitleNav, CompWithLabel} from '../../components'
import Button from '@fluent-wallet/component-button'
import Input from '@fluent-wallet/component-input'
import {request, updateAddedNewAccount} from '../../utils'
import {RPC_METHODS, ROUTES} from '../../constants'
import useGlobalStore from '../../stores'
import {useCreatedPasswordGuard} from '../../hooks'
import {useHdAccountGroup} from '../../hooks/useApi'
import {useSWRConfig} from 'swr'
const {ACCOUNT_GROUP_TYPE, WALLET_VALIDATE_MNEMONIC, WALLET_IMPORT_MNEMONIC} =
  RPC_METHODS
const {HOME} = ROUTES

function ImportSeedPhrase() {
  const {t} = useTranslation()
  const history = useHistory()
  const {mutate} = useSWRConfig()

  const [name, setName] = useState('')
  const [keygen, setKeygen] = useState('')
  const [keygenErrorMessage, setKeygenErrorMessage] = useState('')
  const [keygenNamePlaceholder, setKeygenNamePlaceholder] = useState('')
  const [creatingAccount, setCreatingAccount] = useState(false)
  const {createdPassword, setCreatedPassword} = useGlobalStore()

  const keygenGroup = useHdAccountGroup()

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
  const onCreate = () => {
    if (!keygen) {
      // TODO: replace error msg
      return setKeygenErrorMessage('Required')
    }

    if (!creatingAccount) {
      setCreatingAccount(true)
      request(WALLET_VALIDATE_MNEMONIC, {
        mnemonic: keygen,
      }).then(({result}) => {
        if (result?.valid) {
          let params = {
            nickname: name || keygenNamePlaceholder,
            mnemonic: keygen,
          }
          if (createdPassword) {
            params['password'] = createdPassword
          }
          return request(WALLET_IMPORT_MNEMONIC, params).then(
            ({error, result}) => {
              setCreatingAccount(false)
              if (result) {
                updateAddedNewAccount(
                  mutate,
                  !!createdPassword,
                  ACCOUNT_GROUP_TYPE.HD,
                )
                createdPassword && setCreatedPassword('')
                history.push(HOME)
              }
              if (typeof error?.data?.duplicateAccountGroupId === 'number') {
                return setKeygenErrorMessage(t('duplicateSeedError'))
              }
              if (error) {
                setKeygenErrorMessage(error.message.split('\n')[0])
              }
            },
          )
        }
        // TODO: replace error msg
        setKeygenErrorMessage('Invalid or inner error!')
        setCreatingAccount(false)
      })
    }
  }

  return (
    <div className="bg-bg h-full flex flex-col" id="importSeedPhraseContainer">
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
              id="seedGroupName"
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
              id="seedPhrase"
            />
          </CompWithLabel>
        </section>
        <section className="mb-4">
          <Button
            id="importSeedPhraseBtn"
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
