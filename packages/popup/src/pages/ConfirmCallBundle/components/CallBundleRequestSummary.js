import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {QuestionCircleOutlined} from '@fluent-wallet/component-icons'
import Tooltip from '@fluent-wallet/component-tooltip'
import TransactionAssetDetails from '../../../components/TransactionAssetDetails'

function CallBundleRequestSummary({callCount, tx, sessionId}) {
  const {t} = useTranslation()

  return (
    <section
      className="flex flex-col items-center gap-[7px] px-3 pt-4 pb-6 mb-4 rounded-t-[8px] bg-no-repeat bg-bottom bg-cover"
      style={{
        backgroundImage: 'url(/images/signature-request-bg.svg)',
      }}
    >
      <h2 className="flex items-center gap-1 text-base font-medium leading-[18px] text-primary">
        <img src="/images/sign-icon.svg" width={12} height={12} alt="" />
        {t('signatureRequest')}
      </h2>

      <div className="flex items-center justify-center gap-1 text-sm leading-4 text-gray-40">
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
      <TransactionAssetDetails tx={tx} sessionId={sessionId} />
    </section>
  )
}

CallBundleRequestSummary.propTypes = {
  callCount: PropTypes.number.isRequired,
  sessionId: PropTypes.string,
  tx: PropTypes.object,
}

export default CallBundleRequestSummary
