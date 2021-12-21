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
  const [mnemonic, setMnemonic] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [accountNamePlaceholder, setAccountNamePlaceholder] = useState('')
  const [creatingAccount, setCreatingAccount] = useState(false)
  const {createdPassword, setCreatedPassword} = useGlobalStore()

  const hdGroup = useHdAccountGroup()

  useCreatedPasswordGuard()
  useEffect(() => {
    setAccountNamePlaceholder(`Seed-${hdGroup.length + 1}`)
  }, [hdGroup])

  const onChangeName = e => {
    setName(e.target.value)
  }
  const onChangeKeygen = e => {
    setMnemonic(e.target.value)
    // TODO: replace error msg
    setErrorMessage(e.target.value ? '' : 'Required')
  }
  const onCreate = () => {
    const mnemonicParam = mnemonic.replace(/  +/g, ' ').trim()
    if (!mnemonicParam) {
      return setErrorMessage('Required')
    }
    if (!creatingAccount) {
      setCreatingAccount(true)
      request(WALLET_VALIDATE_MNEMONIC, {
        mnemonic: mnemonicParam,
      })
        .then(result => {
          if (result?.valid) {
            let params = {
              nickname: name || accountNamePlaceholder,
              mnemonic: mnemonicParam,
            }
            if (createdPassword) {
              params['password'] = createdPassword
            }
            return request(WALLET_IMPORT_MNEMONIC, params).then(() => {
              createdPassword && setCreatedPassword('')
              setCreatingAccount(false)
              updateAddedNewAccount(
                mutate,
                !!createdPassword,
                ACCOUNT_GROUP_TYPE.HD,
              ).then(() => history.push(HOME))
            })
          }
          // TODO: replace error msg
          setErrorMessage('Invalid or inner error!')
          setCreatingAccount(false)
        })
        .catch(error => {
          setCreatingAccount(false)
          setErrorMessage(
            typeof error?.data?.duplicateAccountGroupId === 'number'
              ? t('duplicateSeedError')
              : error?.message.split('\n')[0] ?? error,
          )
        })
    }
  }

  return (
    <div
      className="bg-bg h-150 w-93 m-auto light flex flex-col"
      id="importSeedPhraseContainer"
    >
      <TitleNav title={t('seedImport')} />
      <div className="flex flex-1 px-3 flex-col justify-between">
        <section>
          <CompWithLabel label={t(`seedGroupName`)}>
            <Input
              onChange={onChangeName}
              width="w-full"
              placeholder={accountNamePlaceholder}
              maxLength="20"
              value={name}
              id="seedGroupName"
            />
          </CompWithLabel>
          <CompWithLabel label={t('seedPhrase')}>
            <Input
              errorMessage={errorMessage}
              elementType="textarea"
              placeholder={t(`seedImportPlaceholder`)}
              onChange={onChangeKeygen}
              width="w-full"
              className="resize-none"
              textareaSize="h-40"
              value={mnemonic}
              id="seedPhrase"
            />
          </CompWithLabel>
        </section>
        <section className="mb-4">
          <Button
            id="importSeedPhraseBtn"
            className="w-70  mx-auto"
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

export default ImportSeedPhrase
