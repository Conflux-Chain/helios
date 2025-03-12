import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {CompWithLabel} from '../../../components'

export const PersonalSign = ({personalSignData}) => {
  const {t} = useTranslation()

  return (
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
  )
}

PersonalSign.propTypes = {
  personalSignData: PropTypes.string.isRequired,
}
