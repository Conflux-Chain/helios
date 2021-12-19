import {useTranslation} from 'react-i18next'
import {useHistory} from 'react-router-dom'
import {useState} from 'react'
import Button from '@fluent-wallet/component-button'
import {Conflux} from '@fluent-wallet/ledger'
import {ROUTES} from '../../../constants'
const cfx = new Conflux()
const {IMPORT_HW_ACCOUNT} = ROUTES

function OpenApp() {
  // TODO: loading
  const [loadingStatus, setLoadingStatus] = useState(false)
  const {t} = useTranslation()
  const history = useHistory()

  const onClick = async () => {
    setLoadingStatus(true)
    if (loadingStatus) {
      return
    }
    const ret = await cfx.isAppOpen()
    setLoadingStatus(false)
    // TODO: deal with query
    ret && history.push(IMPORT_HW_ACCOUNT)
    ret && history.go(0) // sometimes, when you open the conflux app in ledger, we should refresh the page
  }

  return (
    <div className="flex flex-col items-center">
      <img src="/images/open-conflux-app.svg" alt="connect" />
      <div className="w-110 text-center">
        <p className="text-gray-80 text-lg font-medium mb-2">
          {t('openConfluxApp')}
        </p>
        <p className="text-gray-60 text-sm">{t('openConfluxAppDes')}</p>
      </div>
      <Button id="hm-btn" size="large" className="w-70 mt-9" onClick={onClick}>
        {t('next')}
      </Button>
    </div>
  )
}

export default OpenApp
