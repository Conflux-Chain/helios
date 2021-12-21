import {useEffect} from 'react'
import {useHistory} from 'react-router-dom'
import {t} from 'i18next'
import Alert from '@fluent-wallet/component-alert'
import {TitleNav, IdentityPanel} from '../../components'
import useGlobalStore from '../../stores'
import {ROUTES} from '../../constants'
const {HOME} = ROUTES

function ExportSeed() {
  const {exportSeedPhrase, setExportSeedPhrase} = useGlobalStore()
  const history = useHistory()

  useEffect(() => {
    if (!exportSeedPhrase) {
      history.push(HOME)
    }
    return () => {
      setExportSeedPhrase('')
    }
  }, [setExportSeedPhrase, exportSeedPhrase, history])

  return (
    <div
      id="export-seed"
      className="h-150 w-93 m-auto light pb-6 bg-bg flex flex-col"
    >
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
