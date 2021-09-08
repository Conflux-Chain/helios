import {useState, useEffect} from 'react'
import {useHistory} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import {TitleNav} from '../../components'
import Button from '@cfxjs/component-button'
import Input from '@cfxjs/component-input'
import {CompWithLabel} from '../../components'
import {useRPC} from '@cfxjs/use-rpc'
import {request} from '../../utils'
import {GET_ALL_ACCOUNT_GROUP, GET_PK_ACCOUNT_GROUP} from '../../constants'
import useGlobalStore from '../../stores'
import {useCreatedPasswordGuard} from '../../hooks'

import {useSWRConfig} from 'swr'

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
    [...GET_PK_ACCOUNT_GROUP],
    {
      type: 'pk',
    },
    {
      fallbackData: [],
    },
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
    mutate([...GET_ALL_ACCOUNT_GROUP])
    mutate([...GET_PK_ACCOUNT_GROUP])
  }
  const onCreate = async () => {
    if (
      !creatingAccount &&
      name.length <= 20 &&
      !keygenErrorMessage &&
      keygen
    ) {
      setCreatingAccount(true)
      request('wallet_validatePrivateKey', {privateKey: keygen}).then(
        ({result}) => {
          if (result?.valid) {
            request('wallet_importPrivateKey', {
              password: createdPassword,
              nickname: name || keygenNamePlaceholder,
              privateKey: keygen,
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
          } else {
            // TODO: replace error msg
            setKeygenErrorMessage('输入有误!')
            setCreatingAccount(false)
          }
        },
      )
    }
  }

  return (
    <div className="bg-bg h-full flex flex-col">
      <TitleNav title={t(`pKeyImport`)} />
      <form
        onSubmit={e => {
          e.preventDefault()
        }}
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
