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

  const onSwitchMode = (preferencesKey, preferencesValue) => {
    const params = {[preferencesKey]: preferencesValue}
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
          <div className="flex items-center justify-between text-base font-medium">
            {t('priorityConnection')}
          </div>
          <p className="text-sm text-gray-60 mt-1">
            {t('priorityConnectionDes')}
          </p>
        </div>
        <div className="flex items-center justify-between h-13 mt-3">
          <div className="text-gray-80 text-sm font-medium">
            {t('underCfxProvider')}
          </div>
          <SwitchButtonGroup
            showLeft={!preferencesData?.overrideWindowDotConflux}
            onSwitch={status =>
              onSwitchMode('overrideWindowDotConflux', !status)
            }
            leftSwitchClassName="!w-8 !h-8 !text-gray-60"
            rightSwitchClassName="!w-8 !h-8"
            WrapperId="takeover-conflux"
          />
        </div>
        <div className="flex items-center justify-between h-13">
          <div className="text-gray-80 text-sm font-medium">
            {t('underEtherProvider')}
          </div>
          <SwitchButtonGroup
            showLeft={!preferencesData?.overrideWindowDotEthereum}
            onSwitch={status =>
              onSwitchMode('overrideWindowDotEthereum', !status)
            }
            leftSwitchClassName="!w-8 !h-8 !text-gray-60"
            rightSwitchClassName="!w-8 !h-8"
            WrapperId="takeover-eth"
          />
        </div>
        <div className="w-full h-px bg-gray-20 mt-6 mb-3" />
        <div>
          <div className="flex items-center justify-between h-13">
            <div className="text-gray-80 text-base font-medium">
              {t('showTestnet')}
            </div>
            <SwitchButtonGroup
              showLeft={preferencesData?.hideTestNetwork}
              onSwitch={status => onSwitchMode('hideTestNetwork', status)}
              leftSwitchClassName="!w-8 !h-8 !text-gray-60"
              rightSwitchClassName="!w-8 !h-8"
              WrapperId="hide-testnet"
            />
          </div>
          <div className="text-sm text-gray-60 mt-1">{t('showTestnetDes')}</div>
        </div>
      </main>
    </div>
  ) : null
}

export default AdvancedSettings
