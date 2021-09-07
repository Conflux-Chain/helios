import {useState, useEffect} from 'react'
import {useHistory} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import {TextNav} from '../../components/index'
import Button from '@cfxjs/component-button'
import Input from '@cfxjs/component-input'
import {CompWithLabel} from '../../components'
import {useRPC} from '@cfxjs/use-rpc'
import {request} from '../../utils'
import {GET_HD_ACCOUNT_GROUP, GET_ALL_ACCOUNT_GROUP} from '../../constants'
import useGlobalStore from '../../stores'
import {useCreatedPasswordGuard} from '../../hooks'

import {useSWRConfig} from 'swr'

function ImportAccount() {
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

  const walletValidateSeedPhrase = keygen => {
    setKeygenErrorMessage(keygen === '' ? 'Required!' : '')
  }
  const changeName = e => {
    setName(e.target.value)
  }
  const changeKeygen = e => {
    setKeygen(e.target.value)
    walletValidateSeedPhrase(e.target.value)
  }
  const dispatchMutate = () => {
    mutate([...GET_ALL_ACCOUNT_GROUP])
    mutate([...GET_HD_ACCOUNT_GROUP])
  }

  const importAccount = async () => {
    if (
      !creatingAccount &&
      name.length <= 20 &&
      !keygenErrorMessage &&
      keygen
    ) {
      setCreatingAccount(true)
      request('wallet_importMnemonic', {
        password: createdPassword,
        nickname: name || keygenNamePlaceholder,
        mnemonic: keygen,
      }).then(({error, res}) => {
        setCreatingAccount(false)
        if (res?.result) {
          dispatchMutate()
          history.push('/')
        }
        if (error?.message) {
          setKeygenErrorMessage(error.message.split('\n')[0])
        }
      })
    }
  }

  const onCreate = () => {
    walletValidateSeedPhrase(keygen)
    importAccount()
  }

  return (
    <div className="bg-bg  h-full flex flex-col">
      <TextNav hasGoBack={true} title={t(`seedImport`)} />
      <main className="px-3 flex-1 flex flex-col">
        <form
          onSubmit={e => {
            e.preventDefault()
          }}
          className="flex flex-col justify-between h-full"
        >
          <section>
            <CompWithLabel label={t(`seedGroupName`)}>
              <Input
                onChange={changeName}
                width="w-full"
                placeholder={keygenNamePlaceholder}
                maxLength="20"
              />
            </CompWithLabel>
            <CompWithLabel label={t('seedPhrase')}>
              <Input
                errorMessage={keygenErrorMessage}
                elementType="textarea"
                placeholder={t(`seedImportPlaceholder`)}
                onChange={changeKeygen}
                width="w-full"
                className="resize-none"
                textareaSize="h-40"
              ></Input>
            </CompWithLabel>
          </section>
          <section className="h-14">
            <Button
              className="w-70  mx-auto"
              onClick={onCreate}
              disabled={
                (!name && !keygenNamePlaceholder) || !!keygenErrorMessage
              }
            >
              {t('import')}
            </Button>
          </section>
        </form>
      </main>
    </div>
  )
}

export default ImportAccount
