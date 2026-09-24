import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {QuestionCircleOutlined} from '@fluent-wallet/component-icons'
import Tooltip from '@fluent-wallet/component-tooltip'

function CallBundleRequestSummary({callCount}) {
  const {t} = useTranslation()

  return (
    <section className="relative flex min-h-[81px] flex-col items-center gap-[7px] px-3 py-4">
      <img
        src="/images/signature-request-bg.svg"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full"
      />
      <h2 className="relative flex items-center gap-1 text-base font-medium leading-[18px] text-primary">
        <img src="/images/sign-icon.svg" width={12} height={12} alt="" />
        {t('signatureRequest')}
      </h2>

      <div className="relative flex items-center justify-center gap-1 text-sm leading-4 text-gray-40">
        <span>{t('callBundleTransactionCount', {count: callCount})}</span>
        <Tooltip
          placement="bottom"
          trigger={['hover', 'focus']}
          content={
            <p className="w-60">{t('callBundleAtomicExecutionDescription')}</p>
          }
        >
          <button
            type="button"
            aria-label={t('callBundleAtomicExecution')}
            className="flex h-4 w-4 shrink-0 items-center justify-center"
          >
            <QuestionCircleOutlined className="h-4 w-4" />
          </button>
        </Tooltip>
      </div>
    </section>
  )
}

CallBundleRequestSummary.propTypes = {
  callCount: PropTypes.number.isRequired,
}

export default CallBundleRequestSummary
