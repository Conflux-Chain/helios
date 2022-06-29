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
import useLoading from '../../hooks/useLoading'
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
  const {createdPassword, setCreatedPassword} = useGlobalStore()
  const {setLoading} = useLoading({showBlur: 'high'})
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
    setErrorMessage(e.target.value ? '' : t('required'))
  }
  const onCreate = async () => {
    if (!keygen) {
      return setErrorMessage(t('required'))
    }

    setLoading(true)
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
            updateAddedNewAccount(
              mutate,
              !!createdPassword,
              ACCOUNT_GROUP_TYPE.PK,
            )
              .then(() => {
                createdPassword && setCreatedPassword('')
                setLoading(false)
                history.push(HOME)
              })
              .catch(error => {
                setLoading(false)
                setErrorMessage(
                  error?.message?.split?.('\n')?.[0] ?? error?.message ?? error,
                )
              })
          })
        } else {
          setErrorMessage(t('invalidWord'))
          setLoading(false)
        }
      })
      .catch(error => {
        setLoading(false)
        if (typeof error?.data?.duplicateAccountGroupId === 'number') {
          return setErrorMessage(t('duplicatePkError'))
        }
        setErrorMessage(
          error?.message?.split?.('\n')?.[0] ?? error?.message ?? error,
        )
      })
  }

  return (
    <div
      className="bg-bg h-full w-full flex flex-col"
      id="importPrivateKeyContainer"
    >
      <TitleNav title={t(`pKeyImport`)} />
      <div className="flex flex-1 px-3 flex-col justify-between">
        <section>
          <CompWithLabel label={t(`accountName`)}>
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
        <section className="mb-6">
          <Button
            id="importPrivateKeyBtn"
            className="w-70 mx-auto"
            onClick={onCreate}
            disabled={(!name && !accountNamePlaceholder) || !!errorMessage}
          >
            {t('import')}
          </Button>
        </section>
      </div>
    </div>
  )
}

export default ImportPrivateKey
