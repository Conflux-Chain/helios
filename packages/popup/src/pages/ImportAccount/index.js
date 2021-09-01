import {useState} from 'react'
import {useParams} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import {TextNav} from '../../components/index'
import Button from '@cfxjs/component-button'
import Input from '@cfxjs/component-input'
import {CompWithLabel} from '../../components'

function ImportAccount() {
  const [name, setName] = useState('')
  const [keygen, setKeygen] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [keygenErrorMessage, setKeygenErrorMessage] = useState('')

  const {t} = useTranslation()
  const {pattern} = useParams()
  const lanPrefix = pattern === 'seed-phrase' ? 'seed' : 'pKey'

  // TODO: Error msg
  const validateName = name => {
    setErrorMessage(name === '' ? 'Required!' : '')
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
  const importAccount = () => {
    validateName(name)
    validateKeygen(keygen)
    if (!errorMessage && !keygenErrorMessage && name && keygen) {
      console.log('name', name, keygen)
    }
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
            onClick={importAccount}
          >
            {t('import')}
          </Button>
        </form>
      </main>
    </div>
  )
}

export default ImportAccount
