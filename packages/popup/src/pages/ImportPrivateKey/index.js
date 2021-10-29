import {useState, useEffect} from 'react'
import {useHistory} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import {TitleNav, CompWithLabel} from '../../components'
import Button from '@fluent-wallet/component-button'
import Input from '@fluent-wallet/component-input'
import {useRPC} from '@fluent-wallet/use-rpc'
import {request} from '../../utils'
import {RPC_METHODS, ROUTES} from '../../constants'
import useGlobalStore from '../../stores'
import {useCreatedPasswordGuard} from '../../hooks'
import {useSWRConfig} from 'swr'
const {
  WALLET_GET_ACCOUNT_GROUP,
  ACCOUNT_GROUP_TYPE,
  WALLET_VALIDATE_PRIVATE_KEY,
  WALLET_IMPORT_PRIVATE_KEY,
  WALLET_ZERO_ACCOUNT_GROUP,
} = RPC_METHODS
const {HOME} = ROUTES

function ImportPrivateKey() {
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
    [WALLET_GET_ACCOUNT_GROUP, ACCOUNT_GROUP_TYPE.PK],
    {type: ACCOUNT_GROUP_TYPE.PK},
    {fallbackData: []},
  )

  useCreatedPasswordGuard()
  useEffect(() => {
    setKeygenNamePlaceholder(`Account-${keygenGroup.length + 1}`)
  }, [keygenGroup])

  const onChangeName = e => {
    setName(e.target.value)
  }
  const onChangeKeygen = e => {
    setKeygen(e.target.value)
  }
  const dispatchMutate = () => {
    mutate([WALLET_ZERO_ACCOUNT_GROUP], false)
    mutate([WALLET_GET_ACCOUNT_GROUP])
    mutate([WALLET_GET_ACCOUNT_GROUP, ACCOUNT_GROUP_TYPE.PK])
  }
  const onCreate = async () => {
    if (!keygen) {
      // TODO: replace error msg
      return setKeygenErrorMessage('Required')
    }

    if (!creatingAccount) {
      setCreatingAccount(true)
      request(WALLET_VALIDATE_PRIVATE_KEY, {privateKey: keygen}).then(
        ({result}) => {
          if (result?.valid) {
            let params = {
              nickname: name || keygenNamePlaceholder,
              privateKey: keygen,
            }
            if (createdPassword) {
              params['password'] = createdPassword
            }
            return request(WALLET_IMPORT_PRIVATE_KEY, params).then(
              ({error, result}) => {
                setCreatingAccount(false)
                if (result) {
                  dispatchMutate()
                  history.push(HOME)
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
        },
      )
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
              placeholder={keygenNamePlaceholder}
              maxLength="20"
              value={name}
            />
          </CompWithLabel>
          <CompWithLabel label={t('pKey')}>
            <Input
              errorMessage={keygenErrorMessage}
              elementType="textarea"
              placeholder={t(`pKeyImportPlaceholder`)}
              onChange={onChangeKeygen}
              width="w-full"
              className="resize-none"
              textareaSize="h-40"
              value={keygen}
            ></Input>
          </CompWithLabel>
        </section>
        <section className="h-14">
          <Button
            id="importPrivateKeyBtn"
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

export default ImportPrivateKey
