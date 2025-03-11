import PropTypes from 'prop-types'
import Alert from '@fluent-wallet/component-alert'
import {CompWithLabel, CurrentNetworkDisplay} from '../../../components'
import {useTranslation} from 'react-i18next'

export const SignInSign = ({isHw, parsedMessage, currentNetwork}) => {
  const {t} = useTranslation()
  return (
    <main className="rounded-t-xl pt-4 px-3 bg-gray-0">
      <div className="ml-1" id="signTypeMsgDes">
        <div className="text-sm text-gray-80 font-medium">
          {t('signWithEthereum')}
        </div>
      </div>

      <CompWithLabel>
        <div
          id="plaintext"
          className={`${'pl-1 max-h-[282px]'} pr-3 pt-3 pb-4 rounded bg-gray-4 overflow-auto break-words`}
        >
          <div className="info-list-container flex flex-col">
            <div className="flex justify-between mb-4">
              <span className="text-gray-40 mr-2">Message</span>
              <span>{parsedMessage?.statement}</span>
            </div>

            <div className="flex justify-between mb-4">
              <span className="text-gray-40 mr-2">URL</span>
              <span>{parsedMessage?.uri}</span>
            </div>

            <div className="flex justify-between mb-4">
              <span className="text-gray-40 mr-2">Network</span>
              <CurrentNetworkDisplay
                contentClassName="mr-1"
                currentNetwork={currentNetwork}
              />
            </div>

            <div className="flex justify-between mb-4">
              <span className="text-gray-40 mr-2">Account</span>
              <span className="break-all">{parsedMessage?.address}</span>
            </div>

            <div className="flex justify-between mb-4">
              <span className="text-gray-40 mr-2">Version</span>
              <span>{parsedMessage?.version}</span>
            </div>

            <div className="flex justify-between mb-4">
              <span className="text-gray-40 mr-2">Chain ID</span>
              <span>{parsedMessage?.chainId}</span>
            </div>

            <div className="flex justify-between mb-4">
              <span className="text-gray-40 mr-2">Nonce</span>
              <span>{parsedMessage?.nonce}</span>
            </div>

            <div className="flex justify-between mb-4">
              <span className="text-gray-40 mr-2">Issued</span>
              <span>{parsedMessage?.issuedAt}</span>
            </div>
          </div>
        </div>
      </CompWithLabel>
      <Alert
        open={isHw}
        className="mt-3"
        type="warning"
        closable={false}
        width="w-full"
        content={t('disableTypeSign')}
      />
    </main>
  )
}

SignInSign.propTypes = {
  isHw: PropTypes.bool,
  parsedMessage: PropTypes.object,
  currentNetwork: PropTypes.object,
}
