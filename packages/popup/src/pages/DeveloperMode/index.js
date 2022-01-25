import {useState} from 'react'
import {useTranslation} from 'react-i18next'
import {TitleNav, SwitchButtonGroup} from '../../components'

function DeveloperMode() {
  const {t} = useTranslation()
  const [incompatibility, setIncompatibility] = useState(false)
  const onSwitchMode = status => {
    setIncompatibility(status)
  }

  return (
    <div id="dev-mode" className="bg-gray-0 pb-4 h-full w-full flex flex-col">
      <header>
        <TitleNav title={t('developerMode')} />
      </header>
      <main className="mt-1 flex-1 px-6">
        <div className="h-13 flex items-center justify-between">
          <div className="text-base font-medium">{t('compatibilityMode')}</div>
          <SwitchButtonGroup
            showLeft={incompatibility}
            onSwitch={onSwitchMode}
            leftSwitchClassName="!w-8 !h-8 !text-gray-60"
            rightSwitchClassName="!w-8 !h-8"
          />
        </div>
        <p className="text-sm text-gray-60 mt-1">{t('compatibilityDes')}</p>
      </main>
    </div>
  )
}

export default DeveloperMode
