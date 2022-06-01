import {useState, useRef, useEffect} from 'react'
import {useDebounce} from 'react-use'
import {useTranslation} from 'react-i18next'
import {TitleNav, SearchInput} from '../../components'
import {Account, Contact, Recent} from './components'

const TABS = ['recent', 'contact', 'account']

function AddressBook() {
  const {t} = useTranslation()

  const [searchContent, setSearchContent] = useState('')
  const [currentTab, setCurrentTab] = useState('recent')

  const [debouncedSearchContent, setDebouncedSearchContent] =
    useState(searchContent)

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
        {TABS.map(tab => (
          <span
            key={tab}
            className="cursor-pointer"
            aria-hidden="true"
            onClick={() => setCurrentTab(tab)}
          >
            {t(tab)}
          </span>
        ))}
      </div>

      <div>
        {TABS.map((tab, index) => (
          <div
            key={tab}
            className={currentTab === tab ? 'visible' : 'invisible h-0'}
          >
            {index === 0 ? (
              <Recent fuzzy={debouncedSearchContent} />
            ) : index === 1 ? (
              <Contact fuzzy={debouncedSearchContent} />
            ) : (
              <Account fuzzy={debouncedSearchContent} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default AddressBook
