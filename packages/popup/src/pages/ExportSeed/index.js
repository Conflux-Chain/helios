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
    return () => setExportSeedPhrase('')
  }, [setExportSeedPhrase, exportSeedPhrase, history])

  return (
    <div id="export-seed">
      <TitleNav title={t('backupIdentity')} />
      <div>
        <IdentityPanel title={t('seedPhrase')} content={exportSeedPhrase} />
        <Alert
          type="warning"
          content={t('backupSeedDes')}
          open={true}
          width="w-full"
          closable={false}
          className="mb-6"
        />
      </div>
    </div>
  )
}

export default ExportSeed
