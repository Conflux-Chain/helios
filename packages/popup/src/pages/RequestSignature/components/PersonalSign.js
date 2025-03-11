import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {CompWithLabel} from '../../../components'
import Alert from '@fluent-wallet/component-alert'

export const PersonalSign = ({personalSignData, isHw}) => {
  const {t} = useTranslation()

  return (
    <main className="rounded-t-xl pt-4 px-3 bg-gray-0">
      <CompWithLabel
        label={
          <p id="labelDes" className="font-medium">
            {t('signThisText')}
          </p>
        }
      >
        <div
          id="plaintext"
          className="pl-3 max-h-[316px] pr-3 pt-3 pb-4 rounded bg-gray-4 overflow-auto break-words"
        >
          {personalSignData
            .replace(/\r/g, '\n')
            .split('\n')
            .map(str => (
              <div key={str} className={str ? '' : 'h-[18px]'}>
                {str}
              </div>
            ))}
        </div>
      </CompWithLabel>
      <Alert
        open={isHw}
        className="mt-3"
        type="warning"
        closable={false}
        width="w-full"
        content={t('disablePersonSign')}
      />
    </main>
  )
}

PersonalSign.propTypes = {
  personalSignData: PropTypes.string.isRequired,
  isHw: PropTypes.bool,
}
