import PropTypes from 'prop-types'
import Button from '@fluent-wallet/component-button'
import {HeartBeatOutlined} from '@fluent-wallet/component-icons'
import {useTranslation, Trans} from 'react-i18next'
import {
  TitleNav,
  DiscSerialNumber,
  CurrentNetworkDisplay,
} from '../../components/'
import {ROUTES, NETWORK_TYPE} from '../../constants'
import {useCurrentAddress} from '../../hooks/useApi'

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
  const {
    data: {
      network: {type: networkType, name: chainName},
    },
  } = useCurrentAddress()

  const onClick = () => {
    window &&
      location &&
      window.open(
        `${location.origin}${location.pathname.replace(
          'popup.html',
          'page.html',
        )}#${CONNECT_HARDWARE_WALLET}`,
      )
  }

  return (
    <div
      id="hardware-guard"
      className="flex flex-col h-full w-full bg-hardware-background pb-4"
    >
      <div className="flex-1 px-4">
        <TitleNav title={t('connectHardwareWallet')} />
        <div className="flex items-center mt-3">
          <HeartBeatOutlined className="text-[#333] w-4 h-4 mr-1" />
          <Trans
            i18nKey="specifiedConnectedChain"
            values={{chainName: chainName || ''}}
            components={{
              Container: <div className="flex items-center text-gray-80" />,
              Content: <div className="mr-1" />,
              CurrentNetworkDisplay: (
                <CurrentNetworkDisplay
                  contentClassName={`${
                    networkType == NETWORK_TYPE.CFX
                      ? 'text-[#1E3DE4]'
                      : 'text-[#17B38A]'
                  } font-medium`}
                />
              ),
            }}
          />
        </div>
        <div
          className={`mt-3 rounded-xl px-4 bg-guard-banner h-[110px] flex flex-col ${
            networkType == NETWORK_TYPE.CFX ? 'pt-4' : 'justify-center'
          }`}
        >
          <p className="text-sm text-gray-80 font-medium">
            {t('supportLedger')}
          </p>
          {networkType == NETWORK_TYPE.CFX && (
            <a
              href="https://fluent-wallet.zendesk.com/hc/en-001/articles/4414201694235-Set-up-the-Ledger-Nano-S-and-install-the-Conflux-Ledger-App"
              target="_blank"
              id="ledger-guard-link"
              className="text-primary w-56 block text-sm mt-2"
              rel="noreferrer"
            >
              {t('ledgerGuardDes')}
            </a>
          )}
        </div>
        <div className="font-medium	text-sm px-2 mt-8 mb-4">
          {t('followConnectLedgerSteps')}
        </div>
        <div className="px-2">
          <StepItem serialNumber="1" des={t('pluginHardwareWallet')} />
          <StepItem serialNumber="2" des={t('enterPinCode')} />
          <StepItem
            serialNumber="3"
            des={t('selectConfluxApp', {chainName})}
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
