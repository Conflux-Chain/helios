import {useTranslation} from 'react-i18next'
import {useState} from 'react'
import Button from '@fluent-wallet/component-button'
import Input from '@fluent-wallet/component-input'
import {CaretDownFilled} from '@fluent-wallet/component-icons'

function ConnectSite() {
  const [searchContent, setSearchContent] = useState('')
  const {t} = useTranslation()
  return (
    <>
      <header>
        <p>{t('connectSite')}</p>
        <div>
          <div />
          <div>
            <img src="" alt="favicon" />
          </div>
          <div />
          <img src="images/paperclip.svg" alt="connecting" />
          <div />
          <div>
            <img className="w-6 h-6" src="images/logo.svg" alt="logo" />
          </div>
          <div />
        </div>
        <p>dapp name</p>
      </header>
      <main>
        <p>{t('selectNetwork')}</p>
        <div aria-hidden onClick={() => {}}>
          <Input
            value={searchContent}
            width="w-full box-border"
            readOnly={true}
            className="pointer-events-none"
            suffix={<CaretDownFilled className="w-4 h-4 text-gray-40" />}
          />
        </div>
      </main>
      <footer></footer>
    </>
  )
}

export default ConnectSite
