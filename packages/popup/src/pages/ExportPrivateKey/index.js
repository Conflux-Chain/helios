import {useEffect} from 'react'
import {useHistory} from 'react-router-dom'
import {t} from 'i18next'
import Alert from '@fluent-wallet/component-alert'
import {TitleNav, IdentityPanel} from '../../components'
import useGlobalStore from '../../stores'
import {ROUTES} from '../../constants'
const {HOME} = ROUTES

function ExportPrivateKey() {
  const {exportPrivateKeyData, setExportPrivateKeyData} = useGlobalStore()
  const history = useHistory()

  useEffect(() => {
    if (!exportPrivateKeyData?.length) {
      history.push(HOME)
    }
    return () => {
      setExportPrivateKeyData([])
    }
  }, [setExportPrivateKeyData, exportPrivateKeyData, history])

  return (
    <div
      id="export-private-key"
      className="h-full w-full pb-6 bg-bg flex flex-col"
    >
      <div className="flex-1">
        <TitleNav title={t('backupPk')} />
        <div className="px-3">
          {exportPrivateKeyData.map(({pk, des, subDes}, index) => (
            <div key={des} className={`${index === 0 ? 'mt-2' : 'mt-4'}`}>
              {des && subDes && (
                <div className="ml-1">
                  <div className="text-gray-80 font-medium font-sm">
                    {t(des)}
                  </div>
                  <div className="text-gray-40 text-xs mt-0.5 mb-3">
                    {t(subDes)}
                  </div>
                </div>
              )}
              <IdentityPanel title={t('pKey')} content={pk || ''} />
            </div>
          ))}
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
