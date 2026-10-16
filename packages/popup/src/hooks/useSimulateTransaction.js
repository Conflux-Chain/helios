import {useTranslation} from 'react-i18next'
import Message from '@fluent-wallet/component-message'
import {usePreferences} from './useApi'
import {canSimulateTransaction, getSimulateUrl} from '../utils/simulateUrl'

export function useSimulateTransaction({
  transaction,
  network,
  sponsorshipLoading = false,
  sponsored = false,
  estimationLoading = false,
  disabled = false,
}) {
  const {t} = useTranslation()
  const {data: preferences} = usePreferences()
  const showSimulate = canSimulateTransaction({
    transaction,
    network,
    enabled: preferences?.enableSimulate,
    sponsorshipLoading,
    sponsored,
  })

  // Wait for estimation to settle, but allow simulation after an estimate fails
  // so users can investigate it. Do not reuse the send button's readiness gate.
  const simulateDisabled = disabled || estimationLoading
  const onSimulate = () => {
    if (!showSimulate || simulateDisabled) return
    try {
      const url = getSimulateUrl(network.scanUrl, transaction)
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch (error) {
      Message.error({
        content: error?.message ?? t('unCaughtErrMsg'),
        top: '10px',
        duration: 3,
      })
    }
  }

  return {showSimulate, simulateDisabled, onSimulate}
}
