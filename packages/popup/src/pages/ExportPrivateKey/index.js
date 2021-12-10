import {useEffect} from 'react'
import {useHistory} from 'react-router-dom'
import {t} from 'i18next'
import Alert from '@fluent-wallet/component-alert'
import {TitleNav, IdentityPanel} from '../../components'
import useGlobalStore from '../../stores'
import {ROUTES} from '../../constants'
const {HOME} = ROUTES

function ExportPrivateKey() {
  const {exportPrivateKey, setExportPrivateKey} = useGlobalStore()
  const history = useHistory()

  console.log('exportPrivateKey', exportPrivateKey)
  useEffect(() => {
    if (!exportPrivateKey) {
      history.push(HOME)
    }
    return () => setExportPrivateKey('')
  }, [setExportPrivateKey, exportPrivateKey, history])

  return (
    <div id="export-private-key">
      <TitleNav title={t('backupPk')} />
      <div>
        <IdentityPanel title={t('pKey')} content={exportPrivateKey} />
        <Alert
          type="warning"
          content={t('backupPkDes')}
          open={true}
          width="w-full"
          closable={false}
          className="mb-6"
        />
      </div>
    </div>
  )
}

export default ExportPrivateKey
