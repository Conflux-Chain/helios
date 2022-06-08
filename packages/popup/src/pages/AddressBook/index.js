import {useState} from 'react'
import {useDebounce} from 'react-use'
import {useHistory} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import {TitleNav, SearchInput} from '../../components'
import {Account, Contact, Recent} from './components'
import {useCurrentTxStore} from '../../hooks'
import {ROUTES} from '../../constants'

const {SEND_TRANSACTION} = ROUTES
const TABS = ['recent', 'contact', 'account']

function AddressBook() {
  const {t} = useTranslation()
  const history = useHistory()
  const {setToAddress} = useCurrentTxStore()

  const [searchContent, setSearchContent] = useState('')
  const [currentTab, setCurrentTab] = useState('recent')
  const [showAddContact, setShowAddContact] = useState(false)

  const [debouncedSearchContent, setDebouncedSearchContent] =
    useState(searchContent)

  const onJumpToSendTx = (address = '') => {
    setToAddress(address)
    history.push(SEND_TRANSACTION)
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
    <div id="address-book" className="h-full w-full flex flex-col">
      <TitleNav title={t('contacts')} />
      <SearchInput value={searchContent} onChange={setSearchContent} />
      <div>
        <span>
          {TABS.map(tab => (
            <span
              key={tab}
              className="cursor-pointer"
              aria-hidden="true"
              id={`tab-${tab}`}
              onClick={() => onTabClick(tab)}
            >
              {t(tab)}
            </span>
          ))}
        </span>
        {currentTab === 'contact' && (
          <span
            className="cursor-pointer"
            aria-hidden="true"
            id="add-contact"
            onClick={() => setShowAddContact(true)}
          >
            {t('add')}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-auto no-scroll">
        {TABS.map((tab, index) => (
          <div
            key={tab}
            className={currentTab === tab ? 'visible' : 'invisible h-0'}
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
