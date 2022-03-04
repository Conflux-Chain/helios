import {useTranslation} from 'react-i18next'
import {useSWRConfig} from 'swr'
import Message from '@fluent-wallet/component-message'
import {usePreferences} from '../../hooks/useApi'
import useLoading from '../../hooks/useLoading'
import {TitleNav, SwitchButtonGroup} from '../../components'
import {request} from '../../utils'
import {RPC_METHODS} from '../../constants'
const {WALLET_SET_PREFERENCES, WALLET_GET_PREFERENCES, WALLET_GET_NETWORK} =
  RPC_METHODS

function AdvancedSettings() {
  const {data: preferencesData} = usePreferences()
  const {t} = useTranslation()
  const {setLoading} = useLoading()
  const {mutate} = useSWRConfig()

  console.log('preferencesData', preferencesData)
  const onSwitchMode = (preferencesKey, preferencesValue) => {
    const params = {[preferencesKey]: preferencesValue}
    console.log('params', params)
    setLoading(true)
    request(WALLET_SET_PREFERENCES, params)
      .then(() => {
        Promise.all(
          preferencesKey === 'hideTestNetwork'
            ? [mutate([WALLET_GET_PREFERENCES]), mutate([WALLET_GET_NETWORK])]
            : [mutate([WALLET_GET_PREFERENCES])],
        ).then(() => {
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
        <TitleNav title={t('AdvancedSettings')} />
      </header>
      <main className="mt-1 flex-1 px-6">
        <div>
          <div className="h-13 flex items-center justify-between text-base font-medium">
            {t('priorityConnection')}
          </div>
          <p className="text-sm text-gray-60 mt-1">
            {t('priorityConnectionDes')}
          </p>
        </div>
        <div>
          <div>{t('underCfxProvider')}</div>
          <SwitchButtonGroup
            showLeft={!preferencesData?.overrideWindowDotConflux}
            onSwitch={status =>
              onSwitchMode('overrideWindowDotConflux', !status)
            }
            leftSwitchClassName="!w-8 !h-8 !text-gray-60"
            rightSwitchClassName="!w-8 !h-8"
          />
        </div>
        <div>
          <div>{t('underEtherProvider')}</div>
          <SwitchButtonGroup
            showLeft={!preferencesData?.overrideWindowDotEthereum}
            onSwitch={status =>
              onSwitchMode('overrideWindowDotEthereum', !status)
            }
            leftSwitchClassName="!w-8 !h-8 !text-gray-60"
            rightSwitchClassName="!w-8 !h-8"
          />
        </div>
        <div>-----------------</div>
        <div>
          <div>
            <div>{t('showTestnet')}</div>
            <SwitchButtonGroup
              showLeft={preferencesData?.hideTestNetwork}
              onSwitch={status => onSwitchMode('hideTestNetwork', status)}
              leftSwitchClassName="!w-8 !h-8 !text-gray-60"
              rightSwitchClassName="!w-8 !h-8"
            />
          </div>
          <div>{t('showTestnetDes')}</div>
        </div>
      </main>
    </div>
  ) : null
}

export default AdvancedSettings
