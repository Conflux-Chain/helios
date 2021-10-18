import PropTypes from 'prop-types'
import {useState} from 'react'
import {SlideCard} from '../../../components'
import {useTranslation} from 'react-i18next'
import {WrapIcon, SearchToken, TokenItem} from '../../../components'
import {SelectedOutlined, PlusOutlined} from '@fluent-wallet/component-icons'

function AddToken({onClose, onOpen}) {
  const {t} = useTranslation()
  const [searchContent, setSearchContent] = useState('')
  const onAddToken = () => {}
  const searchResults = []

  const onChangeValue = value => {
    // TODO: search logic
    setSearchContent(value)
  }

  return (
    <SlideCard
      cardTitle={t('addToken')}
      onClose={onClose}
      onOpen={onOpen}
      cardContent={
        <div className="mt-4">
          <SearchToken value={searchContent} onChange={onChangeValue} />
          {searchResults.length ? (
            <div className="px-3 pt-3 mt-3 bg-gray-0 rounded">
              <p className="ml-1 mb-1 text-gray-40">{t('searchResults')}</p>
              {/* TODO: add id for automation testing  */}
              <TokenItem
                maxWidth={135}
                maxWidthStyle="max-w-[135px]"
                rightIcon={
                  <WrapIcon size="w-5 h-5">
                    <SelectedOutlined className="w-3 h-3 text-gray-40" />
                  </WrapIcon>
                }
              />
              <TokenItem
                maxWidth={135}
                maxWidthStyle="max-w-[135px]"
                rightIcon={
                  <WrapIcon size="w-5 h-5" onClick={onAddToken}>
                    <PlusOutlined className="w-3 h-3 text-primary" />
                  </WrapIcon>
                }
              />
            </div>
          ) : (
            <div className="flex  items-center flex-col">
              <img
                src=""
                alt="no result"
                className="w-24 h-24 mt-13 mb-4"
                data-clear-btn="true"
              />
              <p>{t('noResult')}</p>
            </div>
          )}
        </div>
      }
    />
  )
}

AddToken.propTypes = {
  onClose: PropTypes.func.isRequired,
  onOpen: PropTypes.bool,
}

export default AddToken
