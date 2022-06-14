import PropTypes from 'prop-types'
import {useState, useEffect} from 'react'
import {useTranslation} from 'react-i18next'

import {useCurrentNetworkAddressMemo} from '../../../hooks/useApi'

import {ContactItem, ContactList, NoResult} from '../../../components'
function Contact({
  fuzzy = '',
  showAddContact = false,
  setShowAddContact,
  onJumpToSendTx,
}) {
  const {t} = useTranslation()

  const [contactList, setContactList] = useState(undefined)

  const {data: memoData, mutate} = useCurrentNetworkAddressMemo({
    fuzzy,
    g: {
      eid: 1,
      value: 1,
      gaddr: {
        value: 1,
      },
    },
  })

  const onAddedCallBack = async () => {
    await mutate()
    setShowAddContact?.(false)
  }

  useEffect(() => {
    if (memoData?.data) {
      setContactList([...memoData.data])
    }
  }, [memoData])

  return (
    <div className="h-full w-full  flex flex-col">
      {showAddContact && (
        <ContactItem
          onSubmitCallback={onAddedCallBack}
          onClickAwayCallback={() => setShowAddContact?.(false)}
        />
      )}
      <div className="flex-1 overflow-auto no-scroll">
        {contactList?.length > 0 && (
          <ContactList list={contactList} onClickContact={onJumpToSendTx} />
        )}
        {contactList?.length === 0 && <NoResult content={t('noResult')} />}
      </div>
    </div>
  )
}

Contact.propTypes = {
  fuzzy: PropTypes.string,
  showAddContact: PropTypes.bool,
  setShowAddContact: PropTypes.func,
  onJumpToSendTx: PropTypes.func,
}
export default Contact
