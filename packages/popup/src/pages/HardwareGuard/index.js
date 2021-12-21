import PropTypes from 'prop-types'
import Button from '@fluent-wallet/component-button'
import {useTranslation} from 'react-i18next'
import {TitleNav, DiscSerialNumber} from '../../components/'
import {ROUTES} from '../../constants'

const {CONNECT_HARDWARE_WALLET} = ROUTES
function StepItem({serialNumber, des, isLast = false}) {
  const {t} = useTranslation()

  return (
    <div>
      <div className="flex items-center">
        <DiscSerialNumber serialNumber={serialNumber} />
        <span className="font-medium	ml-3 text-base text-gray-80">
          {t('steps', {number: serialNumber})}
        </span>
      </div>
      <div className={`h-13 ml-[11px] mt-2 ${!isLast ? 'mb-4' : ''} relative`}>
        <div className="text-gray-60 text-sm ml-6">{des}</div>
        {!isLast ? (
          <div className="absolute h-11 bg-gray-20 w-0.5 bottom-0 rounded" />
        ) : null}
      </div>
    </div>
  )
}

StepItem.propTypes = {
  serialNumber: PropTypes.string.isRequired,
  des: PropTypes.string.isRequired,
  isLast: PropTypes.bool,
}

function HardwareGuard() {
  const {t} = useTranslation()

  const onClick = () => {
    window &&
      location &&
      window.open(
        `${location.origin}/${location.pathname}#${CONNECT_HARDWARE_WALLET}`,
      )
  }
  return (
    <div
      id="hardware-guard"
      className="flex flex-col h-150 w-93 m-auto light bg-hardware-background pb-4"
    >
      <div className="flex-1 px-4">
        <TitleNav title={t('connectHardwareWallet')} />
        <div className="mt-3 rounded-xl px-4 pt-4 pb-8 bg-guard-banner">
          <p className="text-sm text-gray-80 mb-2 font-medium">
            {t('supportLedger')}
          </p>
          <a
            href="/"
            target="_blank"
            id="ledger-guard-link"
            className="text-primary w-56 block text-sm"
          >
            {t('ledgerGuardDes')}
          </a>
        </div>
        <div className="font-medium	text-sm px-2 mt-8 mb-4">
          {t('followConnectLedgerSteps')}
        </div>
        <div className="px-2">
          <StepItem serialNumber="1" des={t('pluginHardwareWallet')} />
          <StepItem serialNumber="2" des={t('enterPinCode')} />
          <StepItem
            serialNumber="3"
            des={t('selectConfluxApp')}
            isLast={true}
          />
        </div>
      </div>
      <div className="w-70 mx-auto">
        <Button id="ready" fullWidth onClick={onClick}>
          {t('ready')}
        </Button>
      </div>
    </div>
  )
}

export default HardwareGuard
