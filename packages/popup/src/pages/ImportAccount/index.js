import {useState, useEffect} from 'react'
import {useParams, useHistory} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import {TextNav} from '../../components/index'
import Button from '@cfxjs/component-button'
import Input from '@cfxjs/component-input'
import {CompWithLabel} from '../../components'
import {useRPC} from '@cfxjs/use-rpc'
import {request} from '../../utils'
import {
  GET_HD_ACCOUNT_GROUP,
  GET_ALL_ACCOUNT_GROUP,
  GET_PK_ACCOUNT_GROUP,
} from '../../constants'
import useGlobalStore from '../../stores'
import {useSWRConfig} from 'swr'

function ImportAccount() {
  const {t} = useTranslation()
  const {pattern} = useParams()
  const history = useHistory()
  const {mutate} = useSWRConfig()

  const [name, setName] = useState('')
  const [keygen, setKeygen] = useState('')
  const [keygenErrorMessage, setKeygenErrorMessage] = useState('')
  const [keygenNamePlaceholder, setKeygenNamePlaceholder] = useState('')
  const [creatingAccount, setCreatingAccount] = useState(false)
  const createdPassword = useGlobalStore(state => state.createdPassword)

  let lanPrefix = ''
  let deps = null
  let groupParams = undefined
  if (pattern === 'seed-phrase') {
    lanPrefix = 'seed'
    deps = [...GET_HD_ACCOUNT_GROUP]
    groupParams = {
      type: 'hd',
    }
  } else {
    lanPrefix = 'pKey'
    deps = [...GET_PK_ACCOUNT_GROUP]
    groupParams = {
      type: 'pk',
    }
  }
  const {data: keygenGroup} = useRPC(deps, groupParams, {fallbackData: []})

  useEffect(() => {
    if (!createdPassword) {
      history.push('/')
    }
  }, [createdPassword, history])
  useEffect(() => {
    setKeygenNamePlaceholder(`Seed-${keygenGroup.length + 1}`)
  }, [keygenGroup])

  const validateKeygen = keygen => {
    setKeygenErrorMessage(keygen === '' ? 'Required!' : '')
  }
  const changeName = e => {
    setName(e.target.value)
  }
  const changeKeygen = e => {
    setKeygen(e.target.value)
    validateKeygen(e.target.value)
  }
  const dispatchMutate = () => {
    mutate([...GET_ALL_ACCOUNT_GROUP])
    pattern === 'seed-phrase' && mutate([...GET_HD_ACCOUNT_GROUP])
    pattern !== 'seed-phrase' && mutate([...GET_PK_ACCOUNT_GROUP])
  }
  const importGroup = () => {
    let method = ''
    let keygenType = ''
    const params = {
      password: createdPassword,
      nickname: name || keygenNamePlaceholder,
    }
    if (pattern === 'private-key') {
      method = 'wallet_importPrivateKey'
      keygenType = 'privateKey'
    } else {
      method = 'wallet_importMnemonic'
      keygenType = 'mnemonic'
    }
    params[keygenType] = keygen
    return request(method, params)
  }

  const importAccount = async () => {
    if (
      !creatingAccount &&
      name.length <= 20 &&
      !keygenErrorMessage &&
      keygen
    ) {
      setCreatingAccount(true)
      try {
        const res = await importGroup()
        if (res?.error) {
          throw res.error
        }
        if (res.result) {
          setCreatingAccount(false)
          dispatchMutate()
          history.push('/')
        }
      } catch (err) {
        setCreatingAccount(false)
        err.message && setKeygenErrorMessage(err.message.split('\n')[0])
      }
    }
  }

  const onCreate = () => {
    validateKeygen(keygen)
    importAccount()
  }

  return (
    <div className="bg-bg  h-full flex flex-col">
      <TextNav hasGoBack={true} title={t(`${lanPrefix}Import`)} />
      <main className="px-3 flex-1 flex flex-col">
        <form
          onSubmit={e => {
            e.preventDefault()
          }}
          className="flex flex-col justify-between h-full"
        >
          <section>
            <CompWithLabel label={t(`${lanPrefix}GroupName`)}>
              <Input
                onChange={changeName}
                width="w-full"
                placeholder={keygenNamePlaceholder}
                maxLength="20"
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
                className="resize-none"
                textareaSize="h-40"
              ></Input>
            </CompWithLabel>
          </section>
          <section className="h-14">
            <Button className="w-70  mx-auto" onClick={onCreate}>
              {t('import')}
            </Button>
          </section>
        </form>
      </main>
    </div>
  )
}

export default ImportAccount
