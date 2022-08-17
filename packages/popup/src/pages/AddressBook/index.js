import {useState} from 'react'
import {useDebounce} from 'react-use'
import {useHistory} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import {TitleNav, SearchInput} from '../../components'
import {Account, Contact, Recent} from './components'
import {useCurrentTxStore} from '../../hooks'
import useGlobalStore from '../../stores'

const TABS = ['recent', 'contacts', 'account']

function AddressBook() {
  const {t} = useTranslation()
  const history = useHistory()
  const {setToAddress} = useCurrentTxStore()
  const {setAddressNote} = useGlobalStore()

  const [searchContent, setSearchContent] = useState('')
  const [currentTab, setCurrentTab] = useState('recent')
  const [showAddContact, setShowAddContact] = useState(false)

  const [debouncedSearchContent, setDebouncedSearchContent] =
    useState(searchContent)

  const onJumpToSendTx = ({address = '', note = ''}) => {
    setToAddress(address)
    address && note && setAddressNote({[address]: note})
    history.goBack()
  }

  const onTabClick = tab => {
    setShowAddContact(false)
    setCurrentTab(tab)
  }
  useDebounce(
    () => {
      setDebouncedSearchContent(searchContent)
    },
    200,
    [searchContent],
  )

  return (
    <div id="address-book" className="h-full w-full flex flex-col bg-bg px-3">
      <TitleNav title={t('addressBook')} />
      <SearchInput
        value={searchContent}
        onChange={setSearchContent}
        searchInputWrapperClassName="mt-1"
      />
      <div className="flex items-center w-full justify-between">
        <div className="flex border-b border-[#E0E4FC] w-max mt-3 px-2">
          {TABS.map(tab => (
            <div
              key={tab}
              className={`relative cursor-pointer pb-2 px-[3px] ${
                currentTab === tab ? 'text-gray-80 font-medium' : 'text-gray-40'
              }`}
              aria-hidden="true"
              id={`tab-${tab}`}
              onClick={() => onTabClick(tab)}
            >
              <div>{t(tab)}</div>
              {currentTab === tab && (
                <div className="absolute left-0 -bottom-[1px] w-full h-0.5 bg-[#7084ED] rounded-[1px]" />
              )}
            </div>
          ))}
        </div>
        {currentTab === 'contacts' && (
          <div
            className="cursor-pointer text-primary mt-1 mr-1"
            aria-hidden="true"
            id="add-contact"
            onClick={() => setShowAddContact(true)}
          >
            {t('add')}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-hidden pb-4">
        {TABS.map((tab, index) => (
          <div
            key={tab}
            className={`h-full ${currentTab === tab ? '' : 'hidden'}`}
          >
            {index === 0 ? (
              <Recent
                fuzzy={debouncedSearchContent}
                onJumpToSendTx={onJumpToSendTx}
              />
            ) : index === 1 ? (
              <Contact
                fuzzy={debouncedSearchContent}
                showAddContact={showAddContact}
                setShowAddContact={setShowAddContact}
                onJumpToSendTx={onJumpToSendTx}
              />
            ) : (
              <Account
                fuzzy={debouncedSearchContent}
                onJumpToSendTx={onJumpToSendTx}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default AddressBook
