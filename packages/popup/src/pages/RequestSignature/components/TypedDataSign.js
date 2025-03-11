import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {CompWithLabel} from '../../../components'
import Alert from '@fluent-wallet/component-alert'
import PlaintextMessage from './PlaintextMessage'

export const TypedDataSign = ({plaintextData, isHw}) => {
  const {t} = useTranslation()

  return (
    <main className="rounded-t-xl pt-4 px-3 bg-gray-0">
      <div className="ml-1" id="signTypeMsgDes">
        <div className="text-sm text-gray-80 font-medium">
          {t('signThisMessage')}
        </div>
        <div className="text-xs text-gray-40 mt-1">
          {plaintextData?.domain?.name}
        </div>
      </div>

      <CompWithLabel
        label={
          <p id="labelDes" className="font-medium">
            {t('message')}
          </p>
        }
      >
        <div
          id="plaintext"
          className={`${'pl-1 max-h-[282px]'} pr-3 pt-3 pb-4 rounded bg-gray-4 overflow-auto break-words`}
        >
          {<PlaintextMessage message={plaintextData?.message ?? {}} />}
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

TypedDataSign.propTypes = {
  plaintextData: PropTypes.object.isRequired,
  isHw: PropTypes.bool,
}
