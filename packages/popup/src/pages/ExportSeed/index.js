import {useEffect} from 'react'
import {t} from 'i18next'
import useGlobalStore from '../../stores'
import {TitleNav, WrapIcon} from '../../components'

function ExportSeed() {
  return (
    <div id="export-seed">
      <TitleNav title={t('backupIdentity')} />
    </div>
  )
}

export default ExportSeed
