import PropTypes from 'prop-types'
import {useState, useEffect} from 'react'
import {ActionSheet} from '../../../components'
import Input from '@fluent-wallet/component-input'
import {SearchOutlined} from '@fluent-wallet/component-icons'
import {useTranslation} from 'react-i18next'

function AddToken({title, onClose, showActionSheet}) {
  const {t} = useTranslation()
  const [searchContent, setSearchContent] = useState('')

  return (
    <ActionSheet
      title={title}
      onClose={onClose}
      showActionSheet={showActionSheet}
    >
      <Input
        prefix={<SearchOutlined className="w-4 h-4" />}
        width="w-full"
        value={searchContent}
        placeholder={t('searchToken')}
        onChange={e => setSearchContent(e.target.value)}
      />
      <div></div>
    </ActionSheet>
  )
}
AddToken.propTypes = {
  title: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  showActionSheet: PropTypes.bool,
}
export default AddToken
