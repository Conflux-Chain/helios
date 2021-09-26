import PropTypes from 'prop-types'
import {useState} from 'react'
import {SlideCard} from '../../../components'
import Input from '@fluent-wallet/component-input'
import {SearchOutlined} from '@fluent-wallet/component-icons'
import {useTranslation} from 'react-i18next'

function AddToken({onClose, showSlideCard}) {
  const {t} = useTranslation()
  const [searchContent, setSearchContent] = useState('')
  return (
    <SlideCard
      cardTitle={t('addToken')}
      onClose={onClose}
      showSlideCard={showSlideCard}
      cardContent={
        <Input
          prefix={<SearchOutlined className="w-4 h-4" />}
          width="w-full"
          value={searchContent}
          placeholder={t('searchToken')}
          onChange={e => setSearchContent(e.target.value)}
          className="!pl-px"
          prefixClassName="!mr-1.5"
        />
      }
    />
  )
}

AddToken.propTypes = {
  onClose: PropTypes.func.isRequired,
  showSlideCard: PropTypes.bool,
}

export default AddToken
