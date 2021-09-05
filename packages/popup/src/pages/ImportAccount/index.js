import {useState, useEffect} from 'react'
import {useParams, useHistory} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import {TextNav} from '../../components/index'
import Button from '@cfxjs/component-button'
import Input from '@cfxjs/component-input'
import {CompWithLabel} from '../../components'
import {useRPC} from '@cfxjs/use-rpc'
import {request} from '../../utils'
import {GET_HD_ACCOUNT_GROUP, GET_ALL_ACCOUNT_GROUP} from '../../constants'
import useGlobalStore from '../../stores'
import {useSWRConfig} from 'swr'

function ImportAccount() {
  const {t} = useTranslation()
  const {pattern} = useParams()
  const history = useHistory()
  const {mutate} = useSWRConfig()

  const [name, setName] = useState('')
  const [keygen, setKeygen] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [keygenErrorMessage, setKeygenErrorMessage] = useState('')
  const [keygenNamePlaceholder, setKeygenNamePlaceholder] = useState('')
  const [creatingAccount, setCreatingAccount] = useState(false)
  const createdPassword = useGlobalStore(state => state.createdPassword)

  const lanPrefix = pattern === 'seed-phrase' ? 'seed' : 'pKey'
  const {data: hdGroup} = useRPC(
    [...GET_HD_ACCOUNT_GROUP],
    {type: 'hd'},
    {fallbackData: []},
  )

  useEffect(() => {
    if (!createdPassword) {
      history.push('/')
    }
  }, [createdPassword, history])
  useEffect(() => {
    setKeygenNamePlaceholder(`Seed-${hdGroup.length + 1}`)
  }, [hdGroup])

  // TODO: Error msg
  const validateName = name => {
    setErrorMessage(name.length > 20 ? '长度小于20个字符' : '')
  }
  const validateKeygen = keygen => {
    setKeygenErrorMessage(keygen === '' ? 'Required!' : '')
  }
  const changeName = e => {
    setName(e.target.value)
    validateName(e.target.value)
  }
  const changeKeygen = e => {
    setKeygen(e.target.value)
    validateKeygen(e.target.value)
  }
  const dispatchMutate = () => {
    mutate([...GET_ALL_ACCOUNT_GROUP])
    mutate([...GET_HD_ACCOUNT_GROUP])
  }
  const importAccount = async () => {
    if (!creatingAccount && !errorMessage && !keygenErrorMessage && keygen) {
      setCreatingAccount(true)
      try {
        const res = await request('wallet_importMnemonic', {
          mnemonic: keygen,
          password: createdPassword,
        })
        if (res?.error) {
          throw res.error
        }
        if (res.result) {
          const updateRes = await request('wallet_updateAccountGroup', {
            nickname: name || keygenNamePlaceholder,
            accountGroupId: res.result,
          })

          if (updateRes?.error) {
            throw updateRes?.error
          }
          setCreatingAccount(false)
          if (updateRes.result) {
            dispatchMutate()
            history.push('/')
          }
        }
      } catch (err) {
        console.log('err', err)
        setCreatingAccount(false)
        err.message && setKeygenErrorMessage(err.message.split('\n')[0])
      }
    }
  }

  const onCreate = () => {
    validateName(name)
    validateKeygen(keygen)
    importAccount()
  }

  return (
    <div className="bg-bg  h-full relative">
      <TextNav hasGoBack={true} title={t(`${lanPrefix}Import`)} />
      <main className="px-3">
        <form
          onSubmit={e => {
            e.preventDefault()
          }}
        >
          <CompWithLabel label={t(`${lanPrefix}GroupName`)}>
            <Input
              onChange={changeName}
              errorMessage={errorMessage}
              width="w-full"
              placeholder={keygenNamePlaceholder}
            />
          </CompWithLabel>
          <CompWithLabel
            label={t(pattern === 'seed-phrase' ? 'seedPhrase' : 'pKey')}
            labelStyle="mt-4 mb-3"
          >
            <Input
              errorMessage={keygenErrorMessage}
              elementType="textarea"
              placeholder={t(`${lanPrefix}ImportPlaceholder`)}
              onChange={changeKeygen}
              width="w-full"
              textareaSize="h-40"
            ></Input>
          </CompWithLabel>
          <Button
            className="absolute w-70 top-136 -translate-x-2/4 left-1/2 cursor-pointer"
            onClick={onCreate}
          >
            {t('import')}
          </Button>
        </form>
      </main>
    </div>
  )
}

export default ImportAccount
