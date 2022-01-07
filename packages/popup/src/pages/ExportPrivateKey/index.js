import {useEffect} from 'react'
import {useNavigate} from 'react-router-dom'
import {t} from 'i18next'
import Alert from '@fluent-wallet/component-alert'
import {TitleNav, IdentityPanel} from '../../components'
import useGlobalStore from '../../stores'
import {ROUTES} from '../../constants'
const {HOME} = ROUTES

function ExportPrivateKey() {
  const {exportPrivateKey, setExportPrivateKey} = useGlobalStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (!exportPrivateKey) {
      navigate(HOME)
    }
    return () => {
      setExportPrivateKey('')
    }
  }, [setExportPrivateKey, exportPrivateKey, navigate])

  return (
    <div
      id="export-private-key"
      className="h-full w-full pb-6 bg-bg flex flex-col"
    >
      <div className="flex-1">
        <TitleNav title={t('backupPk')} />
        <div className="px-3 pt-3">
          <IdentityPanel title={t('pKey')} content={exportPrivateKey} />
        </div>
      </div>
      <div className="px-3">
        <Alert
          type="warning"
          content={t('backupPkDes')}
          open={true}
          width="w-full"
          closable={false}
        />
      </div>
    </div>
  )
}

export default ExportPrivateKey
