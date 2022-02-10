import {useTranslation} from 'react-i18next'
import Message from '@fluent-wallet/component-message'
import {TitleNav, SwitchButtonGroup} from '../../components'
import {usePreferences} from '../../hooks/useApi'
import {request} from '../../utils'
import useLoading from '../../hooks/useLoading'
import {RPC_METHODS} from '../../constants'
const {WALLET_SET_PREFERENCES} = RPC_METHODS

function DeveloperMode() {
  const {t} = useTranslation()
  const {data: preferencesData, mutate} = usePreferences()
  const {setLoading} = useLoading()

  const onSwitchMode = status => {
    setLoading(true)
    request(WALLET_SET_PREFERENCES, {
      useModernProviderAPI: status,
    })
      .then(() => {
        mutate().then(() => {
          setLoading(false)
        })
      })
      .catch(e => {
        setLoading(false)
        Message.error({
          content:
            e?.message?.split?.('\n')?.[0] ?? e?.message ?? t('unCaughtErrMsg'),
          top: '10px',
          duration: 1,
        })
      })
  }

  return preferencesData ? (
    <div
      id="developer-mode"
      className="bg-gray-0 pb-4 h-full w-full flex flex-col"
    >
      <header>
        <TitleNav title={t('developerMode')} />
      </header>
      <main className="mt-1 flex-1 px-6">
        <div className="h-13 flex items-center justify-between">
          <div className="text-base font-medium">{t('compatibilityMode')}</div>
          <SwitchButtonGroup
            showLeft={preferencesData?.useModernProviderAPI}
            onSwitch={onSwitchMode}
            leftSwitchClassName="!w-8 !h-8 !text-gray-60"
            rightSwitchClassName="!w-8 !h-8"
          />
        </div>
        <p className="text-sm text-gray-60 mt-1">{t('compatibilityDes')}</p>
      </main>
    </div>
  ) : null
}

export default DeveloperMode
