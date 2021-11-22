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
import {usePkAccountGroup} from '../../hooks/useApi'
import {useSWRConfig} from 'swr'
const {
  ACCOUNT_GROUP_TYPE,
  WALLET_VALIDATE_PRIVATE_KEY,
  WALLET_IMPORT_PRIVATE_KEY,
} = RPC_METHODS
const {HOME} = ROUTES

function ImportPrivateKey() {
  const {t} = useTranslation()
  const history = useHistory()
  const {mutate} = useSWRConfig()

  const [name, setName] = useState('')
  const [keygen, setKeygen] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [accountNamePlaceholder, setAccountNamePlaceholder] = useState('')
  const [creatingAccount, setCreatingAccount] = useState(false)
  const {createdPassword, setCreatedPassword} = useGlobalStore()

  const keygenGroup = usePkAccountGroup()

  useCreatedPasswordGuard()
  useEffect(() => {
    setAccountNamePlaceholder(`Account-${keygenGroup.length + 1}`)
  }, [keygenGroup])

  const onChangeName = e => {
    setName(e.target.value)
  }
  const onChangeKeygen = e => {
    setKeygen(e.target.value)
    // TODO: replace error msg
    setErrorMessage(e.target.value ? '' : 'Required')
  }
  const onCreate = async () => {
    if (!keygen) {
      // TODO: replace error msg
      return setErrorMessage('Required')
    }

    if (!creatingAccount) {
      setCreatingAccount(true)
      request(WALLET_VALIDATE_PRIVATE_KEY, {privateKey: keygen})
        .then(result => {
          if (result?.valid) {
            let params = {
              nickname: name || accountNamePlaceholder,
              privateKey: keygen,
            }
            if (createdPassword) {
              params['password'] = createdPassword
            }
            return request(WALLET_IMPORT_PRIVATE_KEY, params).then(() => {
              setCreatingAccount(false)
              updateAddedNewAccount(
                mutate,
                !!createdPassword,
                ACCOUNT_GROUP_TYPE.PK,
              )
              createdPassword && setCreatedPassword('')
              history.push(HOME)
            })
          }
          setCreatingAccount(false)
          // TODO: replace error msg
          setErrorMessage('Invalid or inner error!')
        })
        .catch(error => {
          setCreatingAccount(false)
          if (typeof error?.data?.duplicateAccountGroupId === 'number') {
            return setErrorMessage(t('duplicatePkError'))
          }
          setErrorMessage(error?.message?.split('\n')[0] ?? error)
        })
    }
  }

  return (
    <div className="bg-bg h-full flex flex-col" id="importPrivateKeyContainer">
      <TitleNav title={t(`pKeyImport`)} />
      <form
        onSubmit={event => event.preventDefault()}
        className="flex flex-1 px-3 flex-col justify-between"
      >
        <section>
          <CompWithLabel label={t(`pKeyGroupName`)}>
            <Input
              onChange={onChangeName}
              width="w-full"
              placeholder={accountNamePlaceholder}
              maxLength="20"
              value={name}
              id="pKeyGroupName"
            />
          </CompWithLabel>
          <CompWithLabel label={t('pKey')}>
            <Input
              errorMessage={errorMessage}
              elementType="textarea"
              placeholder={t(`pKeyImportPlaceholder`)}
              onChange={onChangeKeygen}
              width="w-full"
              className="resize-none"
              textareaSize="h-40"
              value={keygen}
              id="pk"
            ></Input>
          </CompWithLabel>
        </section>
        <section className="h-14">
          <Button
            id="importPrivateKeyBtn"
            className="w-70  mx-auto"
            onClick={onCreate}
            disabled={(!name && !accountNamePlaceholder) || !!errorMessage}
          >
            {t('import')}
          </Button>
        </section>
      </form>
    </div>
  )
}

export default ImportPrivateKey
