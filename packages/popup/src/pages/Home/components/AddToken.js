import PropTypes from 'prop-types'
import {useState} from 'react'
import {SlideCard} from '../../../components'
import Input from '@fluent-wallet/component-input'
import {useTranslation} from 'react-i18next'
import {TokenItem} from './'
import {WrapIcon} from '../../../components'
import {
  SelectedOutlined,
  PlusOutlined,
  CloseCircleFilled,
  SearchOutlined,
} from '@fluent-wallet/component-icons'

function AddToken({onClose, showSlideCard}) {
  const {t} = useTranslation()
  const [searchContent, setSearchContent] = useState('')
  const onAddToken = () => {}
  const searchResults = []

  return (
    <SlideCard
      cardTitle={t('addToken')}
      onClose={onClose}
      showSlideCard={showSlideCard}
      cardContent={
        <div className="mt-4">
          <Input
            prefix={<SearchOutlined className="w-4 h-4 text-gray-40" />}
            width="w-full"
            value={searchContent}
            placeholder={t('searchToken')}
            onChange={e => setSearchContent(e.target.value)}
            suffix={
              searchContent ? (
                <CloseCircleFilled className="w-4 h-4 cursor-pointer text-gray-40" />
              ) : null
            }
            onSuffixClick={() => setSearchContent('')}
          />
          {searchResults.length ? (
            <div className="px-3 pt-3 mt-3 bg-gray-0 rounded">
              <p className="ml-1 mb-1 text-gray-40">{t('searchResults')}</p>
              <TokenItem
                maxBalanceSize="small"
                rightIcon={
                  <WrapIcon size="w-5 h-5">
                    <SelectedOutlined className="w-3 h-3 text-primary" />
                  </WrapIcon>
                }
              />
              <TokenItem
                maxBalanceSize="small"
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
  showSlideCard: PropTypes.bool,
}

export default AddToken
