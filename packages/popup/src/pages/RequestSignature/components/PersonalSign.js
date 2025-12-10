import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {CompWithLabel} from '../../../components'
import {useMemo} from 'react'
import {isHexString} from '@fluent-wallet/utils'
import {hexToString} from '../../../utils'

export const PersonalSign = ({personalSignData}) => {
  const {t} = useTranslation()

  const personaMessage = useMemo(() => {
    if (isHexString(personalSignData)) {
      const str = hexToString(personalSignData)
      return str === null ? personalSignData : str
    }
    return personalSignData
  }, [personalSignData])

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
        {personaMessage
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
