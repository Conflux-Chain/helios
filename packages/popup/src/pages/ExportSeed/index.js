import {useEffect} from 'react'
import {useNavigate} from 'react-router-dom'
import {t} from 'i18next'
import Alert from '@fluent-wallet/component-alert'
import {TitleNav, IdentityPanel} from '../../components'
import useGlobalStore from '../../stores'
import {ROUTES} from '../../constants'
const {HOME} = ROUTES

function ExportSeed() {
  const {exportSeedPhrase, setExportSeedPhrase} = useGlobalStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (!exportSeedPhrase) {
      navigate(HOME)
    }
    return () => {
      setExportSeedPhrase('')
    }
  }, [setExportSeedPhrase, exportSeedPhrase, navigate])

  return (
    <div id="export-seed" className="h-full w-full pb-6 bg-bg flex flex-col">
      <div className="flex-1">
        <TitleNav title={t('backupIdentity')} />
        <div className="px-3 pt-3">
          <IdentityPanel title={t('seedPhrase')} content={exportSeedPhrase} />
        </div>
      </div>
      <div className="px-3">
        <Alert
          type="warning"
          content={t('backupSeedDes')}
          open={true}
          width="w-full"
          closable={false}
        />
      </div>
    </div>
  )
}

export default ExportSeed
