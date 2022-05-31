import {useState} from 'react'

import {useTranslation} from 'react-i18next'
import {TitleNav, ContactItem} from '../../components'

function Contacts() {
  const {t} = useTranslation()

  const [showAddContact, setShowAddContact] = useState(false)

  return (
    <div id="contacts" className="h-full w-full  flex flex-col">
      <TitleNav
        title={t('contacts')}
        rightButton={
          <span onClick={() => setShowAddContact(true)} aria-hidden="true">
            {t('add')}
          </span>
        }
      />
      {showAddContact && <ContactItem />}
    </div>
  )
}

export default Contacts
